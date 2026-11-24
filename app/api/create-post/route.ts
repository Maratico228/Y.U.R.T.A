import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const ALLOWED = [
  'humanities', 'engineering', 'sport', 'ecology', 'economy',
  'oil', 'law', 'polytech', 'general', 'flood',
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      board_slug, nickname, content,
      image_url, parent_id, is_spoiler, captchaToken,
    } = body;

    // --- 1. Проверки данных ---
    if (!ALLOWED.includes(board_slug)) {
      return NextResponse.json({ error: 'Неверный раздел' }, { status: 400 });
    }
    if (!content || !String(content).trim()) {
      return NextResponse.json({ error: 'Пустое сообщение' }, { status: 400 });
    }

    // --- 2. Проверка капчи на сервере ---
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { error: 'На сервере не задана переменная TURNSTILE_SECRET_KEY' },
        { status: 500 },
      );
    }
    if (!captchaToken) {
      return NextResponse.json(
        { error: 'Клиент не прислал токен капчи', codes: ['missing-input-response'] },
        { status: 400 },
      );
    }

    const form = new URLSearchParams();
    form.set('secret', secret);
    form.set('response', captchaToken);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (ip) form.set('remoteip', ip);

    const verifyRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      },
    );
    const verifyData: any = await verifyRes.json();

    if (!verifyData.success) {
      const codes = verifyData['error-codes'] || [];
      console.error('[create-post] captcha rejected:', codes);
      return NextResponse.json(
        { error: 'Капча не прошла проверку', codes },
        { status: 403 },
      );
    }

    // --- 3. Вставка поста ---
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('posts')
      .insert({
        board_slug,
        nickname: nickname ? String(nickname).trim() : null,
        content: String(content).trim(),
        image_url: image_url || null,
        parent_id: parent_id || null,
        is_spoiler: !!is_spoiler,
        created_at: now,
        bumped_at: now,
      })
      .select();

    if (error) {
      console.error('[create-post] db error:', error);
      return NextResponse.json(
        { error: 'Ошибка базы данных: ' + error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    console.error('[create-post] crash:', e);
    return NextResponse.json(
      { error: e?.message || 'Внутренняя ошибка сервера' },
      { status: 500 },
    );
  }
}

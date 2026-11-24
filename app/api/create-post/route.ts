import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { board_slug, nickname, content, image_url, parent_id, is_spoiler, captchaToken } = body;

    // 1. Проверка раздела (защита от подмены URL)
    const allowed = ['humanities', 'engineering', 'sport', 'ecology', 'economy', 'oil', 'law', 'polytech', 'general', 'flood'];
    if (!allowed.includes(board_slug)) {
      return NextResponse.json({ error: 'Неверный раздел' }, { status: 400 });
    }

    // 2. ПРОВЕРКА КАПЧИ НА СЕРВЕРЕ (Главная защита от ботов)
    if (!captchaToken) {
      return NextResponse.json({ error: 'Пройдите проверку капчи' }, { status: 400 });
    }

    const formData = new FormData();
    formData.append('secret', process.env.CLOUDFLARE_SECRET_KEY || '');
    formData.append('response', captchaToken);
    // Опционально: можно добавить remoteip, но для начала хватит и этого

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });
    
    const verifyData = await verifyRes.json();
    
    if (!verifyData.success) {
      console.error('Turnstile verification failed:', verifyData);
      return NextResponse.json({ error: 'Ошибка проверки капчи. Попробуйте еще раз.' }, { status: 403 });
    }

    // 3. Подключение к базе с правами администратора (обходит RLS, но только на сервере!)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 4. Вставка поста
    const { data, error } = await supabase.from('posts').insert({
      board_slug,
      nickname: nickname?.trim() || null,
      content: content?.trim() || '',
      image_url: image_url || null,
      parent_id: parent_id || null,
      is_spoiler: is_spoiler || false,
      created_at: new Date().toISOString(),
      bumped_at: new Date().toISOString()
    }).select();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    console.error('Server error in create-post:', e);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

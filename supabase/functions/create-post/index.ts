import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_BOARDS = [
  'humanities', 'engineering', 'sport', 'ecology', 'economy',
  'oil', 'law', 'polytech', 'general', 'flood'
];

serve(async (req) => {
  // CORS для браузера
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const { board_slug, nickname, content, image_url, parent_id, is_spoiler, captchaToken } = await req.json()

    // 1. Проверка board_slug
    if (!ALLOWED_BOARDS.includes(board_slug)) {
      return new Response(JSON.stringify({ error: 'Invalid board' }), { status: 400 })
    }

    // 2. Проверка капчи Turnstile
    const formData = new FormData()
    formData.append('secret', Deno.env.get('CLOUDFLARE_SECRET_KEY') ?? '')
    formData.append('response', captchaToken)
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      body: formData,
      method: 'POST',
    })
    const verifyData = await verifyRes.json()
    if (!verifyData.success) {
      return new Response(JSON.stringify({ error: 'Captcha failed' }), { status: 403 })
    }

    // 3. Используем service_role для INSERT (обходит RLS, но только на сервере!)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabaseAdmin.from('posts').insert({
      board_slug,
      nickname: nickname || null,
      content,
      image_url: image_url || null,
      parent_id: parent_id || null,
      is_spoiler: is_spoiler || false
    }).select()

    if (error) throw error

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})

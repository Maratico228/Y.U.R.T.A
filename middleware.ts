import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host');
  
  // Если человек зашел через www.y-u-r-t-a.ru
  if (host?.startsWith('www.')) {
    // Перенаправляем на y-u-r-t-a.ru (сохраняя путь)
    const newHost = host.replace('www.', '');
    return NextResponse.redirect(`https://${newHost}${request.nextUrl.pathname}`, 301);
  }
  
  return NextResponse.next();
}

// Применяем только к нужным путям, чтобы не тормозить картинки
export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|logo.png|title.png|banner.gif).*)',
};

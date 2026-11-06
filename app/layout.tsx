import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Юрта (Y.U.R.T.A)",
  description: "Неофициальный форум для свободного анонимного общения в рамках Югорского Государственного Университета",
  openGraph: {
    title: "Юрта (Y.U.R.T.A)",
    description: "Неофициальный форум для свободного анонимного общения в рамках Югорского Государственного Университета",
    url: "https://y-u-r-t-a.ru",
    siteName: "Y.U.R.T.A",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Логотип Y.U.R.T.A",
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* Скрипт, который срабатывает ДО отрисовки страницы и убирает мерцание */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

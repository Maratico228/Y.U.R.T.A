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
        url: "/logo.png", // <--- Изменили на логотип
        width: 800,       // Соцсети сами отмасштабируют, но лучше указать примерные размеры
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
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

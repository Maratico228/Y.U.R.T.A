import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Юрта (Y.U.R.T.A)",
  description: "Анонимная имиджборда UGRASU",
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

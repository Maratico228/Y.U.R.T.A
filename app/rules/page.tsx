"use client";

import { useState, useEffect } from "react";

export default function Rules() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-[#0b141a] text-slate-900 dark:text-slate-200 pb-20 font-sans">
      <header className="bg-white dark:bg-[#1a282d] border-b border-slate-200 dark:border-slate-800 py-4 px-4 shadow-sm mb-8">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/">
            <img src="/logo.png" alt="Logo" style={{ height: '48px', width: 'auto' }} className="dark:brightness-0 dark:invert" />
          </a>
          <a href="/" className="text-blue-700 dark:text-blue-400 hover:underline font-medium">На главную</a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Правила Юрты</h1>
        <div className="bg-white dark:bg-[#1a282d] p-6 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4 text-slate-700 dark:text-slate-300">
          <p className="font-bold text-lg text-slate-900 dark:text-white">Юрта — это место для свободного, но уважительного общения студентов ЮГУ.</p>
          
          <h2 className="text-xl font-bold mt-4 text-slate-900 dark:text-white">1. Что здесь можно?</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Обсуждать учёбу, сессию, преподов (в рамках разумного).</li>
            <li>Делиться мемами, картинками и полезными материалами.</li>
            <li>Анонимно задавать вопросы и получать помощь.</li>
          </ul>

          <h2 className="text-xl font-bold mt-4 text-slate-900 dark:text-white">2. Что строго запрещено (бан без предупреждения)?</h2>
          <ul className="list-disc pl-5 space-y-1 text-red-600 dark:text-red-400 font-medium">
            <li>Доксинг (публикация реальных имён, адресов, номеров телефонов без согласия).</li>
            <li>Травля, оскорбления, разжигание конфликтов.</li>
            <li>NSFW-контент (порнография, шок-контент).</li>
            <li>Спам и реклама.</li>
          </ul>

          <h2 className="text-xl font-bold mt-4 text-slate-900 dark:text-white">3. Анонимность</h2>
          <p>Мы не собираем ваши личные данные. Посты и картинки хранятся в базе без привязки к личности.</p>
        </div>
      </div>
    </main>
  );
}

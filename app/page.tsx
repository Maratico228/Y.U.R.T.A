"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Отключаем анимацию при загрузке страницы
    document.documentElement.style.setProperty('transition', 'none');
    
    if (localStorage.getItem("theme") === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Возвращаем анимацию обратно через 100мс
    const timer = setTimeout(() => {
      document.documentElement.style.removeProperty('transition');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const schools = [
    { name: "Высшая школа гуманитарных наук", slug: "humanities" },
    { name: "Инженерная школа цифровых технологий", slug: "engineering" },
    { name: "Центр образовательного инжиниринга", slug: "education" },
    { name: "Высшая школа физической культуры и спорта", slug: "sport" },
    { name: "Высшая экологическая школа", slug: "ecology" },
    { name: "Высшая школа цифровой экономики", slug: "economy" },
    { name: "Высшая нефтяная школа", slug: "oil" },
    { name: "Высшая школа права", slug: "law" },
    { name: "Политехническая школа", slug: "polytech" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-20 font-sans flex flex-col">
      
      {/* 1. Шапка */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-4 px-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <img 
            src="/logo.png" 
            alt="Логотип Y.U.R.T.A" 
            style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            className="dark:brightness-0 dark:invert" 
          />
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            title={isDark ? "Включить светлую тему" : "Включить темную тему"}
          >
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>
        </div>
      </header>

      {/* 2. Заглавный текст */}
      <div className="max-w-5xl mx-auto px-4 py-8 flex justify-center">
        <img 
          src="/title.png" 
          alt="Заглавный текст" 
          style={{ maxWidth: '400px', maxHeight: '150px', objectFit: 'contain' }} 
          className="dark:brightness-0 dark:invert"
        />
      </div>

      {/* 3. Основной контент */}
      <div className="max-w-5xl mx-auto px-4 flex-grow w-full">
        
        {/* Список школ */}
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-3 border-b-2 border-slate-300 dark:border-slate-600 pb-1 inline-block text-slate-800 dark:text-slate-200">
            Доски Высших школ
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mt-4">
            {schools.map((school) => (
              <li key={school.slug}>
                <a 
                  href={`/board/${school.slug}`}
                  className="text-blue-700 dark:text-blue-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors duration-200 text-[16px] font-medium block"
                >
                  /{school.slug}/ — {school.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Общие разделы */}
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-3 border-b-2 border-slate-300 dark:border-slate-600 pb-1 inline-block text-slate-800 dark:text-slate-200">
            Общие разделы
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mt-4">
            <li>
              <a 
                href="/board/general" 
                className="text-blue-700 dark:text-blue-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors duration-200 text-[16px] font-medium block"
              >
                /general/ — Общая беседа
              </a>
            </li>
            <li>
              <a 
                href="/board/flood" 
                className="text-blue-700 dark:text-blue-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors duration-200 text-[16px] font-medium block"
              >
                /flood/ — Раздел бред
              </a>
            </li>
          </ul>
        </div>

        {/* Тематические беседы */}
        <div>
          <h2 className="text-lg font-bold mb-3 border-b-2 border-slate-300 dark:border-slate-600 pb-1 inline-block text-slate-800 dark:text-slate-200">
            Тематические беседы
          </h2>
          <div className="mt-4 bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-[15px]">
              Бесед пока нет. Если вы хотите добавить новый раздел или подать жалобу на нежелательный контент, пишите на официальную почту «Юрты»: <a href="mailto:officialyurta@gmail.com" className="text-blue-700 dark:text-blue-400 hover:text-teal-700 dark:hover:text-teal-400 hover:underline font-medium">officialyurta@gmail.com</a>
            </p>
          </div>
        </div>

      </div>

      {/* 4. Подвал */}
      <footer className="max-w-5xl mx-auto px-4 w-full mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed text-center">
          Y.U.R.T.A - это особый веб-форум Югорского Государственного Университета, где вы можете анонимно обмениваться сообщениями, картинками и свежей информацией. Будьте вежливы и благоразумны, а за анархией и весельем заходите в раздел "бред" :З
        </p>
      </footer>

    </main>
  );
}

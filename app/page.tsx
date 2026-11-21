"use client";

import { useState, useEffect } from "react"; 
import { getSupabase } from "@/lib/supabase";

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }

    const fetchCounts = async () => {
      const supabase = getSupabase();
      const { data } = await supabase.from('posts').select('board_slug');
      if (data) {
        const countsObj: Record<string, number> = {};
        data.forEach((post: any) => {
          countsObj[post.board_slug] = (countsObj[post.board_slug] || 0) + 1;
        });
        setCounts(countsObj);
      }
    };
    fetchCounts();
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

  const copyLink = () => {
    navigator.clipboard.writeText("https://y-u-r-t-a.ru").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
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
      
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-4 px-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <img 
            src="/logo.png" 
            alt="Логотип Y.U.R.T.A" 
            style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            className="dark:brightness-0 dark:invert" 
          />
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 flex justify-center">
        <img 
          src="/title.png" 
          alt="Заглавный текст" 
          style={{ maxWidth: '400px', maxHeight: '150px', objectFit: 'contain' }} 
          className="dark:brightness-0 dark:invert"
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 w-full mb-10 flex flex-col gap-6">

        {/* НОВАЯ ПЛАШКА С ОБРАЩЕНИЕМ И КНОПКОЙ КОПИРОВАНИЯ */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-6 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide">Важная информация</h2>
          </div>
          
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-6">
            <p>
              Друзья, Юрта продолжает подвергаться попыткам взлома и поиска новых брешей в защите. Но это не повод сдаваться! За последнее время была проделана колоссальная работа над ошибками. еперь наш уютный анонимный уголок стал гораздо безопаснее.
            </p>
            <p className="font-medium text-slate-800 dark:text-slate-200">
              Я очень хочу, чтобы Юрта росла и развивалась. Пожалуйста, поделитесь ссылкой на сайт в своих студенческих чатах, группах и с друзьями. Давайте сделаем это место по-настоящему живым вместе!
            </p>
          </div>

          <button 
            onClick={copyLink}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${copied ? 'bg-green-600 text-white' : 'bg-blue-100 dark:bg-slate-700 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-slate-600'}`}
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Ссылка скопирована!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                Скопировать ссылку
              </>
            )}
          </button>
        </div>

        {/* ССЫЛКИ НА ПРАВИЛА И ИНСТРУКЦИЮ (ОСТАЛИСЬ НА МЕСТЕ) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/rules" className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex items-center gap-4 shadow-sm group">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-700 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Правила Юрты</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Что можно, а что нежелательно</p>
            </div>
          </a>
          
          <a href="/guide" className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex items-center gap-4 shadow-sm group">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Как пользоваться?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Инструкция для новичков</p>
            </div>
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 flex-grow w-full">
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-3 border-b-2 border-slate-300 dark:border-slate-600 pb-1 inline-block text-slate-800 dark:text-slate-200">
            Доски Высших школ
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mt-4">
            {schools.map((school) => (
              <li key={school.slug}>
                <a href={`/board/${school.slug}`} className="text-blue-700 dark:text-blue-400 hover:text-teal-700 dark:hover:text-teal-400 text-[16px] font-medium block">
                  /{school.slug}/ — {school.name}
                  {counts[school.slug] > 0 && <span className="text-slate-400 dark:text-slate-500 text-sm ml-1">[{counts[school.slug]}]</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-10">
          <h2 className="text-lg font-bold mb-3 border-b-2 border-slate-300 dark:border-slate-600 pb-1 inline-block text-slate-800 dark:text-slate-200">
            Общие разделы
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mt-4">
            <li>
              <a href="/board/general" className="text-blue-700 dark:text-blue-400 hover:text-teal-700 dark:hover:text-teal-400 text-[16px] font-medium block">
                /general/ — Общая беседа 
                {counts['general'] > 0 && <span className="text-slate-400 dark:text-slate-500 text-sm ml-1">[{counts['general']}]</span>}
              </a>
            </li>
            <li>
              <a href="/board/flood" className="text-blue-700 dark:text-blue-400 hover:text-teal-700 dark:hover:text-teal-400 text-[16px] font-medium block">
                /flood/ — Раздел бред 
                {counts['flood'] > 0 && <span className="text-slate-400 dark:text-slate-500 text-sm ml-1">[{counts['flood']}]</span>}
              </a>
            </li>
          </ul>
        </div>

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

      <footer className="max-w-5xl mx-auto px-4 w-full mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed text-center">
          Y.U.R.T.A - это неофициальный веб-форум Югорского Государственного Университета, где вы можете анонимно обмениваться сообщениями, картинками и свежей информацией. Будьте вежливы и благоразумны, а за анархией и весельем заходите в раздел "бред" :З
        </p>
      </footer>
    </main>
  );
}

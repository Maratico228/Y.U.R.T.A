"use client";

import { useState, useEffect } from "react"; 
import { getSupabase } from "@/lib/supabase";

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
      
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-4 px-4 shadow-sm relative z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <img 
            src="/logo.png" 
            alt="Логотип Y.U.R.T.A" 
            style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            className="dark:brightness-0 dark:invert" 
          />
          
          <div className="flex items-center gap-4">
            {/* Кнопка "Создать тред" с выпадающим меню */}
            <div className="relative">
              <button 
                onClick={() => setIsCreateOpen(!isCreateOpen)}
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                Создать тред
              </button>
              
              {isCreateOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Выберите доску</div>
                  {[...schools, {name: "Общая беседа", slug: "general"}, {name: "Бред", slug: "flood"}].map((b) => (
                    <a 
                      key={b.slug} 
                      href={`/board/${b.slug}`}
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      /{b.slug}/ — {b.name}
                    </a>
                  ))}
                </div>
              )}
            </div>

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

      <div className="max-w-5xl mx-auto px-4 w-full mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/rules" className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex items-center gap-4 shadow-sm group">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-700 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Правила Юрты</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Что можно, а что запрещено</p>
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

"use client";

import { useState, useEffect } from "react"; 
import { getSupabase } from "@/lib/supabase";

const BOARDS = [
  { name: "Высшая школа гуманитарных наук", slug: "humanities" },
  { name: "Инженерная школа цифровых технологий", slug: "engineering" },
  { name: "Высшая школа физической культуры и спорта", slug: "sport" },
  { name: "Высшая экологическая школа", slug: "ecology" },
  { name: "Высшая школа цифровой экономики", slug: "economy" },
  { name: "Высшая нефтяная школа", slug: "oil" },
  { name: "Высшая школа права", slug: "law" },
  { name: "Политехническая школа", slug: "polytech" },
  { name: "Общая беседа", slug: "general" },
  { name: "Раздел бред", slug: "flood" },
];

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [userVotes, setUserVotes] = useState<Record<number, number>>({});
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme !== "light") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }

    fetchGlobalFeed();
    fetchUser();
    fetchCounts();
  }, []);

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

  const fetchUser = async () => {
    const supabase = getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      fetchUserVotes(session.user.id);
    }
  };

  const fetchUserVotes = async (userId: string) => {
    const supabase = getSupabase();
    const { data } = await supabase.from('votes').select('post_id, vote_type').eq('user_id', userId);
    if (data) {
      const votesMap: Record<number, number> = {};
      // ИСПРАВЛЕНИЕ ЗДЕСЬ
      data.forEach((v: any) => votesMap[v.post_id] = v.vote_type);
      setUserVotes(votesMap);
    }
  };

  const fetchGlobalFeed = async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('posts')
      .select('*')
      .neq('board_slug', 'education')
      .order('created_at', { ascending: false });

    if (data) {
      const postsWithCounts = await Promise.all(data.map(async (post) => {
        const { count } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('parent_id', post.id);
        return { ...post, replyCount: count || 0 };
      }));
      setPosts(postsWithCounts.filter(p => !p.parent_id));
    }
  };

  const handleVote = async (postId: number, type: 1 | -1) => {
    if (!user) {
      alert("Пожалуйста, напишите хотя бы один пост на форуме, чтобы получить право голоса.");
      return;
    }

    const supabase = getSupabase();
    const currentVote = userVotes[postId];

    if (currentVote === type) {
      await supabase.from('votes').delete().match({ post_id: postId, user_id: user.id });
      setUserVotes(prev => { const n = {...prev}; delete n[postId]; return n; });
    } else {
      await supabase.from('votes').upsert({ post_id: postId, user_id: user.id, vote_type: type }, { onConflict: 'post_id,user_id' });
      setUserVotes(prev => ({ ...prev, [postId]: type }));
    }
    
    fetchGlobalFeed(); 
  };

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

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-[#0b141a] text-slate-900 dark:text-slate-200 font-sans">
      
      <header className="bg-white dark:bg-[#1a282d] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 py-3 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/">
            <img src="/logo.png" alt="Logo" style={{ height: '40px', width: 'auto' }} className="dark:brightness-0 dark:invert" />
          </a>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-slate-100 dark:bg-[#121d21] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              {isDark ? (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>)}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-6 flex flex-col lg:flex-row gap-6">
        
        <aside className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-4">
          <div className="bg-white dark:bg-[#1a282d] rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              <h2 className="text-sm font-bold uppercase tracking-wide">Важно</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              Юрта продолжает подвергаться атакам, но мы держим оборону! Безопасность усилена. Пожалуйста, поделитесь ссылкой на сайт в своих студенческих чатах, чтобы здесь стало больше живых людей.
            </p>
            <button onClick={copyLink} className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-bold transition-all ${copied ? 'bg-green-600 text-white' : 'bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 hover:bg-blue-200'}`}>
              {copied ? "Скопировано!" : "Скопировать ссылку"}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <a href="/rules" className="bg-white dark:bg-[#1a282d] px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-colors flex items-center gap-3 group">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              </div>
              <div className="font-bold text-sm">Правила Юрты</div>
            </a>
            <a href="/guide" className="bg-white dark:bg-[#1a282d] px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-colors flex items-center gap-3 group">
              <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </div>
              <div className="font-bold text-sm">Как пользоваться?</div>
            </a>
          </div>

          <div className="bg-white dark:bg-[#1a282d] rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Доски</h3>
            <ul className="flex flex-col gap-1.5">
              {BOARDS.map((school) => (
                <li key={school.slug}>
                  <a href={`/board/${school.slug}`} className="text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex justify-between items-center group">
                    <span className="truncate pr-2">/{school.slug}/</span>
                    {counts[school.slug] > 0 && <span className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">{counts[school.slug]}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="w-full lg:w-2/3 xl:w-3/4 flex flex-col gap-3">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-slate-500">Пока нет постов. Создайте первый!</div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="bg-white dark:bg-[#1a282d] rounded-md border border-slate-200 dark:border-slate-800 flex hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                
                <div className="w-10 sm:w-12 bg-slate-50 dark:bg-[#121d21] rounded-l-md flex flex-col items-center py-2 gap-1 shrink-0">
                  <button onClick={() => handleVote(post.id, 1)} className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${userVotes[post.id] === 1 ? 'text-blue-600 dark:text-blue-500' : 'text-slate-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                  </button>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{(post.likes || 0) - (post.dislikes || 0)}</span>
                  <button onClick={() => handleVote(post.id, -1)} className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${userVotes[post.id] === -1 ? 'text-red-500' : 'text-slate-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                  </button>
                </div>

                <div className="flex-1 p-2 sm:p-4 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <a href={`/board/${post.board_slug}`} className="font-bold text-slate-700 dark:text-slate-300 hover:underline">/{post.board_slug}/</a>
                    <span>•</span>
                    <span>{new Date(post.created_at).toLocaleDateString('ru-RU')}</span>
                    <span>•</span>
                    <span className="text-blue-600 dark:text-blue-400">{post.nickname || "Аноним"}</span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                    {post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content}
                  </h2>

                  {post.image_url && (
                    <div className="mb-3 rounded overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={post.image_url} alt="post" className="w-full h-auto max-h-[500px] object-cover" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-2">
                    <a href={`/board/${post.board_slug}#post-${post.id}`} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1.5 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                      {post.replyCount} Комментариев
                    </a>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

      </div>
    </main>
  );
}

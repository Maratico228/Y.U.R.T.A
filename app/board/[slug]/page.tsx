"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const EMOJIS = [
  "ಠ_ಠ", "( ͡° ͜ʖ ͡°)", ":3", "¯\\_(ツ)_/¯", "(╯°□°)╯︵ ┻━┻",
  "ヽ(´ー｀)┌", "＼(＾▽＾)／", "(⌐■_■)", "(☭ ͜ʖ ☭)", "( ˘ ³˘)♥",
  "(´・ω・`)", "(╥﹏╥)", "ヽ(`Д´)ﾉ", "(╬ Ò﹏Ó)", "(ﾉಥ益ಥ）ﾉ",
  "(っ °Д °;)っ", "┻━┻ ︵ヽ(`Д´)ﾉ︵﻿ ┻━┻", "(ಥ﹏ಥ)", "(T_T)", "( •̀ ω •́ )",
  "(☞ﾟヮﾟ)☞", "(•_•) ( •_•)>⌐■-■", "༼ つ ◕_◕ ༽つ", "(• ε •)", "( ͠° ͟ʖ ͡°)",
  "ᕕ( ᐛ )ᕗ", "( ͡~ ͜ʖ ͡°)", "ლ(ಠ益ಠლ)", "(ง ͠° ͟ل͜ ͡°)ง", "(´･ω･`)"
];

export default function BoardPage({ params }: { params: { slug: string } }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'board' | 'catalog'>('board');
  const [showEmojis, setShowEmojis] = useState(false);

  // Состояние темы
  const [isDark, setIsDark] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  const boardInfo: Record<string, { name: string, description: string }> = {
    humanities: { name: "Гуманитарные науки", description: "Беседа Высшей школы гуманитарных наук." },
    engineering: { name: "Инженерная школа", description: "Беседа Инженерной школы цифровых технологий." },
    education: { name: "Образовательный инжиниринг", description: "Беседа Центра образовательного инжиниринга." },
    sport: { name: "Физкультура и спорт", description: "Беседа Высшей школы физической культуры и спорта." },
    ecology: { name: "Экологическая школа", description: "Беседа Высшей экологической школы." },
    economy: { name: "Цифровая экономика", description: "Беседа Высшей школы цифровой экономики." },
    oil: { name: "Нефтяная школа", description: "Беседа Высшей нефтяной школы." },
    law: { name: "Школа права", description: "Беседа Высшей школы права." },
    polytech: { name: "Политехническая школа", description: "Беседа Политехнической школы." },
    general: { name: "Общая беседа", description: "Общая беседа без определенной тематики." },
    flood: { name: "Бред", description: "Раздел \"Бред\". Беседа с минимальным уровнем цензуры и без определенной тематики. Веселитесь и общайтесь о чём угодно!" },
  };

  const currentBoard = boardInfo[params.slug] || { 
    name: params.slug, 
    description: `Беседа в разделе /${params.slug}/.` 
  };

  // Инициализация темы
  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
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

  useEffect(() => {
    fetchPosts();
  }, [params.slug]);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('board_slug', params.slug)
      .order('bumped_at', { ascending: false });
    
    if (data) setPosts(data);
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNickname(val);
    setIsAdmin(val === 'yurta_admin_2024');
  };

  const handleDelete = async (postId: number) => {
    if (!confirm("Удалить этот пост?")) return;
    const { data, error } = await supabase.rpc('delete_post_admin', { p_id: postId, p_password: 'yurta_admin_2024' });
    if (error || !data) alert("Ошибка удаления. Неверный пароль?");
    else fetchPosts();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (cooldown) return alert("Подождите 30 секунд перед следующей отправкой!");
    setLoading(true);

    let imageUrl = null;
    if (file) {
      const compressedFile = await compressImage(file);
      const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(safeFileName, compressedFile, { contentType: 'image/jpeg', upsert: false });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from('images').getPublicUrl(safeFileName);
        imageUrl = urlData.publicUrl;
      } else {
        alert("Ошибка при загрузке картинки: " + (uploadError?.message || "Неизвестная ошибка"));
        setLoading(false);
        return;
      }
    }

    const newPost = {
      board_slug: params.slug,
      nickname: nickname.trim() || null,
      content: content.trim(),
      image_url: imageUrl,
      parent_id: replyTo ? replyTo.id : null,
    };

    const { error } = await supabase.from('posts').insert([newPost]);

    if (!error) {
      if (replyTo) {
        const rootId = replyTo.parent_id || replyTo.id;
        await supabase.from('posts').update({ bumped_at: new Date().toISOString() }).eq('id', rootId);
      }
      setContent("");
      setFile(null);
      setReplyTo(null);
      fetchPosts();
      setCooldown(true);
      setTimeout(() => setCooldown(false), 30000);
    } else {
      alert("Ошибка при отправке: " + error.message);
    }
    setLoading(false);
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 600; 
          const scale = Math.min(1, MAX_WIDTH / img.width); 
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) resolve(new File([blob], "image.jpg", { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.7);
        };
      };
    });
  };

  const handleReplyClick = (post: any) => {
    setReplyTo(post);
    setActiveTab('board');
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const insertEmoji = (emoji: string) => {
    setContent(prev => prev + " " + emoji + " ");
  };

  const renderContent = (text: string) => {
    let formattedText = text;
    EMOJIS.forEach(emoji => {
      formattedText = formattedText.split(emoji).join(
        `<span class="text-blue-700 dark:text-blue-400 font-bold">${emoji}</span>`
      );
    });
    formattedText = formattedText.replace(/\n/g, '<br/>');
    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  const getReplies = (parentId: number) => posts.filter(p => p.parent_id === parentId);
  const threads = posts.filter(p => !p.parent_id);
  
  const filteredThreads = threads.filter(t => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return t.content.toLowerCase().includes(query) || (t.nickname && t.nickname.toLowerCase().includes(query));
    }
    return true;
  });

  // SVG Иконки
  const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-400 dark:text-slate-500"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  );
  const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
  );
  const SmileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
  );

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-20 font-sans transition-colors duration-300">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-4 px-4 shadow-sm mb-8 transition-colors duration-300">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/">
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{ height: '48px', width: 'auto' }} 
              className="dark:brightness-0 dark:invert transition-all duration-300"
            />
          </a>
          
          <div className="flex items-center gap-4">
            <a href="/" className="text-blue-700 dark:text-blue-400 hover:text-teal-700 dark:hover:text-teal-400 font-medium transition-colors">На главную</a>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
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

      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 uppercase transition-colors">/{params.slug}/</h1>
          <h2 className="text-xl font-bold text-blue-800 dark:text-blue-400 mb-1 transition-colors">{currentBoard.name}</h2>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">{currentBoard.description}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => setActiveTab('board')} className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded transition-colors ${activeTab === 'board' ? 'bg-blue-100 dark:bg-slate-700 text-blue-800 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>Доска</button>
            <button onClick={() => setActiveTab('catalog')} className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded transition-colors ${activeTab === 'catalog' ? 'bg-blue-100 dark:bg-slate-700 text-blue-800 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>Каталог</button>
          </div>
          
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
            <input type="text" placeholder="Поиск по тредам..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full border border-slate-300 dark:border-slate-600 bg-transparent rounded pl-10 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
        </div>

        {activeTab === 'board' && (
          <div ref={formRef} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm mb-8 relative overflow-hidden transition-colors">
            <div className="p-6">
              <h2 className="text-lg font-bold mb-4 dark:text-slate-100 transition-colors">{replyTo ? `Ответ на пост №${replyTo.id}` : "Создать новый тред"}</h2>
              {replyTo && <button onClick={() => setReplyTo(null)} className="text-sm text-red-500 mb-2 hover:underline">Отменить ответ</button>}
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <button type="button" onClick={() => setShowEmojis(!showEmojis)} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-600">
                      <SmileIcon /> {showEmojis ? "Свернуть смайлы" : "Показать смайлы"}
                    </button>
                  </div>
                  {showEmojis && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1 p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto transition-colors">
                      {EMOJIS.map((emoji) => (
                        <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 px-1 py-2 rounded transition-colors font-mono flex items-center justify-center break-all">{emoji}</button>
                      ))}
                    </div>
                  )}
                </div>

                <input 
                  type="text" 
                  placeholder="Твой ник (необязательно)" 
                  value={nickname} 
                  onChange={handleNicknameChange} 
                  className={`border rounded px-3 py-2 text-sm bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none transition-colors ${isAdmin ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-400' : 'border-slate-300 dark:border-slate-600 focus:border-blue-500'}`} 
                />
                
                <textarea placeholder="Текст сообщения..." value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-slate-100 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none font-mono transition-colors" required></textarea>
                
                <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                  <label className="cursor-pointer text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-100 dark:file:bg-slate-700 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200 dark:hover:file:bg-slate-600 flex items-center gap-2 transition-colors">
                    <ImageIcon /> <span>{file ? file.name : "Прикрепить картинку"}</span>
                    <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                  <button type="submit" disabled={loading || cooldown} className={`font-bold text-sm sm:text-base py-1.5 sm:py-2 px-4 sm:px-6 rounded transition-colors w-full sm:w-auto ${cooldown ? 'bg-slate-400 dark:bg-slate-600 text-white cursor-not-allowed' : 'bg-blue-700 dark:bg-blue-600 text-white hover:bg-teal-700 dark:hover:bg-teal-600'}`}>
                    {loading ? "Отправка..." : cooldown ? "Ждите 30 сек..." : "Отправить"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {filteredThreads.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-10 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">{searchQuery ? "Ничего не найдено." : "Здесь пока нет тредов. Будь первым!"}</div>
          ) : (
            filteredThreads.map((thread) => {
              const replies = getReplies(thread.id);
              const lastReply = replies.length > 0 ? replies[replies.length - 1] : null;
              
              if (activeTab === 'catalog') {
                return (
                  <div key={thread.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-blue-700 dark:text-blue-400 text-sm">{thread.nickname || "Аноним"}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">№{thread.id}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto sm:ml-0">Ответов: {replies.length}</span>
                        </div>
                        <h3 className="text-slate-800 dark:text-slate-200 font-medium line-clamp-2 mb-2">{thread.content}</h3>
                        {lastReply && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-700 line-clamp-1">
                            <span className="font-bold text-slate-600 dark:text-slate-300">Последний ответ:</span> {lastReply.content}
                          </div>
                        )}
                      </div>
                      <button onClick={() => handleReplyClick(thread)} className="shrink-0 bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600 text-blue-700 dark:text-blue-400 text-sm font-medium py-1.5 px-4 rounded transition-colors">Перейти</button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={thread.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col transition-colors">
                  <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-bold ${thread.nickname ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>{thread.nickname || "Аноним"}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{new Date(thread.created_at).toLocaleString('ru-RU')}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">№{thread.id}</span>
                      
                      {isAdmin && (
                        <button onClick={() => handleDelete(thread.id)} className="text-xs text-red-500 hover:underline ml-2">[Удалить]</button>
                      )}
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{renderContent(thread.content)}</div>
                    {thread.image_url && (
                      <div className="mt-3">
                        <img src={thread.image_url} alt="img" className="max-w-full h-auto max-h-[400px] rounded border border-slate-200 dark:border-slate-700 object-contain" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Ошибка+загрузки'; }} />
                      </div>
                    )}
                  </div>

                  {replies.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 flex flex-col transition-colors">
                      {replies.map((reply) => (
                        <div key={reply.id} className="p-4 border-t border-slate-100 dark:border-slate-700 ml-4 border-l-2 border-l-blue-200 dark:border-l-blue-900 transition-colors">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-bold text-sm ${reply.nickname ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>{reply.nickname || "Аноним"}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">{new Date(reply.created_at).toLocaleString('ru-RU')}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">№{reply.id}</span>
                            
                            {isAdmin && (
                              <button onClick={() => handleDelete(reply.id)} className="text-xs text-red-500 hover:underline ml-2">[Удалить]</button>
                            )}
                          </div>
                          <div className="text-slate-800 dark:text-slate-200 text-sm whitespace-pre-wrap">{renderContent(reply.content)}</div>
                          {reply.image_url && (
                            <div className="mt-2">
                              <img src={reply.image_url} alt="img" className="max-w-full h-auto max-h-[300px] rounded border border-slate-200 dark:border-slate-700 object-contain" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Ошибка+загрузки'; }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between transition-colors">
                    <button onClick={() => handleReplyClick(thread)} className="text-sm text-blue-700 dark:text-blue-400 hover:text-teal-700 dark:hover:text-teal-400 font-medium transition-colors">Ответить в тред</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}

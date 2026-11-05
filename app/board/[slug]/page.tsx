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
  
  const [cooldown, setCooldown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'board' | 'catalog'>('board');
  const [showEmojis, setShowEmojis] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  // --- СЛОВАРЬ ДЛЯ ЗАГОЛОВКОВ И ОПИСАНИЙ ---
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

  // Если раздела нет в словаре, используем дефолтные значения
  const currentBoard = boardInfo[params.slug] || { 
    name: params.slug, 
    description: `Беседа в разделе /${params.slug}/.` 
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
        .upload(safeFileName, compressedFile, {
          contentType: 'image/jpeg',
          upsert: false
        });

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
          const MAX_WIDTH = 600; // Уменьшили для стабильности
          const scale = Math.min(1, MAX_WIDTH / img.width); 
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], "image.jpg", { type: 'image/jpeg' }));
            }
          }, 'image/jpeg', 0.7); // Качество 70%
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
        `<span class="text-blue-700 font-bold">${emoji}</span>`
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

  const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-400">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  );

  const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
  );

  const SmileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>
    </svg>
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      <header className="bg-white border-b border-slate-200 py-4 px-4 shadow-sm mb-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/">
            <img src="/logo.png" alt="Logo" style={{ height: '48px', width: 'auto' }} />
          </a>
          <a href="/" className="text-blue-700 hover:text-teal-700 font-medium">На главную</a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 uppercase">/{params.slug}/</h1>
          <h2 className="text-xl font-bold text-blue-800 mb-1">{currentBoard.name}</h2>
          <p className="text-slate-500">{currentBoard.description}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-2 rounded-lg border border-slate-200">
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('board')}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded ${activeTab === 'board' ? 'bg-blue-100 text-blue-800' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Доска
            </button>
            <button 
              onClick={() => setActiveTab('catalog')}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded flex items-center justify-center gap-2 ${activeTab === 'catalog' ? 'bg-blue-100 text-blue-800' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Каталог
            </button>
          </div>
          
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input 
              type="text" 
              placeholder="Поиск по тредам..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-slate-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {activeTab === 'board' && (
          <div ref={formRef} className="bg-white rounded-lg border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-bold mb-4">
                {replyTo ? `Ответ на пост №${replyTo.id}` : "Создать новый тред"}
              </h2>
              {replyTo && (
                <button onClick={() => setReplyTo(null)} className="text-sm text-red-500 mb-2 hover:underline">
                  Отменить ответ
                </button>
              )}
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setShowEmojis(!showEmojis)}
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700 font-medium transition-colors bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded border border-slate-200"
                    >
                      <SmileIcon />
                      {showEmojis ? "Свернуть смайлы" : "Показать смайлы"}
                    </button>
                  </div>

                  {showEmojis && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1 p-3 bg-slate-50 rounded border border-slate-200 max-h-48 overflow-y-auto">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => insertEmoji(emoji)}
                          className="text-xs sm:text-sm text-slate-700 hover:text-blue-700 hover:bg-white px-1 py-2 rounded transition-colors font-mono flex items-center justify-center break-all"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <input 
                  type="text" 
                  placeholder="Твой ник (необязательно)" 
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                
                <textarea 
                  placeholder="Текст сообщения..." 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none font-mono"
                  required
                ></textarea>
                
                <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                  <label className="cursor-pointer text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 flex items-center gap-2">
                    <ImageIcon />
                    <span>{file ? file.name : "Прикрепить картинку"}</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <button 
                    type="submit" 
                    disabled={loading || cooldown}
                    className={`font-bold text-sm sm:text-base py-1.5 sm:py-2 px-4 sm:px-6 rounded transition-colors w-full sm:w-auto ${
                      cooldown ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-blue-700 text-white hover:bg-teal-700'
                    }`}
                  >
                    {loading ? "Отправка..." : cooldown ? "Ждите 30 сек..." : "Отправить"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {filteredThreads.length === 0 ? (
            <div className="text-center text-slate-500 py-10 bg-white rounded-lg border border-slate-200">
              {searchQuery ? "Ничего не найдено." : "Здесь пока нет тредов. Будь первым!"}
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const replies = getReplies(thread.id);
              const lastReply = replies.length > 0 ? replies[replies.length - 1] : null;
              
              if (activeTab === 'catalog') {
                return (
                  <div key={thread.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 hover:border-blue-400 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-blue-700 text-sm">
                            {thread.nickname || "Аноним"}
                          </span>
                          <span className="text-xs text-slate-400">№{thread.id}</span>
                          <span className="text-xs text-slate-400 ml-auto sm:ml-0">Ответов: {replies.length}</span>
                        </div>
                        <h3 className="text-slate-800 font-medium line-clamp-2 mb-2">
                          {thread.content}
                        </h3>
                        {lastReply && (
                          <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-1">
                            <span className="font-bold text-slate-600">Последний ответ:</span> {lastReply.content}
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => handleReplyClick(thread)}
                        className="shrink-0 bg-slate-100 hover:bg-blue-100 text-blue-700 text-sm font-medium py-1.5 px-4 rounded transition-colors"
                      >
                        Перейти
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={thread.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-bold ${thread.nickname ? 'text-blue-700' : 'text-slate-500'}`}>
                        {thread.nickname || "Аноним"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(thread.created_at).toLocaleString('ru-RU')}
                      </span>
                      <span className="text-xs text-slate-400 ml-auto">№{thread.id}</span>
                    </div>
                    <div className="text-slate-800 whitespace-pre-wrap">{renderContent(thread.content)}</div>
                    
                    {thread.image_url && (
                      <div className="mt-3">
                        <img 
                          src={thread.image_url} 
                          alt="img" 
                          className="max-w-full h-auto max-h-[400px] rounded border border-slate-200 object-contain" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Ошибка+загрузки';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {replies.length > 0 && (
                    <div className="bg-white flex flex-col">
                      {replies.map((reply) => (
                        <div key={reply.id} className="p-4 border-t border-slate-100 ml-4 border-l-2 border-l-blue-200">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-bold text-sm ${reply.nickname ? 'text-blue-700' : 'text-slate-500'}`}>
                              {reply.nickname || "Аноним"}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(reply.created_at).toLocaleString('ru-RU')}
                            </span>
                            <span className="text-xs text-slate-400 ml-auto">№{reply.id}</span>
                          </div>
                          <div className="text-slate-800 text-sm whitespace-pre-wrap">{renderContent(reply.content)}</div>
                          {reply.image_url && (
                            <div className="mt-2">
                              <img 
                                src={reply.image_url} 
                                alt="img" 
                                className="max-w-full h-auto max-h-[300px] rounded border border-slate-200 object-contain" 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Ошибка+загрузки';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button 
                      onClick={() => handleReplyClick(thread)}
                      className="text-sm text-blue-700 hover:text-teal-700 font-medium"
                    >
                      Ответить в тред
                    </button>
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

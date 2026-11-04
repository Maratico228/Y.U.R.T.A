"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

// Список смайлов для панели
const EMOJIS = [
  "ಠ_ಠ", "(╯°□°)╯︵ ┻━┻", "( ͡° ͜ʖ ͡°)", ":3", "(´・ω・`)", 
  "ヽ(´ー｀)┌", "＼(＾▽＾)／", "¯\\_(ツ)_/¯", "(⌐■_■)", 
  "(╥﹏╥)", "(☞ﾟヮﾟ)☞", "(☭ ͜ʖ ☭)", "( ˘ ³˘)♥", "ヽ(`Д´)ﾉ"
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

  const formRef = useRef<HTMLDivElement>(null);

  const boardName = params.slug === 'general' ? 'Общая беседа' 
                  : params.slug === 'flood' ? 'Раздел бред' 
                  : `Доска: ${params.slug}`;

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
      const fileName = `${Date.now()}-${compressedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, compressedFile);

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
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

  const handlePin = async (postId: number, currentStatus: boolean) => {
    if (!confirm(currentStatus ? "Убрать из каталога?" : "Добавить в каталог?")) return;
    const { error } = await supabase.from('posts').update({ is_pinned: !currentStatus }).eq('id', postId);
    if (!error) fetchPosts();
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
          const MAX_WIDTH = 800;
          const scale = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.8);
        };
      };
    });
  };

  const handleReplyClick = (post: any) => {
    setReplyTo(post);
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const insertEmoji = (emoji: string) => {
    setContent(prev => prev + " " + emoji + " ");
  };

  // Функция для подсветки смайлов в тексте
  const renderContent = (text: string) => {
    let formattedText = text;
    
    // Проходимся по каждому смайлу и оборачиваем его в синий span
    EMOJIS.forEach(emoji => {
      // Используем split и join, чтобы заменить все вхождения (без regex)
      formattedText = formattedText.split(emoji).join(
        `<span class="text-blue-700 font-bold">${emoji}</span>`
      );
    });

    // Заменяем переносы строк на <br/>
    formattedText = formattedText.replace(/\n/g, '<br/>');

    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  const getReplies = (parentId: number) => posts.filter(p => p.parent_id === parentId);

  const threads = posts.filter(p => !p.parent_id);
  
  const filteredThreads = threads.filter(t => {
    if (activeTab === 'catalog' && !t.is_pinned) return false;
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

  const PinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
    </svg>
  );

  const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
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
          <p className="text-slate-500">{boardName}</p>
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
              <PinIcon /> Каталог
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
                
                {/* Панель смайлов */}
                <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => insertEmoji(emoji)}
                      className="text-sm text-slate-600 hover:text-blue-700 hover:bg-white px-2 py-1 rounded transition-colors font-mono"
                      title="Вставить смайл"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <input 
                  type="text" 
                  placeholder="Твой ник (необязательно)" 
                  value={nickname}
                  onChange={handleNicknameChange}
                  className={`border rounded px-3 py-2 text-sm focus:outline-none ${
                    isAdmin ? 'border-red-500 bg-red-50 text-red-900' : 'border-slate-300 focus:border-blue-500'
                  }`}
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
              {activeTab === 'catalog' ? "В каталоге пока пусто." : searchQuery ? "Ничего не найдено." : "Здесь пока нет тредов. Будь первым!"}
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const replies = getReplies(thread.id);
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
                      
                      {isAdmin && (
                        <div className="flex gap-2 ml-2">
                          <button onClick={() => handlePin(thread.id, thread.is_pinned)} className={`text-xs hover:underline ${thread.is_pinned ? 'text-orange-500' : 'text-slate-500'}`} title={thread.is_pinned ? "Открепить" : "Закрепить"}>
                            <PinIcon />
                          </button>
                          <button onClick={() => handleDelete(thread.id)} className="text-xs text-red-500 hover:underline">
                            [Удалить]
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Используем renderContent для красивого вывода текста */}
                    <div className="text-slate-800 whitespace-pre-wrap">{renderContent(thread.content)}</div>
                    
                    {thread.image_url && (
                      <div className="mt-3">
                        <img src={thread.image_url} alt="img" className="max-w-full h-auto max-h-[400px] rounded border border-slate-200 object-contain" />
                      </div>
                    )}
                  </div>

                  {replies.length > 0 && activeTab === 'board' && (
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
                            
                            {isAdmin && (
                              <button onClick={() => handleDelete(reply.id)} className="text-xs text-red-500 hover:underline ml-2">
                                [Удалить]
                              </button>
                            )}
                          </div>
                          <div className="text-slate-800 text-sm whitespace-pre-wrap">{renderContent(reply.content)}</div>
                          
                          {reply.image_url && (
                            <div className="mt-2">
                              <img src={reply.image_url} alt="img" className="max-w-full h-auto max-h-[300px] rounded border border-slate-200 object-contain" />
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

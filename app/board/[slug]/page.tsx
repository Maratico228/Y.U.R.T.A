"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function BoardPage({ params }: { params: { slug: string } }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const boardName = params.slug === 'general' ? 'Общая беседа' 
                  : params.slug === 'flood' ? 'Раздел бред' 
                  : `Доска: ${params.slug}`;

  useEffect(() => {
    fetchPosts();
  }, [params.slug]);

  const fetchPosts = async () => {
    // Скрываем посты, у которых 3+ жалобы
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('board_slug', params.slug)
      .lt('reports', 3)
      .order('bumped_at', { ascending: false });
    
    if (data) setPosts(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
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
        await supabase.from('posts').update({ bumped_at: new Date().toISOString() }).eq('id', replyTo.id);
      }
      setContent("");
      setNickname("");
      setFile(null);
      setReplyTo(null);
      fetchPosts();
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

  // Логика лайков и дизлайков
  const handleVote = async (post: any, type: 'like' | 'dislike') => {
    const newValue = type === 'like' ? post.likes + 1 : post.dislikes + 1;
    const field = type === 'like' ? 'likes' : 'dislikes';
    
    // Оптимистичное обновление (сразу в UI)
    setPosts(posts.map(p => p.id === post.id ? { ...p, [field]: p[field] + 1 } : p));
    
    // Обновление в базе
    await supabase.from('posts').update({ [field]: newValue }).eq('id', post.id);
  };

  // Логика жалоб
  const handleReport = async (post: any) => {
    const newReports = (post.reports || 0) + 1;
    setPosts(posts.map(p => p.id === post.id ? { ...p, reports: newReports } : p));
    
    await supabase.from('posts').update({ reports: newReports }).eq('id', post.id);
    
    // Если это 3-я жалоба, перезагружаем ленту, чтобы пост исчез
    if (newReports >= 3) fetchPosts();
  };

  const threads = posts.filter(p => !p.parent_id);
  const getReplies = (parentId: number) => posts.filter(p => p.parent_id === parentId);

  // SVG Иконки
  const ArrowUp = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>
    </svg>
  );

  const ArrowDown = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
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

        <div ref={formRef} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-8">
          <h2 className="text-lg font-bold mb-4">
            {replyTo ? `Ответ на пост №${replyTo.id}` : "Создать новый тред"}
          </h2>
          {replyTo && (
            <button onClick={() => setReplyTo(null)} className="text-sm text-red-500 mb-2 hover:underline">
              Отменить ответ
            </button>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
              className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
              required
            ></textarea>
            
            <div className="flex items-center justify-between mt-2">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-700 text-white font-bold py-2 px-6 rounded hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Отправка..." : "Отправить"}
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-6">
          {threads.length === 0 ? (
            <div className="text-center text-slate-500 py-10 bg-white rounded-lg border border-slate-200">
              Здесь пока нет тредов. Будь первым!
            </div>
          ) : (
            threads.map((thread) => {
              const replies = getReplies(thread.id);
              return (
                <div key={thread.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex">
                  
                  {/* Блок рейтинга (слева) */}
                  <div className="bg-slate-50 border-r border-slate-100 p-2 flex flex-col items-center gap-1 min-w-[50px]">
                    <button onClick={() => handleVote(thread, 'like')} className="text-slate-400 hover:text-blue-600 transition-colors p-1">
                      <ArrowUp />
                    </button>
                    <span className="text-sm font-bold text-slate-700">{thread.likes || 0}</span>
                    <button onClick={() => handleVote(thread, 'dislike')} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                      <ArrowDown />
                    </button>
                  </div>

                  {/* Контент поста */}
                  <div className="flex-1 flex flex-col">
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
                      <p className="text-slate-800 whitespace-pre-wrap">{thread.content}</p>
                      {thread.image_url && (
                        <div className="mt-3">
                          <img src={thread.image_url} alt="img" className="max-w-full h-auto max-h-[400px] rounded border border-slate-200 object-contain" />
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
                            <p className="text-slate-800 text-sm whitespace-pre-wrap">{reply.content}</p>
                            {reply.image_url && (
                              <div className="mt-2">
                                <img src={reply.image_url} alt="img" className="max-w-full h-auto max-h-[300px] rounded border border-slate-200 object-contain" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Панель управления под постом */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <button 
                        onClick={() => handleReplyClick(thread)}
                        className="text-sm text-blue-700 hover:text-teal-700 font-medium"
                      >
                        Ответить в тред
                      </button>
                      <button 
                        onClick={() => handleReport(thread)}
                        className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                        title="Пожаловаться"
                      >
                        Жалоба
                      </button>
                    </div>
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

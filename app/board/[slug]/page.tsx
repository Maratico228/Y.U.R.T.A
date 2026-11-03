"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function BoardPage({ params }: { params: { slug: string } }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null); // Состояние для ответа

  const formRef = useRef<HTMLDivElement>(null);

  const boardName = params.slug === 'general' ? 'Общая беседа' 
                  : params.slug === 'flood' ? 'Раздел бред' 
                  : `Доска: ${params.slug}`;

  useEffect(() => {
    fetchPosts();
  }, [params.slug]);

  const fetchPosts = async () => {
    // Забираем посты, сортируем по bumped_at (свежие наверху)
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

    // Если отвечаем на пост, передаем parent_id
    const newPost = {
      board_slug: params.slug,
      nickname: nickname.trim() || null,
      content: content.trim(),
      image_url: imageUrl,
      parent_id: replyTo ? replyTo.id : null,
    };

    const { error } = await supabase.from('posts').insert([newPost]);

    if (!error) {
      // Если это ответ, обновляем bumped_at у родительского поста, чтобы он поднялся наверх
      if (replyTo) {
        await supabase
          .from('posts')
          .update({ bumped_at: new Date().toISOString() })
          .eq('id', replyTo.id);
      }

      setContent("");
      setNickname("");
      setFile(null);
      setReplyTo(null); // Сбрасываем ответ
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

  // Разделяем посты на треды (корневые) и ответы
  const threads = posts.filter(p => !p.parent_id);
  const getReplies = (parentId: number) => posts.filter(p => p.parent_id === parentId);

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

        {/* Форма (привязана к ref для скролла) */}
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

        {/* Лента тредов */}
        <div className="flex flex-col gap-6">
          {threads.length === 0 ? (
            <div className="text-center text-slate-500 py-10 bg-white rounded-lg border border-slate-200">
              Здесь пока нет тредов. Будь первым!
            </div>
          ) : (
            threads.map((thread) => {
              const replies = getReplies(thread.id);
              return (
                <div key={thread.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  {/* Корневой пост */}
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50">
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
                        <img 
                          src={thread.image_url} 
                          alt="Прикрепленное изображение" 
                          className="max-w-full h-auto max-h-[400px] rounded border border-slate-200 object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Ответы */}
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
                              <img 
                                src={reply.image_url} 
                                alt="Прикрепленное изображение" 
                                className="max-w-full h-auto max-h-[300px] rounded border border-slate-200 object-contain"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Кнопка ответа */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100">
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

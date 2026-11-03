"use client"; // Важно: включаем клиентский режим для работы с формой

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function BoardPage({ params }: { params: { slug: string } }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const boardName = params.slug === 'general' ? 'Общая беседа' 
                  : params.slug === 'flood' ? 'Раздел бред' 
                  : `Доска: ${params.slug}`;

  // Загружаем посты при открытии страницы
  useEffect(() => {
    fetchPosts();
  }, [params.slug]);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('board_slug', params.slug)
      .order('created_at', { ascending: false });
    
    if (data) setPosts(data);
  };

  // Функция отправки поста
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    let imageUrl = null;

    // 1. Если есть картинка — сжимаем и загружаем в Supabase
    if (file) {
      // Сжимаем картинку через Canvas (строгий размер)
      const compressedFile = await compressImage(file);
      
      // Загружаем в Storage
      const fileName = `${Date.now()}-${compressedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, compressedFile);

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    }

    // 2. Сохраняем пост в базу
    const { error } = await supabase.from('posts').insert([
      {
        board_slug: params.slug,
        nickname: nickname.trim() || null,
        content: content.trim(),
        image_url: imageUrl,
      }
    ]);

    if (!error) {
      setContent("");
      setNickname("");
      setFile(null);
      fetchPosts(); // Обновляем ленту
    } else {
      alert("Ошибка при отправке: " + error.message);
    }
    setLoading(false);
  };

  // Функция сжатия картинки до ширины 800px
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
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            }
          }, 'image/jpeg', 0.8);
        };
      };
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      <header className="bg-white border-b border-slate-200 py-4 px-4 shadow-sm mb-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/">
            <img src="/logo.png" alt="Logo" style={{ height: '48px', width: 'auto' }} />
          </a>
          <a href="/" className="text-blue-700 hover:text-teal-700 font-medium">← На главную</a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 uppercase">/{params.slug}/</h1>
          <p className="text-slate-500">{boardName}</p>
        </div>

        {/* Форма */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-8">
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
              {/* Загрузка картинки */}
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

        {/* Лента постов */}
        <div className="flex flex-col gap-4">
          {posts.length === 0 ? (
            <div className="text-center text-slate-500 py-10 bg-white rounded-lg border border-slate-200">
              Здесь пока нет постов. Будь первым!
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-bold ${post.nickname ? 'text-blue-700' : 'text-slate-500'}`}>
                    {post.nickname || "Аноним"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(post.created_at).toLocaleString('ru-RU')}
                  </span>
                </div>
                <p className="text-slate-800 whitespace-pre-wrap">{post.content}</p>
                {post.image_url && (
                  <div className="mt-3">
                    <img 
                      src={post.image_url} 
                      alt="Прикрепленное изображение" 
                      className="max-w-full h-auto max-h-[400px] rounded border border-slate-200 object-contain"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

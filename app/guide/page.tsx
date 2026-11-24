"use client";

import { useState, useEffect } from "react";

export default function Guide() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-[#0b141a] text-slate-900 dark:text-slate-200 pb-20 font-sans">
      <header className="bg-white dark:bg-[#1a282d] border-b border-slate-200 dark:border-slate-800 py-4 px-4 shadow-sm mb-8 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/">
            <img src="/logo.png" alt="Logo" style={{ height: '40px', width: 'auto' }} className="dark:brightness-0 dark:invert" />
          </a>
          <a href="/" className="text-blue-700 dark:text-blue-400 hover:underline font-medium">На главную</a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Руководство пользователя</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Всё, что нужно знать о новой Юрте</p>
        
        <div className="bg-white dark:bg-[#1a282d] p-6 md:p-8 rounded-lg border border-slate-200 dark:border-slate-800 space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
          
          {/* 1. Лента */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0">1</span>
              Главная лента
            </h2>
            <p className="mb-3">На главной странице собираются посты <b>СРАЗУ СО ВСЕХ РАЗДЕЛОВ</b>. Вам не нужно переходить в отдельные разделы, чтобы узнать свежую информацию.</p>
            <p>Чтобы посмотреть комментарии к посту или написать свой, нажмите на кнопку с иконкой пузыря (например, «12 Комментариев») — сайт сам перенесёт вас в нужный раздел.</p>
          </section>


          {/* 2. Создание поста */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0">2</span>
              Как создать пост и прикрепить к нему файл?
            </h2>
            <p className="mb-3">Чтобы написать пост, выберите нужный раздел. Внутри раздела вы увидите форму.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><b>Ник:</b> Можно не писать, тогда вы останетесь Анонимом.</li>
              <li><b>Текст:</b> Поле для вашего сообщения.</li>
              <li><b>Прикрепить файл:</b> Если картинка слишком большая или содержит спойлер, поставьте галочку <b>«Скрыть под спойлер»</b>. Она будет размыта до тех пор, пока пользователь сам не захочет на неё посмотреть. Помимо картинки к посту можно прикрепить файл, видеоролик или аудио.</li>
              <li>Пройдите капчу (проверка «Я не робот») и нажмите кнопку «Отправить».</li>
            </ul>
          </section>

          {/* 3. Ответы */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0">3</span>
              Как отвечать на сообщения
            </h2>
            <p className="mb-3">Если вы хотите ответить конкретному человеку, нажмите кнопку <b>«Ответить»</b> под его сообщением. В поле ввода автоматически появится ссылка (например, <code>&gt;&gt;123</code>). Это кликабельная метка, которая перенесёт читателя к нужному сообщению.</p>
          </section>

          {/* 4. Правила Досок (НОВОЕ) */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0">4</span>
              Правила разделов (Досок)
            </h2>
            <p className="mb-3">Юрта делится на разделы. Чтобы не было хаоса, мы ввели правила для них:</p>
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-[#121d21] p-3 rounded border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">Доски Высших Школ</span> (Гуманитарная, Инженерная, Нефтяная и т.д.)
                <p className="text-sm mt-1">Предназначены для обсуждения учёбы, сессии, конкретных преподавателей и новостей вашей школы.</p>
              </div>
              <div className="bg-slate-50 dark:bg-[#121d21] p-3 rounded border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">/general/ — Общая беседа</span>
                <p className="text-sm mt-1">Для тем, которые касаются всего университета, но не подходят под конкретную школу. Вопросы к администрации, общие новости.</p>
              </div>
              <div className="bg-slate-50 dark:bg-[#121d21] p-3 rounded border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">/flood/ — Бред</span>
                <p className="text-sm mt-1">Свободная территория. Мемы, оффтоп, шутки, случайные картинки и всё, что не влезло в другие разделы.</p>
              </div>
            </div>
          </section>

          {/* 5. Советы (НОВОЕ) */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0">5</span>
              Полезные советы
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><b>Используйте поиск.</b> В каждой доске есть строка поиска по тредам. Прежде чем создавать новую тему про «когда будет сессия», проверьте, может, её уже обсуждали.</li>
              <li><b>Будьте вежливы.</b> За анонимностью скрываются реальные студенты и преподаватели. Уважайте друг друга.</li>
              <li><b>Соблюдайте чистоту.</b> Если увидели спам, оскорбления или чей-то номер телефона — нажмите на иконку предупреждающего треугольника (Жалоба) возле поста.</li>
              <li><b>Делитесь.</b> Если вам тут нравится, скиньте ссылку одногруппникам в чат. Чем больше людей, тем интереснее обсуждения.</li>
            </ul>
          </section>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="font-bold text-lg mb-2">Юрта — это место для своих. Добро пожаловать!</p>
          </div>

        </div>
      </div>
    </main>
  );
}


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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-20 font-sans">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-4 px-4 shadow-sm mb-8">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/">
            <img src="/logo.png" alt="Logo" style={{ height: '48px', width: 'auto' }} className="dark:brightness-0 dark:invert" />
          </a>
          <a href="/" className="text-blue-700 dark:text-blue-400 hover:underline font-medium">На главную</a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Как пользоваться Юртой?</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Подробная инструкция для тех, кто впервые пользуется имиджбордами.</p>
        
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-lg border border-slate-200 dark:border-slate-700 space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
          
          {/* Раздел 1 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 w-8 h-8 rounded-full flex items-center justify-center text-lg">1</span>
              Что такое Юрта и как она устроена?
            </h2>
            <p className="mb-3">Юрта — это анонимная имиджборда. В отличие от обычных социальных сетей, здесь нет личных профилей, подписчиков и лайков. Есть только <b>разделы (доски)</b>, внутри которых люди создают <b>темы (треды)</b> и общаются в них.</p>
            <p>На главной странице вы видите список досок (например, <code>/flood/</code> — бред, или доски Высших школ). Заходите в нужную, пишете сообщение — и оно появляется в ленте.</p>
          </section>

          {/* Раздел 2 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 w-8 h-8 rounded-full flex items-center justify-center text-lg">2</span>
              Как создать новый тред (тему)?
            </h2>
            <p className="mb-3">Зайдите на нужную доску. Вверху страницы вы увидите форму <b>«Создать новый тред»</b>.</p>
            <ul className="list-disc pl-5 space-y-2 mb-3">
              <li><b>Ваш ник:</b> Можете оставить пустым (тогда вы будете Анонимом), или вписать любое имя.</li>
              <li><b>Текст сообщения:</b> Здесь пишете свой вопрос, мем или мысль.</li>
              <li><b>Прикрепить картинку:</b> Нажмите на иконку и выберите файл с устройства. Если не хотите, чтобы картинку видели сразу, поставьте галочку <b>«Скрыть под спойлер»</b>.</li>
              <li>Нажмите синюю кнопку <b>«Отправить»</b>. Готово!</li>
            </ul>
          </section>

          {/* Раздел 3 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 w-8 h-8 rounded-full flex items-center justify-center text-lg">3</span>
              Как отвечать на сообщения и ссылаться на них?
            </h2>
            <p className="mb-3">Под каждым сообщением есть кнопка <b>«Ответить»</b>. Если вы нажмете её, вы вернётесь к форме для постинга, и в ней появится ссылка на этот пост.</p>
            <p className="mb-3">Эта ссылка выглядит как <code className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-blue-600 dark:text-blue-400 font-bold">&gt;&gt;123</code> (где 123 — номер поста). Это не просто текст, а <b>кликабельная ссылка</b>. Если на неё нажать, страница плавно прокрутится к этому сообщению и подсветит его синим.</p>
            <p>Вы можете вручную написать <code>&gt;&gt;номер</code> в любом месте текста, чтобы обратиться к конкретному человеку или посту.</p>
          </section>

          {/* Раздел 4 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 w-8 h-8 rounded-full flex items-center justify-center text-lg">4</span>
              Как использовать эмоджи и смайлы?
            </h2>
            <p className="mb-3">Рядом с формой ввода есть кнопка <b>«Показать эмоджи»</b>. Нажмите её, и откроется панель:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><b>Эмотиконы:</b> Текстовые смайлы (например, <code>ಠ_ಠ</code> или <code>(╯°□°)╯︵ ┻━┻</code>). Когда вы нажимаете на них, они вставляются в текст, и после отправки автоматически становятся <b>синими и жирными</b>.</li>
              <li><b>Эмоджи:</b> Картинки. Они адаптируются под тему сайта (в темной теме они белые, в светлой — черные, чтобы не сливаться с фоном).</li>
            </ul>
          </section>

          {/* Раздел 5 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 w-8 h-8 rounded-full flex items-center justify-center text-lg">5</span>
              Темная тема и навигация
            </h2>
            <p className="mb-3">В правом верхнем углу каждой страницы есть иконка <b>луны/солнца</b>. Нажмите на неё, чтобы переключить тему. Сайт запомнит ваш выбор навсегда.</p>
            <p>Если тред очень длинный, в правом нижнем углу появится <b>синяя круглая кнопка со стрелкой вверх</b>. Она быстро вернет вас к началу страницы.</p>
          </section>

          {/* Раздел 6 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 w-8 h-8 rounded-full flex items-center justify-center text-lg">6</span>
              Что такое «Каталог» или как найти нужную тему?
            </h2>
            <p className="mb-3">На каждой доске есть две вкладки: <b>«Доска»</b> и <b>«Каталог»</b>.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><b>Доска:</b> Показывает треды в том порядке, как они создавались.</li>
              <li><b>Каталог:</b> Удобный список всех тредов, где видно, сколько в каждом ответов и какое сообщение было последним. Если нажать «Перейти», вы окажетесь внутри треда.</li>
            </ul>
            <p className="mt-3">Рядом с вкладками есть строка <b>«Поиск по тредам»</b>. Введите туда слово, и сайт покажет только те треды, где это слово встречается.</p>
          </section>

          {/* Раздел 7 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 w-8 h-8 rounded-full flex items-center justify-center text-lg">7</span>
              Жалобы и безопасность
            </h2>
            <p className="mb-3">Возле каждого поста есть иконка <b>треугольника с восклицательным знаком</b>. Если вы увидели нарушение правил (спам, оскорбления, доксинг), нажмите на неё. Откроется ваш почтовый клиент с уже готовым письмом на официальную почту Юрты.</p>
            <p className="mt-4 p-4 bg-blue-50 dark:bg-slate-900 rounded-md border border-blue-200 dark:border-slate-700 text-sm">
              <b>Обратите внимание:</b> Чтобы защитить форум от спам-ботов, при отправке сообщения может появляться капча. Она проходится в один клик.
            </p>
          </section>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="font-bold text-lg mb-2">Добро пожаловать в Юрту!</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Если остались вопросы, создайте тред в разделе <a href="/board/general" className="text-blue-600 dark:text-blue-400 hover:underline">/general/</a> и спросите там. Вам обязательно ответят.</p>
          </div>

        </div>
      </div>
    </main>
  );
}

export default function BoardPage({ params }: { params: { slug: string } }) {
  // Красивое название для заголовка (пока просто выводим slug)
  const boardName = params.slug === 'general' ? 'Общая беседа' 
                  : params.slug === 'flood' ? 'Раздел бред' 
                  : `Доска: ${params.slug}`;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      
      {/* Шапка (такая же, как на главной) */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 shadow-sm mb-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/">
            <img 
              src="/logo.png" 
              alt="Логотип Y.U.R.T.A" 
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            />
          </a>
          <a href="/" className="text-blue-700 hover:text-teal-700 font-medium">
            ← На главную
          </a>
        </div>
      </header>

      {/* Контент доски */}
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 uppercase">
            /{params.slug}/
          </h1>
          <p className="text-slate-500">{boardName}</p>
        </div>

        {/* Форма создания нового треда */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-10">
          <h2 className="text-lg font-bold mb-4">Создать новый тред</h2>
          <form className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Твой ник (необязательно)" 
              className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <textarea 
              placeholder="Текст сообщения..." 
              rows={4}
              className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
            ></textarea>
            <button 
              type="button" 
              className="bg-blue-700 text-white font-bold py-2 px-6 rounded hover:bg-teal-700 transition-colors w-fit"
            >
              Отправить
            </button>
          </form>
        </div>

        {/* Заглушка для списка тредов */}
        <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-500">
          Здесь пока нет тредов. Будь первым!
        </div>

      </div>
    </main>
  );
}

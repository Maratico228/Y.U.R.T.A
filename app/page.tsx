export default function Home() {
  const schools = [
    { name: "Высшая школа гуманитарных наук", slug: "humanities" },
    { name: "Инженерная школа цифровых технологий", slug: "engineering" },
    { name: "Центр образовательного инжиниринга", slug: "education" },
    { name: "Высшая школа физической культуры и спорта", slug: "sport" },
    { name: "Высшая экологическая школа", slug: "ecology" },
    { name: "Высшая школа цифровой экономики", slug: "economy" },
    { name: "Высшая нефтяная школа", slug: "oil" },
    { name: "Высшая школа права", slug: "law" },
    { name: "Политехническая школа", slug: "polytech" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      
      {/* 1. Шапка с логотипом (без текста) */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <img 
            src="/logo.png" 
            alt="Логотип Y.U.R.T.A" 
            style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
          />
        </div>
      </header>

      {/* 2. Заглавный текст */}
      <div className="max-w-5xl mx-auto px-4 py-8 flex justify-center">
        <img 
          src="/title.png" 
          alt="Заглавный текст" 
          style={{ maxWidth: '400px', maxHeight: '150px', objectFit: 'contain' }} 
        />
      </div>

      {/* 3. Основной контент */}
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Список школ */}
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-3 border-b-2 border-slate-300 pb-1 inline-block text-slate-800">
            Доски Высших школ
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mt-4">
            {schools.map((school) => (
              <li key={school.slug}>
                <a 
                  href={`/board/${school.slug}`}
                  className="text-blue-700 hover:text-teal-700 transition-colors duration-200 text-[16px] font-medium block"
                >
                  /{school.slug}/ — {school.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Общие разделы */}
        <div>
          <h2 className="text-lg font-bold mb-3 border-b-2 border-slate-300 pb-1 inline-block text-slate-800">
            Общие разделы
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mt-4">
            <li>
              <a 
                href="/board/general" 
                className="text-blue-700 hover:text-teal-700 transition-colors duration-200 text-[16px] font-medium block"
              >
                /general/ — Общая беседа
              </a>
            </li>
            <li>
              <a 
                href="/board/flood" 
                className="text-blue-700 hover:text-teal-700 transition-colors duration-200 text-[16px] font-medium block"
              >
                /flood/ — Раздел бред
              </a>
            </li>
          </ul>
        </div>

      </div>
    </main>
  );
}

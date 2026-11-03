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
      {/* Шапка */}
      <header className="bg-white border-b border-slate-200 py-6 px-4 mb-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          {/* Если картинка logo уже загружена в public, замени этот div на <img src="/logo.png" alt="Logo" className="w-12 h-12" /> */}
          <div className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
            ⚡
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              Y.U.R.T.A
            </h1>
            <p className="text-sm text-slate-500">
              Анонимная имиджборда ЮГУ
            </p>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Список школ (как на Дваче, простой список без карточек) */}
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-3 border-b-2 border-slate-300 pb-1 inline-block">
            Доски Высших школ
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-4">
            {schools.map((school) => (
              <li key={school.slug}>
                <a 
                  href={`/board/${school.slug}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline text-[15px]"
                >
                  /{school.slug}/ — {school.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Общие разделы */}
        <div>
          <h2 className="text-lg font-bold mb-3 border-b-2 border-slate-300 pb-1 inline-block">
            Общие разделы
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-4">
            <li>
              <a href="/board/general" className="text-blue-600 hover:text-blue-800 hover:underline text-[15px]">
                /general/ — Общая беседа
              </a>
            </li>
            <li>
              <a href="/board/flood" className="text-blue-600 hover:text-blue-800 hover:underline text-[15px]">
                /flood/ — Раздел бред
              </a>
            </li>
          </ul>
        </div>

      </div>
    </main>
  );
}

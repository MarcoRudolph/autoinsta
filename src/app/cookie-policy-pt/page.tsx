export const metadata = {
  title: "Política de cookies",
};

export default function CookiePolicyPt() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-[#334269] space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <a
          href="/"
          className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center"
        >
          ← Voltar ao início
        </a>
        <div className="flex flex-wrap gap-2 text-sm">
          <a href="/cookie-policy" className="text-blue-600 hover:underline">Deutsch</a>
          <span className="text-gray-400">|</span>
          <a href="/cookie-policy-en" className="text-blue-600 hover:underline">English</a>
          <span className="text-gray-400">|</span>
          <a href="/cookie-policy-fr" className="text-blue-600 hover:underline">Français</a>
          <span className="text-gray-400">|</span>
          <a href="/cookie-policy-es" className="text-blue-600 hover:underline">Español</a>
          <span className="text-gray-400">|</span>
          <a href="/cookie-policy-it" className="text-blue-600 hover:underline">Italiano</a>
          <span className="text-gray-400">|</span>
          <span className="text-gray-500">Português</span>
        </div>
      </div>

      <h1 className="text-3xl font-bold">Política de cookies</h1>
      <p>
        Esta aplicação utiliza Supabase Auth para login através do Google,
        Facebook e Magic Links. As configurações feitas no painel são
        armazenadas numa base de dados e podem ser ligadas à tua conta
        Instagram para responder automaticamente a mensagens diretas e
        comentários.
      </p>
      <p>Utilizamos os seguintes tipos de cookies:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Cookies funcionais</strong> – necessários para o
          funcionamento correto do site.
        </li>
        <li>
          <strong>Cookies analíticos</strong> – ajudam-nos a perceber como
          o site é utilizado.
        </li>
        <li>
          <strong>Cookies de marketing</strong> – servem para te mostrar
          ofertas relevantes.
        </li>
      </ul>
      <p>
        As tuas escolhas são armazenadas no armazenamento local do teu
        navegador. Mantemos também um registo local de quando e com quais
        opções aceitaste ou recusaste. Este registo não é transmitido ao
        servidor.
      </p>
      <p>
        Podes eliminar a tua decisão a qualquer momento limpando o
        armazenamento local do navegador. Na tua próxima visita, o banner
        voltará a aparecer.
      </p>

      <section className="space-y-4 mt-8">
        <h2 className="text-2xl font-semibold">Contacto</h2>
        <p>
          Para questões sobre a nossa política de cookies, contacta-nos em:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p>
            <strong>Email:</strong> MarcoRudolph09@proton.me
          </p>
          <p>
            <strong>Morada:</strong> Marco Rudolph, No de Halloh 8a,
            25591 Ottenbüttel
          </p>
          <p>
            <strong>Telefone:</strong> 04893 9373110
          </p>
        </div>
      </section>
    </div>
  );
}

export const metadata = {
  title: "Informativa sui cookie",
};

export default function CookiePolicyIt() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-[#334269] space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <a
          href="/"
          className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center"
        >
          ← Torna alla home
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
          <span className="text-gray-500">Italiano</span>
          <span className="text-gray-400">|</span>
          <a href="/cookie-policy-pt" className="text-blue-600 hover:underline">Português</a>
        </div>
      </div>

      <h1 className="text-3xl font-bold">Informativa sui cookie</h1>
      <p>
        Questa applicazione utilizza Supabase Auth per l&apos;accesso tramite
        Google, Facebook e Magic Links. Le impostazioni effettuate nella
        dashboard vengono memorizzate in un database e possono essere
        collegate al tuo account Instagram per rispondere automaticamente
        a messaggi diretti e commenti.
      </p>
      <p>Utilizziamo i seguenti tipi di cookie:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Cookie funzionali</strong> – necessari per il corretto
          funzionamento del sito.
        </li>
        <li>
          <strong>Cookie analitici</strong> – ci aiutano a capire come viene
          utilizzato il sito.
        </li>
        <li>
          <strong>Cookie di marketing</strong> – servono a mostrarti offerte
          pertinenti.
        </li>
      </ul>
      <p>
        Le tue scelte vengono salvate nell&apos;archiviazione locale del tuo
        browser. Teniamo inoltre un registro locale di quando e con quali
        opzioni hai accettato o rifiutato. Questo registro non viene
        trasmesso al server.
      </p>
      <p>
        Puoi eliminare la tua decisione in qualsiasi momento svuotando
        l&apos;archiviazione locale del browser. Alla tua prossima visita, il
        banner apparirà di nuovo.
      </p>

      <section className="space-y-4 mt-8">
        <h2 className="text-2xl font-semibold">Contatti</h2>
        <p>
          Per domande sulla nostra informativa sui cookie, contattaci a:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p>
            <strong>Email:</strong> MarcoRudolph09@proton.me
          </p>
          <p>
            <strong>Indirizzo:</strong> Marco Rudolph, No de Halloh 8a,
            25591 Ottenbüttel
          </p>
          <p>
            <strong>Telefono:</strong> 04893 9373110
          </p>
        </div>
      </section>
    </div>
  );
}

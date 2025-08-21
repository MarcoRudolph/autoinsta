export const metadata = {
  title: "Impressum - rudolpho-chat",
};

export default function Impressum() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-[#334269] space-y-6">
      <h1 className="text-4xl font-bold text-center mb-8">Impressum</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
        <p className="text-sm text-blue-800">
          <strong>Letzte Aktualisierung:</strong> {new Date().toLocaleDateString('de-DE')}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Angaben gemäß § 5 TMG</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="font-semibold text-lg mb-2">rudolpho-chat</p>
          <p><strong>Marco Rudolph</strong></p>
          <p>No de Halloh 8a</p>
          <p>25591 Ottenbüttel</p>
          <p className="mt-4">
            <strong>Telefon:</strong> 04893 9373110
          </p>
          <p>
            <strong>E-Mail:</strong> MarcoRudolph09@proton.me
          </p>

        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Umsatzsteuer-ID</h2>
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
        </p>
        <p className="bg-gray-50 p-4 rounded-lg">
          <strong>DE455180377</strong>
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p><strong>Marco Rudolph</strong></p>
          <p>No de Halloh 8a</p>
          <p>25591 Ottenbüttel</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">EU-Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
          <a href="https://ec.europa.eu/consumers/odr/" className="text-blue-600 hover:underline ml-1" target="_blank" rel="noopener noreferrer">
            https://ec.europa.eu/consumers/odr/
          </a>
        </p>
        <p>
          Unsere E-Mail-Adresse finden Sie oben im Impressum.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Haftung für Inhalte</h2>
        <p>
          Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen 
          Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind 
          wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte 
          fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine 
          rechtswidrige Tätigkeit hinweisen.
        </p>
        <p>
          Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach 
          den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung 
          ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung 
          möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese 
          Inhalte umgehend entfernen.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Haftung für Links</h2>
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir 
          keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine 
          Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige 
          Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden 
          zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige 
          Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
        </p>
        <p>
          Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne 
          konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden 
          von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Urheberrecht</h2>
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten 
          unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, 
          Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes 
          bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. 
          Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen 
          Gebrauch gestattet.
        </p>
        <p>
          Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden 
          die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche 
          gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam 
          werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von 
          Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Kontakt</h2>
        <p>
          Bei Fragen zum Impressum erreichen Sie uns unter:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p><strong>E-Mail:</strong> MarcoRudolph09@proton.me</p>
          <p><strong>Adresse:</strong> Marco Rudolph, No de Halloh 8a, 25591 Ottenbüttel</p>
          <p><strong>Telefon:</strong> 04893 9373110</p>
        </div>
      </section>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Hinweis:</strong> Dieses Impressum kann bei Bedarf aktualisiert werden. 
          Wesentliche Änderungen werden Ihnen per E-Mail mitgeteilt.
        </p>
      </div>
    </div>
  );
}

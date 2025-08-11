export const metadata = {
  title: "Cookie Richtlinie",
};

export default function CookiePolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-[#334269] space-y-4">
      <h1 className="text-3xl font-bold">Cookie Richtlinie</h1>
      <p>
        Diese Anwendung nutzt Supabase Auth für die Anmeldung über Google,
        Facebook und Magic Links. Die von Ihnen im Dashboard getätigten
        Einstellungen werden in einer Datenbank gespeichert und können mit
        Ihrem Instagram Konto verbunden werden, um Direktnachrichten und
        Kommentare automatisch zu beantworten.
      </p>
      <p>
        Wir verwenden folgende Arten von Cookies:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Funktionale Cookies</strong> – notwendig, damit die Seite ordnungsgemäß funktioniert.</li>
        <li><strong>Analytische Cookies</strong> – helfen uns zu verstehen, wie die Seite genutzt wird.</li>
        <li><strong>Marketing Cookies</strong> – dienen dazu, Ihnen relevante Angebote zu zeigen.</li>
      </ul>
      <p>
        Ihre Auswahl wird im Local Storage Ihres Browsers gespeichert. Zudem
        halten wir in einem lokalen Protokoll fest, wann und mit welchen
        Optionen Sie zugestimmt oder abgelehnt haben. Dieses Protokoll wird
        nicht an den Server übertragen.
      </p>
      <p>
        Sie können Ihre Entscheidung jederzeit löschen, indem Sie den Local
        Storage Ihres Browsers leeren. Beim nächsten Besuch erscheint der
        Banner erneut.
      </p>
      
      <section className="space-y-4 mt-8">
        <h2 className="text-2xl font-semibold">Kontakt</h2>
        <p>
          Bei Fragen zu unserer Cookie-Richtlinie erreichen Sie uns unter:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p><strong>E-Mail:</strong> MarcoRudolph09@proton.me</p>
          <p><strong>Adresse:</strong> Marco Rudolph, No de Halloh 8a, 25591 Ottenbüttel</p>
          <p><strong>Telefon:</strong> 04893 9373110</p>

        </div>
      </section>
    </div>
  );
}

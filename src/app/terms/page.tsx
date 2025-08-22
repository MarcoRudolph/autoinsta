export default function TermsOfService() {

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-[#334269] space-y-6">
      {/* Back Button and Language Switcher */}
      <div className="flex justify-between items-center mb-4">
        <a 
          href="/" 
          className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center"
        >
          ← Zurück zur Startseite
        </a>
        <a 
          href="/terms-en" 
          className="text-blue-600 hover:text-blue-800 underline text-sm"
        >
          English
        </a>
      </div>
      
      <h1 className="text-4xl font-bold text-center mb-8">Nutzungsbedingungen</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
        <p className="text-sm text-blue-800">
          <strong>Letzte Aktualisierung:</strong> {new Date().toLocaleDateString('de-DE')}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Einleitung</h2>
        <p>Willkommen bei rudolpho-chat! Diese Nutzungsbedingungen regeln die Nutzung unseres KI-gestützten Automatisierungsdienstes für Instagram-Interaktionen. Durch die Nutzung unseres Services stimmen Sie diesen Bedingungen zu.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Beschreibung unseres Dienstes</h2>
        
        <h3 className="text-xl font-semibold">2.1 Funktionsweise</h3>
        <p>rudolpho-chat ist eine KI-gestützte Plattform, die es Ihnen ermöglicht, automatisierte Antworten auf Instagram-Direktnachrichten und Kommentare zu erstellen. Unser Service funktioniert folgendermaßen:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Persona-Erstellung: Sie erstellen eine digitale Persönlichkeit mit spezifischen Eigenschaften, Kommunikationsstil und Antwortmustern</li>
          <li>KI-Integration: Unsere künstliche Intelligenz generiert automatisch passende Antworten basierend auf Ihrer definierten Persona</li>
          <li>Instagram-Automatisierung: Der Service kann automatisch auf eingehende Nachrichten und Kommentare antworten</li>
          <li>Anpassbare Einstellungen: Sie behalten die volle Kontrolle über alle automatisierten Antworten</li>
        </ul>

        <h3 className="text-xl font-semibold">2.2 Interaktion mit Meta-Plattformen</h3>
        <p>Unser Service interagiert mit Instagram (einer Meta-Plattform) über offizielle APIs:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Datenabfrage: Wir rufen nur die Daten ab, die für die Bereitstellung unseres Services erforderlich sind (z.B. eingehende Nachrichten, Kommentare)</li>
          <li>Datenübertragung: Antworten werden über die Instagram-API an die entsprechenden Empfänger gesendet</li>
          <li>Datensicherheit: Alle Datenübertragungen erfolgen verschlüsselt und über sichere Verbindungen</li>
          <li>Zustimmungspflicht: Wir greifen nur auf Ihre Instagram-Daten zu, wenn Sie dies ausdrücklich genehmigt haben</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Beziehung zu Meta Platforms, Inc.</h2>
        
        <h3 className="text-xl font-semibold">3.1 Unabhängigkeit von Meta</h3>
        <p>Wichtiger Hinweis: rudolpho-chat ist ein vollständig unabhängiger Dienst und wird weder von Meta Platforms, Inc. angeboten, gesponsert noch betrieben. Wir sind ein eigenständiges Unternehmen mit eigenen Geschäftsmodellen und Technologien.</p>

        <h3 className="text-xl font-semibold">3.2 Haftungsausschluss bezüglich Meta</h3>
        <p>Meta Platforms, Inc. ist nicht verantwortlich für:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Den Betrieb, die Funktionalität oder Verfügbarkeit unseres Services</li>
          <li>Den Inhalt der über unseren Service generierten Antworten</li>
          <li>Technische Probleme oder Ausfälle unseres Systems</li>
          <li>Unsere Geschäftspraktiken oder Verpflichtungen gegenüber Nutzern</li>
          <li>Datenschutz- oder Sicherheitsaspekte unseres Services</li>
        </ul>
        <p>Wir handeln als unabhängiger Dienstleister und sind allein verantwortlich für alle Aspekte unseres Services.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Nutzungsbedingungen</h2>
        
        <h3 className="text-xl font-semibold">4.1 Erlaubte Nutzung</h3>
        <p>Sie dürfen unseren Service nur für rechtmäßige Zwecke nutzen:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Automatisierung Ihrer eigenen Instagram-Interaktionen</li>
          <li>Erstellung von Personas für Ihre persönlichen oder geschäftlichen Zwecke</li>
          <li>Verwendung in Übereinstimmung mit Instagrams Nutzungsbedingungen</li>
        </ul>

        <h3 className="text-xl font-semibold">4.2 Verbotene Nutzung</h3>
        <p>Folgende Nutzungen sind nicht erlaubt:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Verletzung von Instagrams Nutzungsbedingungen oder Community-Richtlinien</li>
          <li>Spam, Belästigung oder missbräuchliches Verhalten</li>
          <li>Verwendung für illegale oder schädliche Zwecke</li>
          <li>Versuch, die Sicherheit unseres Systems zu kompromittieren</li>
          <li>Weitergabe Ihres Kontos an Dritte</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Konten und Abonnements</h2>
        
        <h3 className="text-xl font-semibold">5.1 Kostenlose Nutzung</h3>
        <p>Wir bieten einen kostenlosen Plan mit begrenzten Funktionen an:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>20 automatisierte Nachrichten pro Monat</li>
          <li>Grundlegende Persona-Erstellung</li>
          <li>Standard-Antwortvorlagen</li>
        </ul>

        <h3 className="text-xl font-semibold">5.2 Pro-Abonnement</h3>
        <p>Unser Pro-Plan bietet erweiterte Funktionen:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Unbegrenzte automatisierte Nachrichten</li>
          <li>Erweiterte KI-Antworten</li>
          <li>Prioritäts-Support</li>
          <li>Benutzerdefinierte Persona-Erstellung</li>
        </ul>
        <p><strong>Preis: 10€ pro Monat, kündbar jederzeit</strong></p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Datenschutz und Sicherheit</h2>
        <p>
          Der Schutz Ihrer Daten hat für uns höchste Priorität. Alle Details zur Datenverarbeitung finden Sie in unserer{" "}
          <a href="/privacy-new" className="text-blue-600 hover:underline">Datenschutzerklärung</a>.
        </p>
        <p>Wir implementieren umfassende Sicherheitsmaßnahmen zum Schutz Ihrer Daten und gewährleisten die Einhaltung aller geltenden Datenschutzbestimmungen.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Haftung und Gewährleistung</h2>
        <p>Unser Service wird 'wie besehen' bereitgestellt. Wir übernehmen keine Gewährleistung für ununterbrochene Verfügbarkeit oder fehlerfreie Funktionalität.</p>
        <p>Unsere Haftung ist auf den Betrag begrenzt, den Sie in den letzten 12 Monaten für unseren Service gezahlt haben.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">8. Änderungen der Nutzungsbedingungen</h2>
        <p>Wir behalten uns das Recht vor, diese Nutzungsbedingungen bei Bedarf zu ändern. Wesentliche Änderungen werden Ihnen per E-Mail mitgeteilt. Die fortgesetzte Nutzung unseres Services nach Änderungen gilt als Zustimmung zu den neuen Bedingungen.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">9. Kündigung</h2>
        <p>Sie können Ihr Konto jederzeit kündigen. Bei Kündigung werden alle Ihre Daten innerhalb von 30 Tagen gelöscht, sofern keine gesetzlichen Aufbewahrungsfristen entgegenstehen.</p>
        <p>Wir behalten uns das Recht vor, Konten zu sperren oder zu löschen, die gegen diese Nutzungsbedingungen verstoßen.</p>
        
        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
          <p className="text-blue-800">
            <strong>Datenlöschung:</strong> Sie können Ihre Daten auch vor der Kündigung selbst löschen. Eine detaillierte Anleitung finden Sie auf unserer{" "}
            <a href="/data-deletion" className="text-blue-600 hover:underline font-semibold">
              Datenlöschungs-Seite
            </a>.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">10. Kontakt</h2>
        <p>Bei Fragen zu diesen Nutzungsbedingungen erreichen Sie uns unter:</p>
        <div className="bg-gray-50 p-4 rounded-lg">
                      <p><strong>E-Mail:</strong> MarcoRudolph09@proton.me</p>
            <p><strong>Adresse:</strong> Marco Rudolph, No de Halloh 8a, 25591 Ottenbüttel</p>
            <p><strong>Telefon:</strong> 04893 9373110</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">11. Rechtliche Grundlagen</h2>
        <p>Diese Nutzungsbedingungen unterliegen deutschem Recht. Gerichtsstand ist, soweit gesetzlich zulässig, der Sitz unseres Unternehmens.</p>
      </section>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Hinweis: Diese Nutzungsbedingungen können bei Bedarf aktualisiert werden. Wesentliche Änderungen werden Ihnen per E-Mail mitgeteilt.</strong>
        </p>
      </div>
    </div>
  );
} 
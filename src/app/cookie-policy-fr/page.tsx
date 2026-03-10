export const metadata = {
  title: "Politique des cookies",
};

export default function CookiePolicyFr() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-[#334269] space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <a
          href="/"
          className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center"
        >
          ← Retour à l&apos;accueil
        </a>
        <div className="flex flex-wrap gap-2 text-sm">
          <a href="/cookie-policy" className="text-blue-600 hover:underline">Deutsch</a>
          <span className="text-gray-400">|</span>
          <a href="/cookie-policy-en" className="text-blue-600 hover:underline">English</a>
          <span className="text-gray-400">|</span>
          <span className="text-gray-500">Français</span>
          <span className="text-gray-400">|</span>
          <a href="/cookie-policy-es" className="text-blue-600 hover:underline">Español</a>
          <span className="text-gray-400">|</span>
          <a href="/cookie-policy-it" className="text-blue-600 hover:underline">Italiano</a>
          <span className="text-gray-400">|</span>
          <a href="/cookie-policy-pt" className="text-blue-600 hover:underline">Português</a>
        </div>
      </div>

      <h1 className="text-3xl font-bold">Politique des cookies</h1>
      <p>
        Cette application utilise Supabase Auth pour la connexion via
        Google, Facebook et les Magic Links. Les paramètres que vous
        effectuez dans le tableau de bord sont stockés dans une base de
        données et peuvent être liés à votre compte Instagram pour
        répondre automatiquement aux messages directs et commentaires.
      </p>
      <p>Nous utilisons les types de cookies suivants :</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Cookies fonctionnels</strong> – nécessaires au bon
          fonctionnement du site.
        </li>
        <li>
          <strong>Cookies analytiques</strong> – nous aident à comprendre
          comment le site est utilisé.
        </li>
        <li>
          <strong>Cookies marketing</strong> – servent à vous proposer des
          offres pertinentes.
        </li>
      </ul>
      <p>
        Vos choix sont stockés dans le stockage local de votre navigateur.
        Nous conservons également un journal local indiquant quand et
        quelles options vous avez acceptées ou refusées. Ce journal n’est
        pas transmis au serveur.
      </p>
      <p>
        Vous pouvez supprimer votre décision à tout moment en vidant le
        stockage local de votre navigateur. Lors de votre prochaine visite,
        la bannière réapparaîtra.
      </p>

      <section className="space-y-4 mt-8">
        <h2 className="text-2xl font-semibold">Contact</h2>
        <p>
          Pour toute question concernant notre politique des cookies,
          contactez-nous à :
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p>
            <strong>E-mail :</strong> MarcoRudolph09@proton.me
          </p>
          <p>
            <strong>Adresse :</strong> Marco Rudolph, No de Halloh 8a,
            25591 Ottenbüttel
          </p>
          <p>
            <strong>Téléphone :</strong> 04893 9373110
          </p>
        </div>
      </section>
    </div>
  );
}

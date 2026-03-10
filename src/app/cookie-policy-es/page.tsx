export const metadata = {
  title: "Política de cookies",
};

export default function CookiePolicyEs() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-[#334269] space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <a
          href="/"
          className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center"
        >
          ← Volver al inicio
        </a>
        <div className="flex flex-wrap gap-2 text-sm">
          <a href="/cookie-policy" className="text-blue-600 hover:underline">Deutsch</a>
          <span className="text-gray-400">|</span>
          <a href="/cookie-policy-en" className="text-blue-600 hover:underline">English</a>
          <span className="text-gray-400">|</span>
          <a href="/cookie-policy-fr" className="text-blue-600 hover:underline">Français</a>
          <span className="text-gray-400">|</span>
          <span className="text-gray-500">Español</span>
          <span className="text-gray-400">|</span>
          <a href="/cookie-policy-it" className="text-blue-600 hover:underline">Italiano</a>
          <span className="text-gray-400">|</span>
          <a href="/cookie-policy-pt" className="text-blue-600 hover:underline">Português</a>
        </div>
      </div>

      <h1 className="text-3xl font-bold">Política de cookies</h1>
      <p>
        Esta aplicación utiliza Supabase Auth para iniciar sesión mediante
        Google, Facebook y Magic Links. La configuración que realices en
        el panel se almacena en una base de datos y puede vincularse a tu
        cuenta de Instagram para responder automáticamente a mensajes
        directos y comentarios.
      </p>
      <p>Utilizamos los siguientes tipos de cookies:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Cookies funcionales</strong> – necesarias para que el
          sitio funcione correctamente.
        </li>
        <li>
          <strong>Cookies analíticas</strong> – nos ayudan a entender cómo
          se utiliza el sitio.
        </li>
        <li>
          <strong>Cookies de marketing</strong> – sirven para mostrarte
          ofertas relevantes.
        </li>
      </ul>
      <p>
        Tus elecciones se almacenan en el almacenamiento local de tu
        navegador. También mantenemos un registro local de cuándo y con
        qué opciones aceptaste o rechazaste. Este registro no se transmite
        al servidor.
      </p>
      <p>
        Puedes eliminar tu decisión en cualquier momento vaciando el
        almacenamiento local de tu navegador. En tu próxima visita, el
        banner volverá a aparecer.
      </p>

      <section className="space-y-4 mt-8">
        <h2 className="text-2xl font-semibold">Contacto</h2>
        <p>
          Para preguntas sobre nuestra política de cookies, contáctanos en:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p>
            <strong>Correo:</strong> MarcoRudolph09@proton.me
          </p>
          <p>
            <strong>Dirección:</strong> Marco Rudolph, No de Halloh 8a,
            25591 Ottenbüttel
          </p>
          <p>
            <strong>Teléfono:</strong> 04893 9373110
          </p>
        </div>
      </section>
    </div>
  );
}

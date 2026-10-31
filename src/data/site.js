export const externalLinks = {
  home: 'https://aseccss.com/',
  afiliacion: 'https://aseccss.com/afiliacion/',
  tarjetas: 'https://aseccss.com/tarjetas/',
  convenios: 'https://aseccss.com/convenios/',
  vivienda: 'https://aseccss.com/viviendas/',
  vehiculo: 'https://aseccss.com/vehiculos/',
  ahorros: 'https://aseccss.com/ahorros/',
  app: 'https://aseccss.com/app-aseccss-movil/',
  psl: 'https://www.aseccssenlinea.com/',
  sucursales: 'https://aseccss.com/sucursales-y-asesores/',
  contacto: 'https://aseccss.com/contactanos/',
  condiciones: 'https://aseccss.com/condiciones/',
  privacidad: 'https://aseccss.com/privacidad/',
  canales: 'https://aseccss.com/canales-de-atencion/',
  ayuda: 'https://aseccss.com/ayuda/',
  whatsapp: 'https://wa.me/50688949345?text=Hola,%20deseo%20informaci%C3%B3n.',
  phone: 'tel:8002732277',
  phoneLabel: '800 273 2277',
  email: 'servicioalasociado@aseccss.com',
  facebook: 'https://www.facebook.com/aseccss/',
  instagram: 'https://www.instagram.com/aseccss/',
  linkedin: 'https://cr.linkedin.com/company/aseccss-costa-rica',
}

export const mainNav = [
  { label: 'Afiliación', href: externalLinks.afiliacion },
  { label: 'Tarjetas', href: externalLinks.tarjetas },
  { label: 'Convenios', href: externalLinks.convenios },
  { label: 'Créditos', to: '/creditos' },
  { label: 'Vivienda', href: externalLinks.vivienda },
  { label: 'Vehículo', href: externalLinks.vehiculo },
  { label: 'Ahorros', href: externalLinks.ahorros },
  { label: 'App ASECCSS Móvil', href: externalLinks.app },
]

export const demoPerson = {
  name: 'Asociada de demostración',
  identifier: 'DEMO-1042',
  email: 'demo.pregestion@ejemplo.local',
  phone: '8888-0000',
  notice:
    'Esta ficha es ficticia. No representa a una persona asociada de ASECCSS y no está conectada a la Plataforma de Servicios en Línea.',
}

export const processFaqs = [
  {
    question: '¿Esta pregestión aprueba el crédito?',
    answer:
      'No. El prototipo solo ayuda a ordenar una pregestión de demostración. El análisis, la formalización y la aprobación corresponden a ASECCSS por sus canales oficiales.',
  },
  {
    question: '¿Se envían mis documentos a ASECCSS?',
    answer:
      'No. Solo se guardan el nombre y el tamaño en la base de demostración. El archivo no se almacena ni se envía a ASECCSS. No adjuntes cédulas, colillas ni documentos reales.',
  },
  {
    question: '¿Debo escribir mi cédula real?',
    answer:
      'No hace falta. Para la demostración podés usar un identificador como DEMO-0001. Lo que escribas queda en la base local del prototipo, no en ASECCSS.',
  },
  {
    question: '¿De dónde salen las tasas y los montos?',
    answer:
      'Solo se muestran cifras que estaban publicadas en aseccss.com el 18 de octubre de 2026. Pueden cambiar. Confirmá siempre la vigencia con ASECCSS.',
  },
  {
    question: '¿Por qué algunas líneas no muestran cifras?',
    answer:
      'Porque la página pública consultada no detalla monto, plazo o tasa para esa finalidad. En ese caso el módulo pide consultar las condiciones vigentes con la asociación.',
  },
]

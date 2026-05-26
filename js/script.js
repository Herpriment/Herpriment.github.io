
// --- Utilidades pequeñas para manipular el DOM y formateo (fáciles de entender) ---
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));
const createEl = (tag, className) => { const el = document.createElement(tag); if (className) el.className = className; return el; };

const page = document.body.dataset.page || 'home';
const basePath = window.location.pathname.includes('/html/') ? '../' : '';
const dataPath = `${basePath}data/info.json`;
const themeToggle = document.getElementById('themeToggle');
// Crear/añadir botón de idioma si no existe
let langToggle = document.getElementById('langToggle');
if (!langToggle) {
  const nav = document.querySelector('.navbar');
  if (nav) {
    langToggle = document.createElement('button');
    langToggle.id = 'langToggle';
    langToggle.type = 'button';
    langToggle.className = 'btn btn-outline-secondary ms-2';
    langToggle.textContent = 'ES';
    const rightGroup = nav.querySelector('.collapse .ms-auto') || nav.querySelector('.collapse');
    // add next to themeToggle when possible
    const btnContainer = nav.querySelector('.collapse');
    if (themeToggle && themeToggle.parentNode) themeToggle.parentNode.insertBefore(langToggle, themeToggle.nextSibling);
    else if (btnContainer) btnContainer.appendChild(langToggle);
  }
}

// Formatea una cadena de dígitos en bloques de 4 para números de tarjeta
function formatCardNumber(value) {
  const digits = (value || '').replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

// Formatea expiración a MM/AA
function formatExp(value) {
  let v = (value || '').replace(/\D/g, '').slice(0, 4);
  if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2);
  return v;
}

function resolveImagePath(src) {
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('/')) return src;
  return `${basePath}${src}`;
}

// Aplicar tema guardado siempre, incluso si no hay botón en la página
const savedTheme = localStorage.getItem('punoTheme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark');
}

if (themeToggle) {
  themeToggle.textContent = document.body.classList.contains('dark') ? 'Modo claro' : 'Modo oscuro';
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('punoTheme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? 'Modo claro' : 'Modo oscuro';
    // Actualizar estilo de la tabla de itinerario cuando cambie el tema
    updateItineraryTableTheme();
  });
}

// Variables globales para datos dinámicos
let globalDestinos = null;
let globalCultura = null;
let globalGastronomia = null;

// Simple I18N mappings (Español / Quechua - aproximado)
const translations = {
  es: {
    nav_destinos: 'Destinos',
    nav_cultura: 'Cultura',
    nav_gastronomia: 'Gastronomía',
    nav_pueblos: 'Pueblos',
    nav_itinerario: 'Itinerario',
    theme_dark: 'Modo oscuro',
    theme_light: 'Modo claro',
    page_title: 'Crear itinerario',
    page_subtitle: 'Rellena los datos para generar un itinerario y ver el presupuesto estimado.',
    choose_class: 'Elige una clase y confirma el precio',
    table_header_class: 'Clase',
    table_header_price: 'Precio por día (S/)',
    table_header_total: 'Total (según días y personas)',
    table_header_select: 'Seleccionar',
    class_economico: 'Económico',
    class_estandar: 'Estándar',
    class_lujoso: 'Lujoso',
    button_select: 'Seleccionar',
    label_name: 'Nombre completo',
    invalid_name: 'Ingresa un nombre válido (sin "@").',
    label_email: 'Correo electrónico',
    invalid_email: 'Ingresa un correo válido.',
    label_destination: 'Destino preferido',
    placeholder_destination: 'Elige un destino...',
    invalid_destination: 'Selecciona un destino válido.',
    label_class: 'Clase',
    label_people: 'Número de personas',
    invalid_people: 'Indica al menos 1 persona.',
    label_days: 'Días',
    budget_prefix: 'Presupuesto estimado: ',
    button_generate: 'Generar itinerario',
    page_destinos_title: 'Destinos - Puno Digital',
    page_destinos_subtitle: 'Explora y filtra los lugares recomendados para visitar en Puno.',
    carousel_prev: 'Anterior',
    carousel_next: 'Siguiente',
    map_title: 'Mapa',
    tab_resumen: 'Resumen',
    tab_historia: 'Historia',
    tab_recomendaciones: 'Recomendaciones',
    filter_all: 'Todos',
    filter_lago: 'Lago Titicaca',
    filter_comunidades: 'Comunidades',
    filter_arqueologia: 'Arqueología',
    button_details: 'Detalles',
    button_itinerary: 'Itinerario',
    category_lago: 'Lago Titicaca',
    category_comunidades: 'Comunidades',
    category_arqueologia: 'Arqueología',
    home_title: 'Puno Digital | Turismo, Cultura y Gastronomía',
    badge_project: 'Proyecto UNAP — Ingeniería de Sistemas',
    hero_title: 'Descubre Puno: turismo, cultura y gastronomía',
    hero_subtitle: 'Conoce el lago Titicaca, las islas flotantes, festividades ancestrales y platos típicos del altiplano.',
    button_view_destinos: 'Ver destinos',
    button_view_gastronomia: 'Ver gastronomía',
    button_view_recipe: 'Ver receta',
    section_destinos_title: 'Destinos turísticos icónicos',
    section_destinos_text: 'Visita lugares como las islas flotantes de los Uros, Taquile, Amantaní y Sillustani.',
    button_go_destinos: 'Ir a destinos',
    card_lago_title: 'Lago Titicaca',
    card_lago_desc: 'El lago navegable más alto del mundo, rodeado de comunidades y paisajes únicos.',
    card_uros_title: 'Islas Flotantes de los Uros',
    card_uros_desc: 'Comunidades construidas sobre totora que mantienen técnicas ancestrales.',
    card_sillustani_title: 'Sillustani',
    card_sillustani_desc: 'Conocidas chulpas funerarias ubicadas junto al lago Umayo.',
    section_cultura_title: 'Cultura viva de Puno',
    section_cultura_text: 'Tradiciones, danzas y tejidos que conservan la identidad del altiplano.',
    section_pueblos_title: 'Pueblos originarios: Quechua y Aymara',
    section_pueblos_text: 'Una breve presentación de su historia, lengua y aportes culturales.',
    image_quechua_alt: 'Comunidad quechua',
    pueblo_quechua_name: 'Quechua',
    pueblo_quechua_history_title: 'Historia',
    pueblo_quechua_history_text: 'Los quechua tienen raíces en las civilizaciones andinas y alcanzaron gran desarrollo durante el Imperio Inca. Hoy su lengua y tradiciones siguen vivas en gran parte de los Andes.',
    pueblo_quechua_contrib_title: 'Aportes culturales',
    pueblo_quechua_contrib_text: 'Destacan por su agricultura en terrazas, técnicas de riego, conservación de alimentos y una rica tradición textil y oral.',
    image_aymara_alt: 'Comunidad aymara',
    pueblo_aymara_name: 'Aymara',
    pueblo_aymara_history_title: 'Historia',
    pueblo_aymara_history_text: 'Los aymara habitan principalmente el altiplano alrededor del Titicaca; su cultura antecede al Imperio Inca y conserva prácticas comunitarias y lingüísticas propias.',
    pueblo_aymara_contrib_title: 'Aportes culturales',
    pueblo_aymara_contrib_text: 'Son conocidos por su organización comunitaria, crianza de camélidos (alpacas y llamas), conocimientos agrícolas y elaboración textil tradicional.',
    button_view_cultura: 'Ver cultura',
    feature_festividades_title: 'Festividades',
    feature_festividades_text: 'La Virgen de la Candelaria reúne a miles de danzantes y músicos en una gran muestra de folklore.',
    feature_danzas_title: 'Danzas típicas',
    feature_danzas_text: 'La morenada, la diablada y otras danzas relatan historias del encuentro cultural en la región.',
    feature_textiles_title: 'Textiles andinos',
    feature_textiles_text: 'Los tejidos y prendas tradicionales muestran patrones, colores y técnicas ancestrales.',
    card_pueblos_title: 'Conoce a los pueblos originarios',
    card_pueblos_text: 'Historias y tradiciones de las comunidades que habitan el altiplano.',
    button_view_pueblos: 'Ver pueblos',
    section_gastronomia_title: 'Gastronomía puneña',
    section_gastronomia_text: 'Sabores del altiplano: recetas tradicionales e ingredientes autóctonos.',
    button_view_gastronomia_secondary: 'Ver gastronomía',
    dish_cuy_title: 'Cuy chactado',
    dish_cuy_text: 'Plato tradicional frito, muy apreciado en festividades.',
    dish_trucha_title: 'Trucha frita',
    dish_trucha_text: 'Trucha fresca del lago, preparada de forma sencilla y sabrosa.',
    dish_api_title: 'Api con pastel',
    dish_api_text: 'Bebida caliente de maíz morado, acompañada de pastel o buñuelos.',
    page_gastronomia_title: 'Gastronomía - Puno Digital',
    page_gastronomia_subtitle: 'Platos tradicionales y productos típicos de Puno.',
    modal_recipe_title: 'Receta',
    recipe_ingredients_title: 'Ingredientes',
    recipe_preparation_title: 'Preparación',
    cta_title: 'Planifica tu viaje a Puno',
    cta_text: 'Crea un itinerario personalizado con presupuesto estimado y recomendaciones.',
    button_create_itinerary: 'Crear itinerario',
    modal_payment_title: 'Pago del itinerario',
    label_card_name: 'Nombre en la tarjeta',
    invalid_card_name: 'Nombre requerido.',
    label_card_number: 'Número de tarjeta',
    invalid_card_number: 'Número inválido (16 dígitos).',
    label_exp: 'Expiración (MM/AA)',
    invalid_exp: 'Formato MM/AA.',
    label_cvv: 'CVV',
    invalid_cvv: 'CVV inválido (3 o 4 dígitos).',
    button_confirm_payment: 'Confirmar pago',
    modal_confirm_title: '¡LISTO!',
    modal_confirm_message: 'La confirmación fue enviada por correo. Revisa tu bandeja de entrada.',
    button_back_home: 'Volver al inicio',
    class_selected_prefix: 'Seleccionada: ',
    itinerary_generated_title: 'Itinerario generado',
    itinerary_summary_note: 'Se generó un resumen. Para confirmar, pulsa Pagar.',
    itinerary_thanks: 'Gracias',
    itinerary_ready: 'está listo.',
    day_label: 'Día',
    label_destination: 'Destino preferido',
    first_day_activity: 'Llegada, recorrido por el centro y aclimatación.',
    other_day_activity: 'Visitas y actividades locales.',
    button_pay: 'Pagar',
    social_facebook: 'Facebook',
    social_instagram: 'Instagram',
    social_twitter: 'Twitter',
    footer_unap: 'Universidad Nacional del Altiplano - Puno',
    footer_copyright: '© 2026 Puno Digital. Todos los derechos reservados.',
    meta_description: 'Puno Digital — guía turística del altiplano: destinos, cultura y gastronomía alrededor del lago Titicaca.',
    og_title: 'Puno Digital - Turismo en Puno',
    og_description: 'Explora destinos, festividades y platos típicos de Puno en una web responsiva.',
    og_image: 'images/Destinos/Lago Titicaca.jpg'
  },
  qu: {
    nav_destinos: 'Llaqtakuna',
    nav_cultura: 'Kultura',
    nav_gastronomia: 'Mikhuna',
    nav_pueblos: 'Ayllukuna',
    nav_itinerario: 'Itinerario',
    theme_dark: "Ch'isi", // oscuro
    theme_light: 'Kanchay',
    page_title: 'Itinerario ruray',
    page_subtitle: 'Tapuy datoskuna, ruray itinerario. Qhipa qipaykunaqa ruwaspa.',
    choose_class: 'Klaseta pillay, preciosqa chastaq.',
    table_header_class: 'Clase',
    table_header_price: 'Precio pacha (S/)',
    table_header_total: 'Total (kunata & runakunapa)',
    table_header_select: 'Pillay',
    class_economico: 'Aswan',
    class_estandar: 'Chay',
    class_lujoso: 'Sumaj',
    button_select: 'Pillay',
    label_name: 'Suti tukuy',
    invalid_name: '@ mana qam qillqaychu.',
    label_email: 'Correo electrónico',
    invalid_email: '@ chaymanta qillqayniyuq.',
    label_destination: 'Sapa llaqtamanta',
    placeholder_destination: 'Wasita chaskiy...',
    invalid_destination: 'Sapa llaqtamanta mana kachkanchu.',
    label_class: 'Clase',
    label_people: 'Runakuna',
    invalid_people: 'Huk runa hina chiqninchik.',
    label_days: 'Killa',
    budget_prefix: 'Qanchisma qapariykuna: ',
    button_generate: 'Itinerario ruray',
    page_destinos_title: 'Llaqtakuna - Puno Digital',
    page_destinos_subtitle: 'Chay llaqtakuna chinkaykuna, riqsiy qhawaqkuna.',
    carousel_prev: 'Chaymana',
    carousel_next: 'Qhipa',
    map_title: 'Mapa',
    tab_resumen: 'Riwri',
    tab_historia: 'Qillqay',
    tab_recomendaciones: 'Yanapaykuna',
    filter_all: 'Llapa',
    filter_lago: 'Titicaca cocha',
    filter_comunidades: 'Ayllukunamanta',
    filter_arqueologia: 'Arqueología',
    button_details: 'Rikhuy',
    button_itinerary: 'Itinerario',
    category_lago: 'Titicaca cocha',
    category_comunidades: 'Ayllukunamanta',
    category_arqueologia: 'Arqueología',
    home_title: 'Puno Digital | Turismo, Kultura, Mikhuna',
    badge_project: 'UNAP Ruray | Sistemas Yachay',
    hero_title: "Puno lliklla rikch'ay",
    hero_subtitle: 'Tapuy datoskuna, qhipa qipaykunaq itinerario ruray. Pachamama lliklla tukuyta rikuy.',
    button_view_destinos: 'Llaqtakunata rikuy',
    button_view_gastronomia: 'Mikhunata rikuy',
    button_view_recipe: 'Mikhuna rikhuy',
    section_destinos_title: 'Llaqtakuna chaylla',
    section_destinos_text: 'Uros, Taquile, Amantani, Sillustani nisqakuna riksiy.',
    button_go_destinos: 'Llaqtakunata rikuy',
    card_lago_title: 'Titicaca cocha',
    card_lago_desc: 'Kawsaypi kankunataqa mayqin uraykuna, achuqa runakunawan chinkaykuna.',
    card_uros_title: 'Uros llaqtakuna',
    card_uros_desc: 'Totora masunku qhipa llaqtakuna hamuq cocha qichwapi.',
    card_sillustani_title: 'Sillustani',
    card_sillustani_desc: 'Umayo cochan manaraq kawsaypi purinakuq chulpakuna.',
    section_cultura_title: 'Puno kultura',
    section_cultura_text: 'Ayllukuna rimanakuykuna, diablada, taparichi qillqaykuna.',
    section_pueblos_title: 'Ayllukuna: Quechua y Aymara',
    section_pueblos_text: 'Wasikunawan historia, simi, willaykuna chay altiplanopi.',
    image_quechua_alt: 'Quechua llaqtamanta',
    pueblo_quechua_name: 'Quechua',
    pueblo_quechua_history_title: 'Qillqa (Historia)',
    pueblo_quechua_history_text: 'Quechua llaqtakunaqa qhipa suti kay pachapi rimaykuna, Inka qhipa maymantam riksiy. Simi quechuaqa sudamérica llaqtakunapi rikchaykunaqa; kay pachaqa millonkunapi rimaqmi.',
    pueblo_quechua_contrib_title: 'Wanuykuna (Contribuciones culturales)',
    pueblo_quechua_contrib_text: "Quechuakunaqa terrazas ruran, irrigaciónqa y qawachiy tekhnikunawanqa munan. Ch'uspa, simbuluq runa qichwa willaykunaqa aswanmi.",
    image_aymara_alt: 'Aymara llaqtamanta',
    pueblo_aymara_name: 'Aymara',
    pueblo_aymara_history_title: 'Qillqa (Historia)',
    pueblo_aymara_history_text: 'Aymara llaqtakuna Titicaca cochapi kawsan. Inka qhipa purichiyqa awaqkuna qhipa willaykuna riksiy. Kawsayta qhawariykunaqa chaypi kan.',
    pueblo_aymara_contrib_title: 'Wanuykuna (Contribuciones culturales)',
    pueblo_aymara_contrib_text: 'Aymarakunaqa ayllu organizacionpi runakunamanta ruwan, camélido crianza alpaca llamaq riksiy. Tekstiles, ceremonia Pachamamaqa aswanmi.',
    button_view_cultura: 'Kultura rikuy',
    feature_festividades_title: 'Festividadkuna',
    feature_festividades_text: "Candelaria mamallaqa tantakuykuna, takiykuna, wawanakuna llamk'anan.",
    feature_danzas_title: 'Waltakuna',
    feature_danzas_text: 'Morenada, diablada, caporalesqa runakunapa qillqaykunata riksiy.',
    feature_textiles_title: "Andino ch'uspa",
    feature_textiles_text: "Ch'uspa ch'uychaykuna, anqasqa q'ayachakunata qillqaykuna.",
    card_pueblos_title: 'Ayllukuna riksiy',
    card_pueblos_text: 'Quechua, Aymara llaqtakuna rimasiy, qichwata qhawasiy.',
    button_view_pueblos: 'Ayllukuna rikuy',
    section_gastronomia_title: 'Mikhuna Puno',
    section_gastronomia_text: "Altiplano mikhuna, willaykuna, qiwña simi ch'usaq.",
    button_view_gastronomia_secondary: 'Mikhuna rikuy',
    dish_cuy_title: 'Cuy chactado',
    dish_cuy_text: "Puno mikhunamanta wiraqha tinkunakuy, ch'usaqllachu.",
    dish_trucha_title: 'Phutune ruwachiy',
    dish_trucha_text: 'Titicaca cochata qipay, phutunamanta sumaq.',
    dish_api_title: 'Api tukuy',
    dish_api_text: "Q'illu misi hukwamanta mikhuy, pastelpa hamp'ispa.",
    page_gastronomia_title: 'Mikhuna - Puno Digital',
    page_gastronomia_subtitle: 'Mikhuna, mikhunapa willaykuna: cuy, phutu, chuño, quinoawanmi.',
    modal_recipe_title: 'Mikhuna ruwan',
    recipe_ingredients_title: 'Willaykunata (Ingredientes)',
    recipe_preparation_title: 'Ruray (Preparación)',
    cta_title: 'Puno hamuy qhaway',
    cta_text: 'Ruray itinerario, qanchismanta riykuy, rutamanta yachay.',
    button_create_itinerary: 'Itinerario ruray',
    modal_payment_title: 'Itinerio qipay',
    label_card_name: 'Tarjetamanta sutiy',
    invalid_card_name: 'Suti ruwanqachu.',
    label_card_number: 'Tarjeta numera',
    invalid_card_number: '16 churoq hina.',
    label_exp: 'Qhipoy (MM/AA)',
    invalid_exp: 'MM/AA hukninchik.',
    label_cvv: 'CVV',
    invalid_cvv: '3 o 4 churoqmi.',
    button_confirm_payment: 'Qipay ruwan',
    modal_confirm_title: '¡RIMAYKA!',
    modal_confirm_message: 'Emailmanta qillqaykuna tuyuykuchkan. Chaymi riqsiy.',
    button_back_home: 'Yanapana hamuy',
    class_selected_prefix: 'Pillachisqa: ',
    itinerary_generated_title: 'Itinerario ruray',
    itinerary_summary_note: 'Itinerarioqa ruwasqa. Qipay ruwanmi.',
    itinerary_thanks: 'Sulpayki',
    itinerary_ready: 'kawsaymi.',
    day_label: 'Killa',
    first_day_activity: 'Qallariykuy hina, llaqtallata ruwasqa. Wasiwan qaway.',
    other_day_activity: 'Llaqta ruwasqa, munaykunata riksiy.',
    button_pay: 'Qipay'
    ,
    social_facebook: 'Facebook',
    social_instagram: 'Instagram',
    social_twitter: 'Twitter',
    footer_unap: 'Universidad Nacional del Altiplano - Puno',
    footer_copyright: '© 2026 Puno Digital. Todos los derechos reservados.'
  }
};

function t(key) {
  const lang = localStorage.getItem('punoLang') || 'es';
  return (translations[lang] && translations[lang][key]) || translations.es[key] || key;
}

function translateCategory(category) {
  const map = {
    'Lago Titicaca': 'category_lago',
    'Comunidades': 'category_comunidades',
    'Arqueología': 'category_arqueologia'
  };
  const key = map[category] || category;
  return key.startsWith('category_') ? t(key) : category;
}

function translatePage(lang) {
  if (!lang) lang = localStorage.getItem('punoLang') || 'es';
  localStorage.setItem('punoLang', lang);
  document.documentElement.lang = lang === 'qu' ? 'qu' : 'es';
  if (langToggle) langToggle.textContent = lang.toUpperCase();
  const dict = translations[lang] || translations.es;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const text = dict[key];
    if (text === undefined) return;
    const attr = el.dataset.i18nAttr;
    if (attr === 'placeholder') {
      el.placeholder = text;
    } else if (attr === 'value') {
      el.value = text;
    } else if (attr === 'html') {
      el.innerHTML = text;
    } else if (attr === 'content') {
      el.setAttribute('content', text);
    } else {
      el.textContent = text;
    }
  });
  if (themeToggle) themeToggle.textContent = document.body.classList.contains('dark') ? dict.theme_light : dict.theme_dark;
  const budgetEstimate = document.getElementById('budgetEstimate');
  if (budgetEstimate) {
    const current = budgetEstimate.textContent || '';
    const amount = current.includes('S/') ? current.substring(current.indexOf('S/')).trim() : current.split(':').slice(1).join(':').trim();
    budgetEstimate.textContent = dict.budget_prefix + (amount ? amount : '-');
  }
}

function applyLanguage(lang) {
  translatePage(lang);
  // Re-renderizar contenidos dinámicos si existen (sin re-agregar listeners)
  if (page === 'destinos' && globalDestinos) initDestinos(globalDestinos);
  if (page === 'cultura' && globalCultura) initCultura(globalCultura);
  if (page === 'gastronomia' && globalGastronomia) initGastronomia(globalGastronomia);
}

// Initialize language from localStorage
const savedLang = localStorage.getItem('punoLang') || 'es';
applyLanguage(savedLang);

if (langToggle) {
  langToggle.addEventListener('click', () => {
    const current = localStorage.getItem('punoLang') || 'es';
    const next = current === 'es' ? 'qu' : 'es';
    applyLanguage(next);
  });
}

// Alterna la clase que hace la tabla de itinerario completamente negra con texto blanco
function updateItineraryTableTheme() {
  const table = document.getElementById('priceTable');
  if (!table) return;
  if (document.body.classList.contains('dark')) {
    table.classList.add('itinerary-dark');
  } else {
    table.classList.remove('itinerary-dark');
  }
}

// Aplicar inmediatamente si el tema guardado es oscuro
updateItineraryTableTheme();

async function fetchData() {
  try {
    const response = await fetch(dataPath);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Error cargando datos:', error);
    return null;
  }
}

function createDestinationCard(destino) {
  const lang = localStorage.getItem('punoLang') || 'es';
  const name = destino[`name_${lang}`] || destino.name;
  const description = destino[`description_${lang}`] || destino.description;
  const category = destino[`category_${lang}`] || destino.category;
  const card = document.createElement('div');
  card.className = 'col-md-6 col-lg-4';
  card.innerHTML = `
    <article class="card shadow-sm card-hover h-100 card-destino">
      <img src="${resolveImagePath(destino.image)}" class="card-img-top" alt="${name}">
      <div class="card-body d-flex flex-column">
        <h3 class="h5 card-title">${name}</h3>
        <p class="card-text text-muted">${description}</p>
        <div class="mt-auto d-flex justify-content-between align-items-center">
          <span class="badge bg-primary">${translateCategory(category)}</span>
          <div>
            <button class="btn btn-sm btn-outline-secondary me-2 btn-details" data-id="${destino.id}">${t('button_details')}</button>
            <button class="btn btn-sm btn-primary btn-itinerary" data-id="${destino.id}">${t('button_itinerary')}</button>
          </div>
        </div>
      </div>
    </article>
  `;
  return card;
}

// --- Inicializadores: reciben datos y actualizan la UI ---
// Cada función está documentada y usa selectores locales para mayor claridad.

function setActiveFilter(button) {
  document.querySelectorAll('.filter-btn').forEach((btn) => btn.classList.remove('active'));
  if (button) button.classList.add('active');
}

function filterDestinos(destinos, category) {
  const container = document.getElementById('destinoContainer');
  if (!container) return;
  container.innerHTML = '';
  const filtered = category === 'Todos' ? destinos : destinos.filter((item) => item.category === category);
  filtered.forEach((destino) => container.append(createDestinationCard(destino)));
}

function initDestinos(destinos) {
  globalDestinos = destinos; // Guardar para re-renderizar al cambiar idioma
  const categories = [
    { value: 'Todos', label: 'filter_all' },
    { value: 'Lago Titicaca', label: 'filter_lago' },
    { value: 'Comunidades', label: 'filter_comunidades' },
    { value: 'Arqueología', label: 'filter_arqueologia' }
  ];
  const filterRow = $('#destinoFilters');
  const container = $('#destinoContainer');
  if (filterRow && container) {
    filterRow.innerHTML = ''; // Limpiar botones previos
    categories.forEach((category, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn btn-outline-primary me-2 mb-2 filter-btn${index === 0 ? ' active' : ''}`;
      btn.textContent = t(category.label);
      btn.addEventListener('click', () => {
        setActiveFilter(btn);
        filterDestinos(destinos, category.value);
      });
      filterRow.append(btn);
    });
    filterDestinos(destinos, 'Todos');
  }

  const mapElement = document.getElementById('map');
  if (mapElement && typeof L !== 'undefined') {
    const map = L.map(mapElement).setView([-15.836, -69.0], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    destinos.forEach((destino) => {
      if (destino.coords) {
        L.marker(destino.coords)
          .addTo(map)
          .bindPopup(`<strong>${destino.name}</strong><br>${destino.category}`);
      }
    });
  }

  // Poblar carousel de destinos si existe
  const carouselInner = $('#destinosCarousel .carousel-inner');
  if (carouselInner) {
    carouselInner.innerHTML = '';
    destinos.forEach((d, idx) => {
      const item = document.createElement('div');
      item.className = `carousel-item${idx === 0 ? ' active' : ''}`;
      item.innerHTML = `<img src="${resolveImagePath(d.image)}" class="d-block w-100 rounded" alt="${d.name}">`;
      carouselInner.appendChild(item);
    });
  }

  // Delegación de eventos para botones de detalle e itinerario
  const containerEl = $('#destinoContainer');
  if (containerEl) {
    containerEl.addEventListener('click', (ev) => {
      const btn = ev.target.closest('.btn-details');
      if (btn) return showDestinoDetails(btn.dataset.id, destinos);

      const itinBtn = ev.target.closest('.btn-itinerary');
      if (itinBtn) {
        const destino = destinos.find((x) => x.id === itinBtn.dataset.id);
        if (!destino) return;
        try { sessionStorage.setItem('punoSelectedDestino', JSON.stringify(destino)); } catch (e) { console.warn('sessionStorage no disponible'); }
        window.location.href = `${basePath}html/itinerario.html`;
      }
    });
  }
}

// Muestra detalles del destino en el modal (separado para claridad)
function showDestinoDetails(id, destinos) {
  const destino = destinos.find((x) => x.id === id);
  if (!destino) return;
  const lang = localStorage.getItem('punoLang') || 'es';
  const name = destino[`name_${lang}`] || destino.name;
  const details = destino[`details_${lang}`] || destino.details || destino.description || '';
  const history = destino[`history_${lang}`] || destino.history || '';
  const recommendations = destino[`recommendations_${lang}`] || destino.recommendations || [];
  $('#destinoModalLabel').textContent = name;
  const imgEl = $('#destinoModalImage');
  if (imgEl) { imgEl.src = resolveImagePath(destino.image); imgEl.alt = name; }
  $('#resumen').textContent = details;
  $('#historia').textContent = history;
  const recEl = $('#recomendaciones');
  if (recEl) recEl.innerHTML = recommendations && recommendations.length ? `<ul>${recommendations.map(r => `<li>${r}</li>`).join('')}</ul>` : '';
  const modalEl = $('#destinoModal');
  if (modalEl) new bootstrap.Modal(modalEl).show();
}

function initCultura(cultura) {
  globalCultura = cultura; // Guardar para re-renderizar al cambiar idioma
  const accordion = document.getElementById('accordionCultura');
  if (!accordion) return;
  const lang = localStorage.getItem('punoLang') || 'es';
  accordion.innerHTML = cultura
    .map((item, index) => {
      const title = item[`title_${lang}`] || item.title;
      const subtitle = item[`subtitle_${lang}`] || item.subtitle;
      const content = item[`content_${lang}`] || item.content;
      return `
      <div class="accordion-item mb-3">
        <h2 class="accordion-header" id="heading${index}">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
            ${title}
          </button>
        </h2>
        <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#accordionCultura">
          <div class="accordion-body p-4 d-flex flex-column flex-lg-row align-items-start gap-4">
            <img src="${resolveImagePath(item.image)}" alt="${title}" class="img-fluid rounded shadow-sm" style="max-width: 260px; object-fit: cover;">
            <div>
              <p class="mb-2"><strong>${subtitle}</strong></p>
              <p>${content}</p>
            </div>
          </div>
        </div>
      </div>
    `;
    })
    .join('');
}

function initGastronomia(gastronomia) {
  globalGastronomia = gastronomia; // Guardar para re-renderizar al cambiar idioma
  const cards = document.getElementById('gastronomiaCards');
  if (!cards) return;

  const lang = localStorage.getItem('punoLang') || 'es';

  cards.innerHTML = ''; // Limpiar cards previas
  gastronomia.forEach((item) => {
    const displayName = item[`name_${lang}`] || item.name;
    const displayShort = item[`short_${lang}`] || item.short;
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4';
    card.innerHTML = `
      <article class="card shadow-sm card-hover h-100 card-gastronomia">
        <img src="${resolveImagePath(item.image)}" class="card-img-top" alt="${displayName}">
        <div class="card-body d-flex flex-column">
          <h3 class="h5 card-title">${displayName}</h3>
          <p class="card-text text-muted">${displayShort}</p>
          <button type="button" class="btn btn-primary mt-auto open-recipe" data-id="${item.id}">${t('button_view_recipe')}</button>
        </div>
      </article>
    `;
    cards.append(card);
  });
}

function initItinerario(packages, destinos = []) {
  const form = document.getElementById('itinerarioForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const destinationInput = document.getElementById('destination');
  const destinosList = document.getElementById('destinosList');
  const daysInput = document.getElementById('days');
  const result = document.getElementById('itineraryResult');
  if (!form || !nameInput || !emailInput || !destinationInput || !destinosList || !daysInput || !result) return;

  // Poblar datalist de destinos
  destinos.forEach((d) => { const option = createEl('option'); option.value = d.name; destinosList.appendChild(option); });

  // Pre-filling: si venimos desde una tarjeta de destino se guarda en sessionStorage
  try {
    const sel = sessionStorage.getItem('punoSelectedDestino');
    if (sel) {
      const obj = JSON.parse(sel);
      if (obj && obj.name) {
        destinationInput.value = obj.name;
        destinationInput.classList.add('is-valid');
      }
      sessionStorage.removeItem('punoSelectedDestino');
    }
  } catch (e) { console.warn('No se pudo leer sessionStorage para prefill'); }

  // Validación dinámica: nombre no puede contener '@'
  nameInput.addEventListener('input', () => {
    if (nameInput.value.includes('@')) {
      nameInput.setCustomValidity("El nombre no puede contener '@'.");
      nameInput.classList.add('is-invalid');
      nameInput.classList.remove('is-valid');
    } else {
      nameInput.setCustomValidity('');
      if (nameInput.value.trim()) {
        nameInput.classList.remove('is-invalid');
        nameInput.classList.add('is-valid');
      } else {
        nameInput.classList.remove('is-valid');
      }
    }
  });

  // Email: validar en tiempo real que contenga '@' y cumpla pattern
  emailInput.addEventListener('input', () => {
    if (!emailInput.value.includes('@')) {
      emailInput.setCustomValidity("El correo debe incluir '@'.");
      emailInput.classList.add('is-invalid');
      emailInput.classList.remove('is-valid');
    } else {
      emailInput.setCustomValidity('');
      if (emailInput.checkValidity()) {
        emailInput.classList.remove('is-invalid');
        emailInput.classList.add('is-valid');
      }
    }
  });

  const classSelect = document.getElementById('classSelect');
  const classText = document.getElementById('classText');
  const classInvalid = document.getElementById('classInvalid');
  const peopleInput = document.getElementById('people');
  const budgetEstimate = document.getElementById('budgetEstimate');

  // Elementos de la tabla de precios
  const priceCartonEl = document.getElementById('priceCarton');
  const pricePlataEl = document.getElementById('pricePlata');
  const priceDiamanteEl = document.getElementById('priceDiamante');
  const totalCartonEl = document.getElementById('totalCarton');
  const totalPlataEl = document.getElementById('totalPlata');
  const totalDiamanteEl = document.getElementById('totalDiamante');

  // Multipliers por clase
  const tierMultipliers = {
    carton: 0.75,
    plata: 1,
    diamante: 1.6
  };

  // Mapa base de precios por destino (por día) — valores por defecto si no coincide
  function getBasePrice(destName) {
    if (!destName) return 140;
    const n = destName.toLowerCase();
    if (n.includes('titicaca')) return 220;
    if (n.includes('uros') || n.includes('uros')) return 160;
    if (n.includes('taquile')) return 180;
    if (n.includes('amant')) return 170;
    if (n.includes('sillustani')) return 130;
    if (n.includes('cutimbo')) return 120;
    if (n.includes('lampa')) return 100;
    if (n.includes('altiplano')) return 115;
    return 140;
  }

  // Actualiza valores en la tabla y totales
  function updatePriceTable() {
    const dest = destinationInput.value.trim();
    const days = Number(daysInput.value) || 1;
    const people = Number(peopleInput.value) || 1;
    const base = getBasePrice(dest);

    const pCarton = base * tierMultipliers.carton;
    const pPlata = base * tierMultipliers.plata;
    const pDiam = base * tierMultipliers.diamante;

    if (priceCartonEl) priceCartonEl.textContent = pCarton.toFixed(2);
    if (pricePlataEl) pricePlataEl.textContent = pPlata.toFixed(2);
    if (priceDiamanteEl) priceDiamanteEl.textContent = pDiam.toFixed(2);

    const tCarton = (pCarton * days * people).toFixed(2);
    const tPlata = (pPlata * days * people).toFixed(2);
    const tDiam = (pDiam * days * people).toFixed(2);

    if (totalCartonEl) totalCartonEl.textContent = `S/ ${tCarton}`;
    if (totalPlataEl) totalPlataEl.textContent = `S/ ${tPlata}`;
    if (totalDiamanteEl) totalDiamanteEl.textContent = `S/ ${tDiam}`;
    // Asegurar que el presupuesto mostrado use los datos actuales
    try { calculate(); } catch (e) { /* ignore */ }
  }

  // Helper para establecer la clase seleccionada desde botones
  function setClass(value) {
    if (!classSelect) return;
    classSelect.value = value || '';
    if (classText) classText.textContent = value || '-';
    document.querySelectorAll('.select-tier').forEach(b => b.classList.remove('active'));
    if (value === 'Económico') document.querySelector('.btn-carton')?.classList.add('active');
    if (value === 'Estándar') document.querySelector('.btn-plata')?.classList.add('active');
    if (value === 'Lujoso') document.querySelector('.btn-diamante')?.classList.add('active');
    if (classInvalid && value) classInvalid.classList.add('visually-hidden');
    calculate();
  }

  // Manejar selección desde botones de la tabla (solo botones)
  document.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.select-tier');
    if (!btn) return;
    if (btn.classList.contains('btn-carton')) setClass('Económico');
    else if (btn.classList.contains('btn-plata')) setClass('Estándar');
    else if (btn.classList.contains('btn-diamante')) setClass('Lujoso');
  });

  // Actualizar tabla cuando cambian destino/días/personas
  destinationInput.addEventListener('input', updatePriceTable);
  daysInput.addEventListener('input', updatePriceTable);
  peopleInput.addEventListener('input', updatePriceTable);
  // Inicializar tabla
  updatePriceTable();

  // Validar destino en tiempo real (debe existir en la lista de destinos)
  destinationInput.addEventListener('input', () => {
    const validNames = destinos.map((d) => d.name.toLowerCase());
    if (!destinationInput.value || !validNames.includes(destinationInput.value.trim().toLowerCase())) {
      destinationInput.setCustomValidity('Destino no válido.');
      destinationInput.classList.add('is-invalid');
      destinationInput.classList.remove('is-valid');
    } else {
      destinationInput.setCustomValidity('');
      destinationInput.classList.remove('is-invalid');
      destinationInput.classList.add('is-valid');
    }
  });

  // Validación en tiempo real para personas (la clase se valida al intentar generar)

  peopleInput.addEventListener('input', () => {
    if (Number(peopleInput.value) < 1) {
      peopleInput.classList.add('is-invalid');
      peopleInput.classList.remove('is-valid');
    } else {
      peopleInput.classList.remove('is-invalid');
      peopleInput.classList.add('is-valid');
    }
    calculate();
  });

  // Al enviar el formulario, crear resumen y agregar botón de pago
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Validar que se haya seleccionado una clase vía los botones
    if (!classSelect || !classSelect.value) {
      if (classInvalid) classInvalid.classList.remove('visually-hidden');
      form.classList.add('was-validated');
      return;
    }
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const destino = destinationInput.value.trim();
    const days = Number(daysInput.value) || 1;

    // Calcular precio real usando base derivada del destino
    const people = Number(peopleInput.value) || 1;
    const base = getBasePrice(destino);
    const classMultiplier = classSelect.value === 'Lujoso' ? 1.6 : classSelect.value === 'Económico' ? 0.75 : 1;
    const total = (base * classMultiplier) * days * people;

    // Generar itinerario personalizado día a día usando highlights del destino si existen
    const destinoObj = destinos.find(d => d.name.toLowerCase() === destino.toLowerCase());
    const highlights = destinoObj && destinoObj.highlights ? destinoObj.highlights : [];
    let itineraryHtml = `
      <div class="alert alert-success">
        <h4 class="alert-heading" data-i18n="itinerary_generated_title">${t('itinerary_generated_title')}</h4>
        <p>${t('itinerary_thanks')} <strong>${name}</strong>. ${t('label_destination')} ${destino} ${t('itinerary_ready')}</p>
        <hr>
        <p><strong data-i18n="day_label">${t('day_label')}</strong>: ${days}</p>
        <p><strong data-i18n="label_destination">${t('label_destination')}</strong>: ${destino}</p>
        <p><strong data-i18n="budget_prefix">${t('budget_prefix')}</strong> S/ ${total.toFixed(2)}</p>
        <ol class="mt-3">
    `;
    for (let i = 1; i <= days; i++) {
      if (i === 1) {
        itineraryHtml += `<li><strong>${t('day_label')} ${i}:</strong> ${t('first_day_activity')}</li>`;
      } else {
        const h = highlights.length ? highlights[(i - 2) % highlights.length] : t('other_day_activity');
        itineraryHtml += `<li><strong>${t('day_label')} ${i}:</strong> Visita a ${h} y actividades culturales.</li>`;
      }
    }
    itineraryHtml += `</ol><p class="mb-0" data-i18n="itinerary_summary_note">${t('itinerary_summary_note')}</p>
      <div class="mt-3 text-end"><button id="payBtn" class="btn btn-primary" data-i18n="button_pay">${t('button_pay')}</button></div>
      </div>`;
    result.innerHTML = itineraryHtml;

    // limpiar form y estados
    form.reset();
    // limpiar clase seleccionada visualmente
    if (typeof setClass === 'function') setClass('');
    form.classList.remove('was-validated');

    const payBtn = document.getElementById('payBtn');
    if (payBtn) {
      payBtn.addEventListener('click', () => {
        const modalEl = document.getElementById('paymentModal');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      });
    }
  });

  // calcular presupuesto en vivo
  function calculate() {
    const days = Number(daysInput.value) || 1;
    const people = Number(peopleInput.value) || 1;
    // Usar precio base real según destino
    const base = getBasePrice(destinationInput.value.trim());
    const classMultiplier = classSelect && classSelect.value === 'Lujoso' ? 1.6 : classSelect && classSelect.value === 'Económico' ? 0.75 : 1;
    // total real: base por día * multiplicador de clase * días * personas
    const total = (base * classMultiplier) * days * people;
    if (budgetEstimate) budgetEstimate.textContent = `${t('budget_prefix')}S/ ${total.toFixed(2)}`;
  }

  daysInput.addEventListener('input', calculate);
  if (peopleInput) peopleInput.addEventListener('input', calculate);
  calculate();

  // Manejar pago: validaciones simples del modal
  const paymentForm = document.getElementById('paymentForm');
  if (paymentForm) {
    paymentForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      // validación básica
      const cardName = document.getElementById('cardName');
      const cardNumber = document.getElementById('cardNumber');
      const exp = document.getElementById('exp');
      const cvv = document.getElementById('cvv');

      let valid = true;

      // número tarjeta: solo dígitos, 16
      const digits = (cardNumber.value || '').replace(/\s+/g, '');
      if (!/^\d{16}$/.test(digits)) {
        cardNumber.classList.add('is-invalid');
        valid = false;
      } else {
        cardNumber.classList.remove('is-invalid');
      }

      // expiración MM/AA
      if (!/^\d{2}\/\d{2}$/.test(exp.value)) {
        exp.classList.add('is-invalid');
        valid = false;
      } else {
        exp.classList.remove('is-invalid');
      }

      if (!/^\d{3,4}$/.test(cvv.value)) {
        cvv.classList.add('is-invalid');
        valid = false;
      } else {
        cvv.classList.remove('is-invalid');
      }

      if (!cardName.value.trim()) {
        cardName.classList.add('is-invalid');
        valid = false;
      } else {
        cardName.classList.remove('is-invalid');
      }

      if (!valid) return;

      // Simular procesamiento: cerrar modal y mostrar confirmación
      const modalEl = document.getElementById('paymentModal');
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();

      result.innerHTML = `
        <div class="alert alert-success text-center">
          <h3>¡LISTO!</h3>
          <p>Hemos enviado la confirmación al correo. Por favor revisa tu bandeja de entrada.</p>
          <div class="mt-3">
            <a href="${basePath}index.html" class="btn btn-primary me-2">Volver al inicio</a>
          </div>
        </div>
      `;
    });

    // Validación en tiempo real para tarjeta y CVV
    const cardNumber = document.getElementById('cardNumber');
    const cvv = document.getElementById('cvv');
    const exp = document.getElementById('exp');
    const cardName = document.getElementById('cardName');

    if (cardNumber) {
      // Formateo en vivo para facilitar la entrada: usa la función utilitaria
      cardNumber.addEventListener('input', () => {
        cardNumber.value = formatCardNumber(cardNumber.value);
        const digits = (cardNumber.value || '').replace(/\D/g, '');
        if (!/^\d{0,16}$/.test(digits)) cardNumber.classList.add('is-invalid'); else cardNumber.classList.remove('is-invalid');
      });
    }

    if (cvv) {
      cvv.addEventListener('input', () => {
        if (!/^\d{0,4}$/.test(cvv.value)) {
          cvv.classList.add('is-invalid');
        } else {
          cvv.classList.remove('is-invalid');
        }
      });
    }

    if (exp) {
      // Formateo simple MM/AA usando la utilitaria
      exp.addEventListener('input', () => {
        exp.value = formatExp(exp.value);
        if (!/^\d{0,2}\/?\d{0,2}$/.test(exp.value)) exp.classList.add('is-invalid'); else exp.classList.remove('is-invalid');
      });
    }

    if (cardName) {
      cardName.addEventListener('input', () => {
        if (!cardName.value.trim()) cardName.classList.add('is-invalid'); else cardName.classList.remove('is-invalid');
      });
    }
  }
}

async function main() {
  const data = await fetchData();
  if (!data) return;
  if (page === 'destinos') {
    initDestinos(data.destinos);
  } else if (page === 'cultura') {
    initCultura(data.cultura);
  } else if (page === 'gastronomia') {
    initGastronomia(data.gastronomia);
    // Agregar listener de delegación para modal de recetas (solo una vez)
    setupGastronomiaModal(data.gastronomia);
  } else if (page === 'itinerario') {
    initItinerario(data.packages, data.destinos);
  }
}

// Listener de delegación para el modal de gastronomía (se configura una sola vez)
function setupGastronomiaModal(gastronomia) {
  const cards = document.getElementById('gastronomiaCards');
  if (!cards) return;
  
  // Agregar listener de delegación al contenedor (persiste aunque las cards se regeneren)
  cards.addEventListener('click', handleRecipeClick);
}

function handleRecipeClick(event) {
  const button = event.target.closest('.open-recipe');
  if (!button) return;
  
  const dishId = button.dataset.id;
  const dish = globalGastronomia && globalGastronomia.find((item) => item.id === dishId);
  if (!dish) return;
  
  const lang = localStorage.getItem('punoLang') || 'es';
  const dishName = dish[`name_${lang}`] || dish.name;
  const dishRecipe = dish[`recipe_${lang}`] || dish.recipe;
  const ingredients = dish[`ingredients_${lang}`] || dish.ingredients;
  
  const modalTitle = document.getElementById('recipeModalLabel');
  const modalBody = document.getElementById('recipeModalBody');
  const modalIngredients = document.getElementById('recipeModalIngredients');
  const modalImage = document.getElementById('recipeModalImage');
  
  if (modalTitle) modalTitle.textContent = dishName;
  if (modalImage) {
    modalImage.src = resolveImagePath(dish.image);
    modalImage.alt = dishName;
  }
  if (modalBody) modalBody.textContent = dishRecipe;
  if (modalIngredients) modalIngredients.innerHTML = ingredients.map((ingredient) => `<li>${ingredient}</li>`).join('');
  
  const modalEl = document.getElementById('recipeModal');
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}

window.addEventListener('DOMContentLoaded', main);

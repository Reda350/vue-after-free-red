// Language translations
// Detected locale: jsmaf.locale

export const lang: Record<string, string> = {
  jailbreak: 'Jailbreak',
  payloadMenu: 'Payload Menu',
  config: 'Config',
  exit: 'Exit',
  autoLapse: 'Auto Lapse',
  autoPoop: 'Auto Poop',
  autoClose: 'Auto Close',
  music: 'Music',
  jbBehavior: 'JB Behavior',
  jbBehaviorAuto: 'Auto Detect',
  jbBehaviorNetctrl: 'NetControl',
  jbBehaviorLapse: 'Lapse',
  theme: 'Theme',
  language: 'Language', // المفتاح الجديد
  xToGoBack: 'X to go back',
  oToGoBack: 'O to go back'
}

export let useImageText = false
export let textImageBase = ''

// --- التعديل الجوهري: جعل اختيار اللغة يتبع ملف الإعدادات أولاً ---
let detectedLocale = jsmaf.locale || 'en'

try {
  const xhr = new jsmaf.XMLHttpRequest()
  // نستخدم false ليكون الطلب متزامناً (Sync) لضمان تحميل اللغة قبل عرض الواجهة
  xhr.open('GET', 'file:///../download0/config.json', false)
  xhr.send()
  if (xhr.status === 200 || xhr.status === 0) {
    const configData = JSON.parse(xhr.responseText)
    if (configData.config && configData.config.language) {
      detectedLocale = configData.config.language
    }
  }
} catch (e) {
  log('Config not found or error, falling back to system locale.')
}

log('Current active locale: ' + detectedLocale)

const IMAGE_TEXT_LOCALES = ['ar', 'ja', 'ko', 'zh']
if (IMAGE_TEXT_LOCALES.includes(detectedLocale)) {
  useImageText = true
  textImageBase = 'file:///../download0/img/text/' + detectedLocale + '/'
}

switch (detectedLocale) {
  case 'es':
  case 'es-ES':
  case 'es-CL':
  case 'es-419':
  case 'es-MX':
  case 'es-AR':
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Menu de Payloads'
    lang.config = 'Configuracion'
    lang.exit = 'Salir'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Auto Cerrar'
    lang.music = 'Musica'
    lang.jbBehavior = 'Comportamiento JB'
    lang.jbBehaviorAuto = 'Auto Detectar'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Tema'
    lang.language = 'Idioma'
    lang.xToGoBack = 'X para volver'
    lang.oToGoBack = 'O para volver'
    break

  case 'pt':
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Menu de Payloads'
    lang.config = 'Configuracao'
    lang.exit = 'Sair'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Fechar Auto'
    lang.music = 'Musica'
    lang.jbBehavior = 'Comportamento JB'
    lang.jbBehaviorAuto = 'Auto Detectar'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Tema'
    lang.language = 'Idioma'
    lang.xToGoBack = 'X para voltar'
    lang.oToGoBack = 'O para voltar'
    break

  case 'fr':
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Menu Payload'
    lang.config = 'Configuration'
    lang.exit = 'Quitter'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Fermer Auto'
    lang.music = 'Musique'
    lang.jbBehavior = 'Comportement JB'
    lang.jbBehaviorAuto = 'Auto Detecter'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Thème'
    lang.language = 'Langue'
    lang.xToGoBack = 'X pour retourner'
    lang.oToGoBack = 'O pour retourner'
    break

  case 'de':
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Payload Menu'
    lang.config = 'Einstellungen'
    lang.exit = 'Beenden'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Auto Schliessen'
    lang.music = 'Musik'
    lang.jbBehavior = 'JB Verhalten'
    lang.jbBehaviorAuto = 'Auto Erkennen'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Thema'
    lang.language = 'Sprache'
    lang.xToGoBack = 'X für Zurueck'
    lang.oToGoBack = 'O für Zurueck'
    break

  case 'it':
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Menu Payload'
    lang.config = 'Configurazione'
    lang.exit = 'Esci'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Chiudi Auto'
    lang.music = 'Musica'
    lang.jbBehavior = 'Comportamento JB'
    lang.jbBehaviorAuto = 'Auto Rileva'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Tema'
    lang.language = 'Lingua'
    lang.xToGoBack = 'X per tornare indietro'
    lang.oToGoBack = 'O per tornare indietro'
    break

  case 'nl':
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Payload Menu'
    lang.config = 'Instellingen'
    lang.exit = 'Afsluiten'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Auto Sluiten'
    lang.music = 'Muziek'
    lang.jbBehavior = 'JB Gedrag'
    lang.jbBehaviorAuto = 'Auto Detectie'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Thema'
    lang.language = 'Taal'
    lang.xToGoBack = 'X om terug te gaan'
    lang.oToGoBack = 'O om terug te gaan'
    break

  case 'pl':
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Menu Payload'
    lang.config = 'Konfiguracja'
    lang.exit = 'Wyjscie'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Auto Zamknij'
    lang.music = 'Muzyka'
    lang.jbBehavior = 'Zachowanie JB'
    lang.jbBehaviorAuto = 'Auto Wykryj'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Motyw'
    lang.language = 'Język'
    lang.xToGoBack = 'X aby wrocic'
    lang.oToGoBack = 'O aby wrocic'
    break

  case 'tr':
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Payload Menusu'
    lang.config = 'Ayarlar'
    lang.exit = 'Cikis'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Otomatik Kapat'
    lang.music = 'Muzik'
    lang.jbBehavior = 'JB Davranisi'
    lang.jbBehaviorAuto = 'Otomatik Algilama'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Tema'
    lang.language = 'Dil'
    lang.xToGoBack = 'Geri gitmek icin X'
    lang.oToGoBack = 'Geri gitmek icin O'
    break

  case 'ar':
    lang.jailbreak = 'كسر الحماية'
    lang.payloadMenu = 'قائمة الحمولة'
    lang.config = 'الاعدادات'
    lang.exit = 'خروج'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'اغلاق تلقائي'
    lang.music = 'موسيقى'
    lang.jbBehavior = 'نوع التهكير'
    lang.jbBehaviorAuto = 'كشف تلقائي'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'سمة'
    lang.language = 'اللغة'
    lang.xToGoBack = 'X للرجوع'
    lang.oToGoBack = 'O للرجوع'
    break

  case 'ja':
    lang.jailbreak = '脱獄'
    lang.payloadMenu = 'ペイロードメニュー'
    lang.config = '設定'
    lang.exit = '終了'
    lang.autoLapse = '自動Lapse'
    lang.autoPoop = '自動Poop'
    lang.autoClose = '自動終了'
    lang.music = '音楽'
    lang.jbBehavior = 'JB動作'
    lang.jbBehaviorAuto = '自動検出'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'テーマ'
    lang.language = '言語'
    lang.xToGoBack = 'Xで戻る'
    lang.oToGoBack = 'Oで戻る'
    break

  case 'ko':
    lang.jailbreak = '탈옥'
    lang.payloadMenu = '페이로드 메뉴'
    lang.config = '설정'
    lang.exit = '종료'
    lang.autoLapse = '자동 Lapse'
    lang.autoPoop = '자동 Poop'
    lang.autoClose = '자동 닫기'
    lang.music = '음악'
    lang.jbBehavior = 'JB 동작'
    lang.jbBehaviorAuto = '자동 감지'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = '테마'
    lang.language = '언어'
    lang.xToGoBack = 'X로 뒤로 가기'
    lang.oToGoBack = 'O로 뒤로 가기'
    break

  case 'zh':
    lang.jailbreak = '越狱'
    lang.payloadMenu = '载荷菜单'
    lang.config = '设置'
    lang.exit = '退出'
    lang.autoLapse = '自动Lapse'
    lang.autoPoop = '自动Poop'
    lang.autoClose = '自动关闭'
    lang.music = '音乐'
    lang.jbBehavior = 'JB行为'
    lang.jbBehaviorAuto = '自动检测'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = '主题'
    lang.language = '语言'
    lang.xToGoBack = '按 X 返回'
    lang.oToGoBack = '按 O 返回'
    break

  default:
    // English (already set at the top)
    break
}

log('Language logic fully applied: ' + detectedLocale)
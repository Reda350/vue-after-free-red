// Language translations
// Logic: Priority to config.json, fallback to jsmaf.locale

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
  language: 'Language',
  xToGoBack: 'X to go back',
  oToGoBack: 'O to go back'
}

export let useImageText = false
export let textImageBase = ''

// قراءة اللغة من الإعدادات لكسر لغة الجهاز
let detectedLocale = jsmaf.locale || 'en'

try {
  const xhr = new jsmaf.XMLHttpRequest()
  xhr.open('GET', 'file:///../download0/config.json', false)
  xhr.send()
  if (xhr.status === 200 || xhr.status === 0) {
    const configData = JSON.parse(xhr.responseText)
    if (configData.config && configData.config.language) {
      detectedLocale = configData.config.language
    }
  }
} catch (e) {
  log('Config not found, using system locale.')
}

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
    // Spanish
    lang.payloadMenu = 'Menu de Payloads'; lang.config = 'Configuracion'; lang.exit = 'Salir'
    lang.autoClose = 'Auto Cerrar'; lang.music = 'Musica'; lang.jbBehavior = 'Comportamiento JB'
    lang.theme = 'Tema'; lang.language = 'Idioma'; lang.xToGoBack = 'X para volver'
    break

  case 'pt':
    // Portuguese
    lang.payloadMenu = 'Menu de Payloads'; lang.config = 'Configuracao'; lang.exit = 'Sair'
    lang.autoClose = 'Fechar Auto'; lang.music = 'Musica'; lang.jbBehavior = 'Comportamento JB'
    lang.theme = 'Tema'; lang.language = 'Idioma'; lang.xToGoBack = 'X para voltar'
    break

  case 'fr':
    // French
    lang.payloadMenu = 'Menu Payload'; lang.config = 'Configuration'; lang.exit = 'Quitter'
    lang.autoClose = 'Fermer Auto'; lang.music = 'Musique'; lang.jbBehavior = 'Comportement JB'
    lang.theme = 'Thème'; lang.language = 'Langue'; lang.xToGoBack = 'X pour retourner'
    break

  case 'de':
    // German
    lang.payloadMenu = 'Payload Menu'; lang.config = 'Einstellungen'; lang.exit = 'Beenden'
    lang.autoClose = 'Auto Schliessen'; lang.music = 'Musik'; lang.jbBehavior = 'JB Verhalten'
    lang.theme = 'Thema'; lang.language = 'Sprache'; lang.xToGoBack = 'X für Zurueck'
    break

  case 'it':
    // Italian
    lang.payloadMenu = 'Menu Payload'; lang.config = 'Configurazione'; lang.exit = 'Esci'
    lang.autoClose = 'Chiudi Auto'; lang.music = 'Musica'; lang.jbBehavior = 'Comportamento JB'
    lang.theme = 'Tema'; lang.language = 'Lingua'; lang.xToGoBack = 'X per tornare indietro'
    break

  case 'nl':
    // Dutch
    lang.payloadMenu = 'Payload Menu'; lang.config = 'Instellingen'; lang.exit = 'Afsluiten'
    lang.autoClose = 'Auto Sluiten'; lang.music = 'Muziek'; lang.jbBehavior = 'JB Gedrag'
    lang.theme = 'Thema'; lang.language = 'Taal'; lang.xToGoBack = 'X om terug te gaan'
    break

  case 'pl':
    // Polish
    lang.payloadMenu = 'Menu Payload'; lang.config = 'Konfiguracja'; lang.exit = 'Wyjscie'
    lang.autoClose = 'Auto Zamknij'; lang.music = 'Muzyka'; lang.jbBehavior = 'Zachowanie JB'
    lang.theme = 'Motyw'; lang.language = 'Język'; lang.xToGoBack = 'X aby wrocic'
    break

  case 'tr':
    // Turkish
    lang.payloadMenu = 'Payload Menusu'; lang.config = 'Ayarlar'; lang.exit = 'Cikis'
    lang.autoClose = 'Otomatik Kapat'; lang.music = 'Muzik'; lang.jbBehavior = 'JB Davranisi'
    lang.theme = 'Tema'; lang.language = 'Dil'; lang.xToGoBack = 'Geri gitmek icin X'
    break

  case 'ar':
    // Arabic
    lang.jailbreak = 'كسر الحماية'; lang.payloadMenu = 'قائمة الحمولة'; lang.config = 'الاعدادات'
    lang.exit = 'خروج'; lang.autoClose = 'اغلاق تلقائي'; lang.music = 'موسيقى'
    lang.jbBehavior = 'نوع التهكير'; lang.theme = 'سمة'; lang.language = 'اللغة'
    lang.xToGoBack = 'X للرجوع'; lang.oToGoBack = 'O للرجوع'
    break

  case 'ja':
    // Japanese
    lang.jailbreak = '脱獄'; lang.payloadMenu = 'ペイロードメニュー'; lang.config = '設定'
    lang.exit = '終了'; lang.autoClose = '自動終了'; lang.music = '音楽'
    lang.theme = 'テーマ'; lang.language = '言語'; lang.xToGoBack = 'Xで戻る'
    break

  case 'ko':
    // Korean
    lang.jailbreak = '탈옥'; lang.payloadMenu = '페이로드 메뉴'; lang.config = '설정'
    lang.exit = '종료'; lang.autoClose = '자동 닫기'; lang.music = '음악'
    lang.theme = '테마'; lang.language = '언어'; lang.xToGoBack = 'X로 뒤로 가기'
    break

  case 'zh':
    // Chinese
    lang.jailbreak = '越狱'; lang.payloadMenu = '载荷菜单'; lang.config = '设置'
    lang.exit = '退出'; lang.autoClose = '自动关闭'; lang.music = '音乐'
    lang.theme = '主题'; lang.language = '语言'; lang.xToGoBack = '按 X 返回'
    break

  default:
    break
}

log('All languages loaded. Active: ' + detectedLocale)
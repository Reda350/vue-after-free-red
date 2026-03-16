import { libc_addr } from 'download0/userland'
import { lang, useImageText, textImageBase } from 'download0/languages'
import { fn, mem, BigInt } from 'download0/types'

if (typeof libc_addr === 'undefined') {
  include('userland.js')
}

if (typeof lang === 'undefined') {
  include('languages.js')
}

(function () {
  log('Loading config UI...')

  const fs = {
    write: function (filename: string, content: string, callback: (error: Error | null) => void) {
      const xhr = new jsmaf.XMLHttpRequest()
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && callback) {
          callback(xhr.status === 0 || xhr.status === 200 ? null : new Error('failed'))
        }
      }
      xhr.open('POST', 'file://../download0/' + filename, true)
      xhr.send(content)
    },

    read: function (filename: string, callback: (error: Error | null, data?: string) => void) {
      const xhr = new jsmaf.XMLHttpRequest()
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && callback) {
          callback(xhr.status === 0 || xhr.status === 200 ? null : new Error('failed'), xhr.responseText)
        }
      }
      xhr.open('GET', 'file://../download0/' + filename, true)
      xhr.send()
    }
  }

  const currentConfig: {
    autolapse: boolean
    autopoop: boolean
    autoclose: boolean
    autoclose_delay: number
    music: boolean
    jb_behavior: number
    theme: string
    language: string // الإضافة هنا
  } = {
    autolapse: false,
    autopoop: false,
    autoclose: false,
    autoclose_delay: 0,
    music: true,
    jb_behavior: 0,
    theme: 'default',
    language: 'en' // الإضافة هنا
  }

  // Store user's payloads so we don't overwrite them
  let userPayloads: string[] = []
  let configLoaded = false

  const jbBehaviorLabels = [lang.jbBehaviorAuto, lang.jbBehaviorNetctrl, lang.jbBehaviorLapse]
  const jbBehaviorImgKeys = ['jbBehaviorAuto', 'jbBehaviorNetctrl', 'jbBehaviorLapse']

  function scanThemes (): string[] {
    const themes: string[] = []
    try {
      fn.register(0x05, 'open_sys', ['bigint', 'bigint', 'bigint'], 'bigint')
      fn.register(0x06, 'close_sys', ['bigint'], 'bigint')
      fn.register(0x110, 'getdents', ['bigint', 'bigint', 'bigint'], 'bigint')

      const themesDir = '/download0/themes'
      const path_addr = mem.malloc(256)
      const buf = mem.malloc(4096)

      for (let i = 0; i < themesDir.length; i++) {
        mem.view(path_addr).setUint8(i, themesDir.charCodeAt(i))
      }
      mem.view(path_addr).setUint8(themesDir.length, 0)

      const fd = fn.open_sys(path_addr, new BigInt(0, 0), new BigInt(0, 0))
      if (!fd.eq(new BigInt(0xffffffff, 0xffffffff))) {
        const count = fn.getdents(fd, buf, new BigInt(0, 4096))
        if (!count.eq(new BigInt(0xffffffff, 0xffffffff)) && count.lo > 0) {
          let offset = 0
          while (offset < count.lo) {
            const d_reclen = mem.view(buf.add(new BigInt(0, offset + 4))).getUint16(0, true)
            const d_type = mem.view(buf.add(new BigInt(0, offset + 6))).getUint8(0)
            const d_namlen = mem.view(buf.add(new BigInt(0, offset + 7))).getUint8(0)
            let name = ''
            for (let i = 0; i < d_namlen; i++) {
              name += String.fromCharCode(mem.view(buf.add(new BigInt(0, offset + 8 + i))).getUint8(0))
            }
            if (d_type === 4 && name !== '.' && name !== '..') {
              themes.push(name)
            }
            offset += d_reclen
          }
        }
        fn.close_sys(fd)
      }
    } catch (e) {
      log('Theme scan failed: ' + (e as Error).message)
    }

    const idx = themes.indexOf('default')
    if (idx > 0) {
      themes.splice(idx, 1)
      themes.unshift('default')
    } else if (idx < 0) {
      themes.unshift('default')
    }

    return themes
  }

  const availableThemes = scanThemes()
  const themeLabels: string[] = availableThemes.map((theme: string) => theme.charAt(0).toUpperCase() + theme.slice(1))

  let currentButton = 0
  const buttons: Image[] = []
  const buttonTexts: (Image | jsmaf.Text)[] = []
  const buttonMarkers: (Image | null)[] = []
  const buttonOrigPos: { x: number; y: number }[] = []
  const textOrigPos: { x: number; y: number }[] = []
  const valueTexts: (Image | jsmaf.Text)[] = []

  const normalButtonImg = 'file:///assets/img/button_over_9.png'
  const selectedButtonImg = 'file:///assets/img/button_over_9.png'

  jsmaf.root.children.length = 0

  new Style({ name: 'white', color: 'white', size: 24 })
  new Style({ name: 'title', color: 'white', size: 32 })

  const background = new Image({
    url: 'file:///../download0/img/multiview_bg_VAF.png',
    x: 0,
    y: 0,
    width: 1920,
    height: 1080
  })
  jsmaf.root.children.push(background)

  const logo = new Image({
    url: 'file:///../download0/img/logo.png',
    x: 1620,
    y: 0,
    width: 300,
    height: 169
  })
  jsmaf.root.children.push(logo)

  if (useImageText) {
    const title = new Image({
      url: textImageBase + 'config.png',
      x: 860,
      y: 100,
      width: 200,
      height: 60
    })
    jsmaf.root.children.push(title)
  } else {
    const title = new jsmaf.Text()
    title.text = lang.config
    title.x = 910
    title.y = 120
    title.style = 'title'
    jsmaf.root.children.push(title)
  }

  // المصفوفة بعد إضافة خيار اللغة
  const configOptions = [
    { key: 'autolapse', label: lang.autoLapse, imgKey: 'autoLapse', type: 'toggle' },
    { key: 'autopoop', label: lang.autoPoop, imgKey: 'autoPoop', type: 'toggle' },
    { key: 'autoclose', label: lang.autoClose, imgKey: 'autoClose', type: 'toggle' },
    { key: 'music', label: lang.music, imgKey: 'music', type: 'toggle' },
    { key: 'jb_behavior', label: lang.jbBehavior, imgKey: 'jbBehavior', type: 'cycle' },
    { key: 'theme', label: lang.theme || 'Theme', imgKey: 'theme', type: 'cycle' },
    { key: 'language', label: 'Language', imgKey: 'language', type: 'cycle' } // الإضافة هنا
  ]

  const centerX = 960
  const startY = 180 // تم تقليل الارتفاع قليلاً لاستيعاب الزر الإضافي
  const buttonSpacing = 100 // تم تقليل التباعد قليلاً ليظهر الكل في الشاشة
  const buttonWidth = 400
  const buttonHeight = 70

  for (let i = 0; i < configOptions.length; i++) {
    const configOption = configOptions[i]!
    const btnX = centerX - buttonWidth / 2
    const btnY = startY + i * buttonSpacing

    const button = new Image({
      url: normalButtonImg,
      x: btnX,
      y: btnY,
      width: buttonWidth,
      height: buttonHeight
    })
    buttons.push(button)
    jsmaf.root.children.push(button)

    buttonMarkers.push(null)

    let btnText: Image | jsmaf.Text
    if (useImageText) {
      btnText = new Image({
        url: textImageBase + configOption.imgKey + '.png',
        x: btnX + 20,
        y: btnY + 10,
        width: 180,
        height: 50
      })
    } else {
      btnText = new jsmaf.Text()
      btnText.text = configOption.label
      btnText.x = btnX + 30
      btnText.y = btnY + 25
      btnText.style = 'white'
    }
    buttonTexts.push(btnText)
    jsmaf.root.children.push(btnText)

    if (configOption.type === 'toggle') {
      const checkmark = new Image({
        url: currentConfig[configOption.key as keyof typeof currentConfig] ? 'file:///assets/img/check_small_on.png' : 'file:///assets/img/check_small_off.png',
        x: btnX + 320,
        y: btnY + 15,
        width: 40,
        height: 40
      })
      valueTexts.push(checkmark)
      jsmaf.root.children.push(checkmark)
    } else {
      let valueLabel: Image | jsmaf.Text
      if (configOption.key === 'jb_behavior') {
        if (useImageText) {
          valueLabel = new Image({
            url: textImageBase + jbBehaviorImgKeys[currentConfig.jb_behavior] + '.png',
            x: btnX + 230,
            y: btnY + 10,
            width: 150,
            height: 50
          })
        } else {
          valueLabel = new jsmaf.Text()
          valueLabel.text = jbBehaviorLabels[currentConfig.jb_behavior] || jbBehaviorLabels[0]!
          valueLabel.x = btnX + 250
          valueLabel.y = btnY + 25
          valueLabel.style = 'white'
        }
      } else if (configOption.key === 'theme') {
        const themeIndex = availableThemes.indexOf(currentConfig.theme)
        const displayIndex = themeIndex >= 0 ? themeIndex : 0
        valueLabel = new jsmaf.Text()
        valueLabel.text = themeLabels[displayIndex] || themeLabels[0]!
        valueLabel.x = btnX + 250
        valueLabel.y = btnY + 25
        valueLabel.style = 'white'
      } else if (configOption.key === 'language') { // منطق عرض اللغة
        valueLabel = new jsmaf.Text()
        valueLabel.text = currentConfig.language.toUpperCase()
        valueLabel.x = btnX + 250
        valueLabel.y = btnY + 25
        valueLabel.style = 'white'
      }
      valueTexts.push(valueLabel!)
      jsmaf.root.children.push(valueLabel!)
    }

    buttonOrigPos.push({ x: btnX, y: btnY })
    textOrigPos.push({ x: btnText.x, y: btnText.y })
  }

  // ... (تكملة دوال Animation Zoom In/Out كما هي تماماً في كودك الأصلي)
  let zoomInInterval: number | null = null
  let zoomOutInterval: number | null = null
  let prevButton = -1

  function easeInOut (t: number) { return (1 - Math.cos(t * Math.PI)) / 2 }

  function animateZoomIn (btn: Image, text: any, btnOrigX: number, btnOrigY: number, textOrigX: number, textOrigY: number) {
    if (zoomInInterval) jsmaf.clearInterval(zoomInInterval)
    const btnW = buttonWidth, btnH = buttonHeight, duration = 175, step = 16
    let elapsed = 0
    zoomInInterval = jsmaf.setInterval(function () {
      elapsed += step
      const t = Math.min(elapsed / duration, 1), eased = easeInOut(t), scale = 1.0 + (0.1 * eased)
      btn.scaleX = scale; btn.scaleY = scale
      btn.x = btnOrigX - (btnW * (scale - 1)) / 2; btn.y = btnOrigY - (btnH * (scale - 1)) / 2
      text.scaleX = scale; text.scaleY = scale
      text.x = textOrigX - (btnW * (scale - 1)) / 2; text.y = textOrigY - (btnH * (scale - 1)) / 2
      if (t >= 1) { jsmaf.clearInterval(zoomInInterval ?? -1); zoomInInterval = null }
    }, step)
  }

  function animateZoomOut (btn: Image, text: any, btnOrigX: number, btnOrigY: number, textOrigX: number, textOrigY: number) {
    if (zoomOutInterval) jsmaf.clearInterval(zoomOutInterval)
    const btnW = buttonWidth, btnH = buttonHeight, duration = 175, step = 16
    let elapsed = 0
    zoomOutInterval = jsmaf.setInterval(function () {
      elapsed += step
      const t = Math.min(elapsed / duration, 1), eased = easeInOut(t), scale = 1.1 - (0.1 * eased)
      btn.scaleX = scale; btn.scaleY = scale
      btn.x = btnOrigX - (btnW * (scale - 1)) / 2; btn.y = btnOrigY - (btnH * (scale - 1)) / 2
      text.scaleX = scale; text.scaleY = scale
      text.x = textOrigX - (btnW * (scale - 1)) / 2; text.y = textOrigY - (btnH * (scale - 1)) / 2
      if (t >= 1) { jsmaf.clearInterval(zoomOutInterval ?? -1); zoomOutInterval = null }
    }, step)
  }

  function updateHighlight () {
    const prevButtonObj = buttons[prevButton]
    if (prevButton >= 0 && prevButton !== currentButton && prevButtonObj) {
      prevButtonObj.url = normalButtonImg; prevButtonObj.alpha = 0.7
      animateZoomOut(prevButtonObj, buttonTexts[prevButton]!, buttonOrigPos[prevButton]!.x, buttonOrigPos[prevButton]!.y, textOrigPos[prevButton]!.x, textOrigPos[prevButton]!.y)
    }
    for (let i = 0; i < buttons.length; i++) {
      if (i === currentButton) {
        buttons[i]!.url = selectedButtonImg; buttons[i]!.alpha = 1.0; buttons[i]!.borderWidth = 3
        animateZoomIn(buttons[i]!, buttonTexts[i]!, buttonOrigPos[i]!.x, buttonOrigPos[i]!.y, textOrigPos[i]!.x, textOrigPos[i]!.y)
      } else if (i !== prevButton) {
        buttons[i]!.url = normalButtonImg; buttons[i]!.alpha = 0.7; buttons[i]!.borderWidth = 0
      }
    }
    prevButton = currentButton
  }

  function updateValueText (index: number) {
    const options = configOptions[index]
    const valueText = valueTexts[index]
    if (!options || !valueText) return
    const key = options.key
    if (options.type === 'toggle') {
      (valueText as Image).url = currentConfig[key as keyof typeof currentConfig] ? 'file:///assets/img/check_small_on.png' : 'file:///assets/img/check_small_off.png'
    } else {
      if (key === 'jb_behavior') {
        if (useImageText) (valueText as Image).url = textImageBase + jbBehaviorImgKeys[currentConfig.jb_behavior] + '.png'
        else (valueText as jsmaf.Text).text = jbBehaviorLabels[currentConfig.jb_behavior] || jbBehaviorLabels[0]!
      } else if (key === 'theme') {
        (valueText as jsmaf.Text).text = currentConfig.theme
      } else if (key === 'language') {
        (valueText as jsmaf.Text).text = currentConfig.language.toUpperCase()
      }
    }
  }

  function saveConfig () {
    if (!configLoaded) return
    const configData = { config: currentConfig, payloads: userPayloads }
    fs.write('config.json', JSON.stringify(configData, null, 2), function (err) {
      if (!err) log('Config saved')
    })
  }

  function handleButtonPress () {
    if (currentButton < configOptions.length) {
      const option = configOptions[currentButton]!
      const key = option.key
      if (option.type === 'cycle') {
        if (key === 'jb_behavior') currentConfig.jb_behavior = (currentConfig.jb_behavior + 1) % jbBehaviorLabels.length
        else if (key === 'theme') {
          const idx = availableThemes.indexOf(currentConfig.theme)
          currentConfig.theme = availableThemes[(idx + 1) % availableThemes.length]!
        } else if (key === 'language') { // منطق التبديل
          currentConfig.language = currentConfig.language === 'en' ? 'ar' : 'en'
        }
      } else {
        const boolKey = key as 'autolapse' | 'autopoop' | 'autoclose' | 'music'
        currentConfig[boolKey] = !currentConfig[boolKey]
      }
      updateValueText(currentButton)
      saveConfig()
    }
  }

  // Load Config
  fs.read('config.json', function (err, data) {
    if (!err && data) {
      try {
        const configData = JSON.parse(data)
        if (configData.config) {
          for (let k in configData.config) { (currentConfig as any)[k] = configData.config[k] }
          userPayloads = configData.payloads || []
        }
      } catch (e) {}
    }
    configLoaded = true
    for (let i = 0; i < configOptions.length; i++) updateValueText(i)
    updateHighlight()
  })

  jsmaf.onKeyDown = function (code) {
    if (code === 6 || code === 5) currentButton = (currentButton + 1) % buttons.length
    else if (code === 4 || code === 7) currentButton = (currentButton - 1 + buttons.length) % buttons.length
    else if (code === (jsmaf.circleIsAdvanceButton ? 13 : 14)) handleButtonPress()
    else if (code === (jsmaf.circleIsAdvanceButton ? 14 : 13)) {
       // --- التعديل هنا لضمان تفعيل اللغة ---
       saveConfig();
       log('Restarting to apply changes...');
       jsmaf.setTimeout(function () { 
         // هذا الأمر سيقوم بإعادة تشغيل الواجهة بالكامل 
         // مما يجبر ملف languages.js على قراءة الإعدادات الجديدة
         debugging.restart(); 
       }, 200);
    }
    updateHighlight()
  }
})()
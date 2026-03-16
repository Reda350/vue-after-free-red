import { lang, useImageText, textImageBase } from 'download0/languages'
import { libc_addr } from 'download0/userland'
import { fn, BigInt } from 'download0/types'

(function () {
  // 1. التأكد من تحميل نظام اللغات أولاً لضمان قراءة الإعدادات
  if (typeof lang === 'undefined') {
    include('languages.js')
  }
  
  log('Loading main menu with locale awareness...')

  let currentButton = 0
  const buttons: Image[] = []
  const buttonTexts: (Image | jsmaf.Text)[] = [] 
  const buttonMarkers: Image[] = []
  const buttonOrigPos: { x: number, y: number }[] = []
  const textOrigPos: { x: number, y: number }[] = []

  const normalButtonImg = 'file:///assets/img/button_over_9.png'
  const selectedButtonImg = 'file:///assets/img/button_over_9.png'

  jsmaf.root.children.length = 0

  new Style({ name: 'white', color: 'white', size: 24 })
  new Style({ name: 'title', color: 'white', size: 32 })

  if (typeof startBgmIfEnabled === 'function') {
    startBgmIfEnabled()
  }

  // الخلفية واللوجو
  const background = new Image({
    url: 'file:///../download0/img/multiview_bg_VAF.png',
    x: 0, y: 0, width: 1920, height: 1080
  })
  jsmaf.root.children.push(background)

  const centerX = 960
  const logoWidth = 600
  const logoHeight = 338

  const logo = new Image({
    url: 'file:///../download0/img/logo.png',
    x: centerX - logoWidth / 2,
    y: 50, width: logoWidth, height: logoHeight
  })
  jsmaf.root.children.push(logo)

  // القائمة الرئيسية (تستخدم الترجمات المستوردة من languages.js)
  const menuOptions = [
    { label: lang.jailbreak, script: 'loader.js', imgKey: 'jailbreak' },
    { label: lang.payloadMenu, script: 'payload_host.js', imgKey: 'payloadMenu' },
    { label: lang.config, script: 'config_ui.js', imgKey: 'config' }
  ]

  const startY = 450
  const buttonSpacing = 120
  const buttonWidth = 400
  const buttonHeight = 80

  // إنشاء الأزرار الأساسية
  for (let i = 0; i < menuOptions.length; i++) {
    const btnX = centerX - buttonWidth / 2
    const btnY = startY + i * buttonSpacing

    const button = new Image({
      url: normalButtonImg, x: btnX, y: btnY, width: buttonWidth, height: buttonHeight
    })
    buttons.push(button)
    jsmaf.root.children.push(button)

    const marker = new Image({
      url: 'file:///assets/img/ad_pod_marker.png',
      x: btnX + buttonWidth - 50, y: btnY + 35, width: 12, height: 12, visible: false
    })
    buttonMarkers.push(marker)
    jsmaf.root.children.push(marker)

    let btnText: Image | jsmaf.Text
    if (useImageText) {
      btnText = new Image({
        url: textImageBase + menuOptions[i]!.imgKey + '.png',
        x: btnX + (buttonWidth / 2) - 100, 
        y: btnY + 15, width: 200, height: 50
      })
    } else {
      btnText = new jsmaf.Text()
      btnText.text = menuOptions[i]!.label
      btnText.style = 'white'
      // حساب التوسيط بناءً على طول النص التقريبي
      btnText.x = btnX + (buttonWidth / 2) - (btnText.text.length * 6)
      btnText.y = btnY + buttonHeight / 2 - 12
    }
    buttonTexts.push(btnText)
    jsmaf.root.children.push(btnText)

    buttonOrigPos.push({ x: btnX, y: btnY })
    textOrigPos.push({ x: btnText.x, y: btnText.y })
  }

  // زر الخروج (Exit) - يضاف في نهاية المصفوفة
  const exitX = centerX - buttonWidth / 2
  const exitY = startY + menuOptions.length * buttonSpacing + 60

  const exitButton = new Image({
    url: normalButtonImg, x: exitX, y: exitY, width: buttonWidth, height: buttonHeight
  })
  buttons.push(exitButton)
  jsmaf.root.children.push(exitButton)

  const exitMarker = new Image({
    url: 'file:///assets/img/ad_pod_marker.png',
    x: exitX + buttonWidth - 50, y: exitY + 35, width: 12, height: 12, visible: false
  })
  buttonMarkers.push(exitMarker)
  jsmaf.root.children.push(exitMarker)

  let exitText: Image | jsmaf.Text
  if (useImageText) {
    exitText = new Image({
      url: textImageBase + 'exit.png',
      x: exitX + (buttonWidth / 2) - 100, y: exitY + 15, width: 200, height: 50
    })
  } else {
    exitText = new jsmaf.Text()
    exitText.text = lang.exit
    exitText.style = 'white'
    exitText.x = exitX + (buttonWidth / 2) - (exitText.text.length * 6)
    exitText.y = exitY + buttonHeight / 2 - 12
  }
  buttonTexts.push(exitText)
  jsmaf.root.children.push(exitText)

  buttonOrigPos.push({ x: exitX, y: exitY })
  textOrigPos.push({ x: exitText.x, y: exitText.y })

  // --- أنظمة الحركة والتحكم ---
  let zoomInInterval: number | null = null, zoomOutInterval: number | null = null, prevButton = -1
  function easeInOut (t: number) { return (1 - Math.cos(t * Math.PI)) / 2 }

  function animateZoomIn (btn: Image, text: any, bOX: number, bOY: number, tOX: number, tOY: number) {
    if (zoomInInterval) jsmaf.clearInterval(zoomInInterval)
    let elapsed = 0
    zoomInInterval = jsmaf.setInterval(function () {
      elapsed += 16
      const t = Math.min(elapsed / 175, 1), eased = easeInOut(t), scale = 1.0 + (0.1 * eased)
      btn.scaleX = scale; btn.scaleY = scale; btn.x = bOX - (400 * (scale - 1)) / 2; btn.y = bOY - (80 * (scale - 1)) / 2
      text.scaleX = scale; text.scaleY = scale; text.x = tOX - (400 * (scale - 1)) / 2; text.y = tOY - (80 * (scale - 1)) / 2
      if (t >= 1) { jsmaf.clearInterval(zoomInInterval!); zoomInInterval = null }
    }, 16)
  }

  function animateZoomOut (btn: Image, text: any, bOX: number, bOY: number, tOX: number, tOY: number) {
    if (zoomOutInterval) jsmaf.clearInterval(zoomOutInterval)
    let elapsed = 0
    zoomOutInterval = jsmaf.setInterval(function () {
      elapsed += 16
      const t = Math.min(elapsed / 175, 1), eased = easeInOut(t), scale = 1.1 - (0.1 * eased)
      btn.scaleX = scale; btn.scaleY = scale; btn.x = bOX - (400 * (scale - 1)) / 2; btn.y = bOY - (80 * (scale - 1)) / 2
      text.scaleX = scale; text.scaleY = scale; text.x = tOX - (400 * (scale - 1)) / 2; text.y = tOY - (80 * (scale - 1)) / 2
      if (t >= 1) { jsmaf.clearInterval(zoomOutInterval!); zoomOutInterval = null }
    }, 16)
  }

  function updateHighlight () {
    if (prevButton >= 0 && prevButton !== currentButton) {
      buttons[prevButton]!.url = normalButtonImg; buttons[prevButton]!.alpha = 0.7; buttonMarkers[prevButton]!.visible = false
      animateZoomOut(buttons[prevButton]!, buttonTexts[prevButton]!, buttonOrigPos[prevButton]!.x, buttonOrigPos[prevButton]!.y, textOrigPos[prevButton]!.x, textOrigPos[prevButton]!.y)
    }
    buttons[currentButton]!.url = selectedButtonImg; buttons[currentButton]!.alpha = 1.0; buttonMarkers[currentButton]!.visible = true
    animateZoomIn(buttons[currentButton]!, buttonTexts[currentButton]!, buttonOrigPos[currentButton]!.x, buttonOrigPos[currentButton]!.y, textOrigPos[currentButton]!.x, textOrigPos[currentButton]!.y)
    prevButton = currentButton
  }

  function handleButtonPress () {
    if (currentButton === buttons.length - 1) {
      include('includes/kill_vue.js')
    } else if (currentButton < menuOptions.length) {
      const selectedOption = menuOptions[currentButton]!
      if (selectedOption.script === 'loader.js') { jsmaf.onKeyDown = function () {} }
      
      // جلب السكريبت بناءً على السمة (Theme)
      let themePath = (typeof currentConfig !== 'undefined' && currentConfig.theme) ? currentConfig.theme : 'default'
      include(selectedOption.script.includes('loader.js') ? selectedOption.script : 'themes/' + themePath + '/' + selectedOption.script)
    }
  }

  jsmaf.onKeyDown = function (keyCode) {
    if (keyCode === 6 || keyCode === 5) { currentButton = (currentButton + 1) % buttons.length; updateHighlight() }
    else if (keyCode === 4 || keyCode === 7) { currentButton = (currentButton - 1 + buttons.length) % buttons.length; updateHighlight() }
    else if (keyCode === (jsmaf.circleIsAdvanceButton ? 13 : 14)) { handleButtonPress() }
  }

  updateHighlight()
  log('Main menu loaded with translation support.')
})()
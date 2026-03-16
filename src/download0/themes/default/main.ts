import { lang, useImageText, textImageBase } from 'download0/languages'
import { libc_addr } from 'download0/userland'
import { fn, BigInt } from 'download0/types'

(function () {
  // --- التعديل هنا: التأكد من تحميل اللغات والإعدادات ---
  if (typeof lang === 'undefined') {
    include('languages.js')
  }
  
  log('Loading main menu...')

  let currentButton = 0
  const buttons: Image[] = []
  const buttonTexts: (Image | jsmaf.Text)[] = [] // تعديل النوع ليدعم الصور والنصوص
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

  const background = new Image({
    url: 'file:///../download0/img/multiview_bg_VAF.png',
    x: 0,
    y: 0,
    width: 1920,
    height: 1080
  })
  jsmaf.root.children.push(background)

  const centerX = 960
  const logoWidth = 600
  const logoHeight = 338

  const logo = new Image({
    url: 'file:///../download0/img/logo.png',
    x: centerX - logoWidth / 2,
    y: 50,
    width: logoWidth,
    height: logoHeight
  })
  jsmaf.root.children.push(logo)

  // القائمة الرئيسية تستخدم الآن متغيرات lang التي تتأثر باللغة المختارة
  const menuOptions = [
    { label: lang.jailbreak, script: 'loader.js', imgKey: 'jailbreak' },
    { label: lang.payloadMenu, script: 'payload_host.js', imgKey: 'payloadMenu' },
    { label: lang.config, script: 'config_ui.js', imgKey: 'config' }
  ]

  const startY = 450
  const buttonSpacing = 120
  const buttonWidth = 400
  const buttonHeight = 80

  for (let i = 0; i < menuOptions.length; i++) {
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

    const marker = new Image({
      url: 'file:///assets/img/ad_pod_marker.png',
      x: btnX + buttonWidth - 50,
      y: btnY + 35,
      width: 12,
      height: 12,
      visible: false
    })
    buttonMarkers.push(marker)
    jsmaf.root.children.push(marker)

    let btnText: Image | jsmaf.Text
    if (useImageText) {
      btnText = new Image({
        url: textImageBase + menuOptions[i]!.imgKey + '.png',
        x: btnX + (buttonWidth / 2) - 100, // توسيط الصورة
        y: btnY + 15,
        width: 200,
        height: 50
      })
    } else {
      btnText = new jsmaf.Text()
      btnText.text = menuOptions[i]!.label
      btnText.x = btnX + buttonWidth / 2 - 60
      btnText.y = btnY + buttonHeight / 2 - 12
      btnText.style = 'white'
    }
    buttonTexts.push(btnText)
    jsmaf.root.children.push(btnText)

    buttonOrigPos.push({ x: btnX, y: btnY })
    textOrigPos.push({ x: btnText.x, y: btnText.y })
  }

  // زر الخروج (Exit)
  const exitX = centerX - buttonWidth / 2
  const exitY = startY + menuOptions.length * buttonSpacing + 60 // تقليل المسافة قليلاً

  const exitButton = new Image({
    url: normalButtonImg,
    x: exitX,
    y: exitY,
    width: buttonWidth,
    height: buttonHeight
  })
  buttons.push(exitButton)
  jsmaf.root.children.push(exitButton)

  const exitMarker = new Image({
    url: 'file:///assets/img/ad_pod_marker.png',
    x: exitX + buttonWidth - 50,
    y: exitY + 35,
    width: 12,
    height: 12,
    visible: false
  })
  buttonMarkers.push(exitMarker)
  jsmaf.root.children.push(exitMarker)

  let exitText: Image | jsmaf.Text
  if (useImageText) {
    exitText = new Image({
      url: textImageBase + 'exit.png',
      x: exitX + (buttonWidth / 2) - 100,
      y: exitY + 15,
      width: 200,
      height: 50
    })
  } else {
    exitText = new jsmaf.Text()
    exitText.text = lang.exit
    exitText.x = exitX + buttonWidth / 2 - 20
    exitText.y = exitY + buttonHeight / 2 - 12
    exitText.style = 'white'
  }
  buttonTexts.push(exitText)
  jsmaf.root.children.push(exitText)

  buttonOrigPos.push({ x: exitX, y: exitY })
  textOrigPos.push({ x: exitText.x, y: exitText.y })

  // --- دوال الانيميشن (Zoom) تبقى كما هي بدون تغيير لضمان الشكل الجمالي ---
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
      if (t >= 1) { jsmaf.clearInterval(zoomInInterval!); zoomInInterval = null }
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
      if (t >= 1) { jsmaf.clearInterval(zoomOutInterval!); zoomOutInterval = null }
    }, step)
  }

  function updateHighlight () {
    const prevButtonObj = buttons[prevButton]
    const prevMarker = buttonMarkers[prevButton]
    if (prevButton >= 0 && prevButton !== currentButton && prevButtonObj && prevMarker) {
      prevButtonObj.url = normalButtonImg; prevButtonObj.alpha = 0.7; prevMarker.visible = false
      animateZoomOut(prevButtonObj, buttonTexts[prevButton]!, buttonOrigPos[prevButton]!.x, buttonOrigPos[prevButton]!.y, textOrigPos[prevButton]!.x, textOrigPos[prevButton]!.y)
    }
    for (let i = 0; i < buttons.length; i++) {
      if (i === currentButton) {
        buttons[i]!.url = selectedButtonImg; buttons[i]!.alpha = 1.0; buttonMarkers[i]!.visible = true
        animateZoomIn(buttons[i]!, buttonTexts[i]!, buttonOrigPos[i]!.x, buttonOrigPos[i]!.y, textOrigPos[i]!.x, textOrigPos[i]!.y)
      } else if (i !== prevButton) {
        buttons[i]!.url = normalButtonImg; buttons[i]!.alpha = 0.7; buttonMarkers[i]!.visible = false
      }
    }
    prevButton = currentButton
  }

  function handleButtonPress () {
    if (currentButton === buttons.length - 1) {
      include('includes/kill_vue.js')
    } else if (currentButton < menuOptions.length) {
      const selectedOption = menuOptions[currentButton]!
      if (selectedOption.script === 'loader.js') { jsmaf.onKeyDown = function () {} }
      log('Loading ' + selectedOption.script + '...')
      include(selectedOption.script.includes('loader.js') ? selectedOption.script : 'themes/' + (typeof CONFIG !== 'undefined' && CONFIG.theme ? CONFIG.theme : 'default') + '/' + selectedOption.script)
    }
  }

  jsmaf.onKeyDown = function (keyCode) {
    if (keyCode === 6 || keyCode === 5) { currentButton = (currentButton + 1) % buttons.length; updateHighlight() }
    else if (keyCode === 4 || keyCode === 7) { currentButton = (currentButton - 1 + buttons.length) % buttons.length; updateHighlight() }
    else if (keyCode === (jsmaf.circleIsAdvanceButton ? 13 : 14)) { handleButtonPress() }
  }

  updateHighlight()
  log('Main menu loaded.')
})()
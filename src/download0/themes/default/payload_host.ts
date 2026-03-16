import { fn, mem, BigInt } from 'download0/types'
import { binloader_init } from 'download0/binloader'
import { libc_addr } from 'download0/userland'
import { lang, useImageText, textImageBase } from 'download0/languages'
import { checkJailbroken } from 'download0/check-jailbroken'

(function () {
  // التأكد من تحميل المكتبات الأساسية
  if (typeof libc_addr === 'undefined') {
    include('userland.js')
  }

  include('check-jailbroken.js')

  if (typeof startBgmIfEnabled === 'function') {
    startBgmIfEnabled()
  }

  // التحقق من حالة كسر الحماية (Jailbreak)
  var is_jailbroken = (typeof checkJailbroken === 'function') ? checkJailbroken() : false

  jsmaf.root.children.length = 0

  new Style({ name: 'white', color: 'white', size: 24 })
  new Style({ name: 'title', color: 'white', size: 32 })

  let currentButton = 0
  const buttons: Image[] = []
  const buttonTexts: jsmaf.Text[] = []
  const buttonMarkers: Image[] = []
  const buttonOrigPos: { x: number, y: number }[] = []
  const textOrigPos: { x: number, y: number }[] = []

  type FileEntry = { name: string, path: string }
  const fileList: FileEntry[] = []

  const normalButtonImg = 'file:///assets/img/button_over_9.png'
  const selectedButtonImg = 'file:///assets/img/button_over_9.png'

  // الخلفية
  const background = new Image({
    url: 'file:///../download0/img/multiview_bg_VAF.png',
    x: 0, y: 0, width: 1920, height: 1080
  })
  jsmaf.root.children.push(background)

  // اللوجو الصغير في الزاوية
  const logo = new Image({
    url: 'file:///../download0/img/logo.png',
    x: 1620, y: 20, width: 250, height: 140
  })
  jsmaf.root.children.push(logo)

  // --- عنوان الصفحة (يدعم الصور أو النصوص المترجمة) ---
  if (useImageText) {
    const titleImg = new Image({
      url: textImageBase + 'payloadMenu.png',
      x: 960 - 125, // توسيط
      y: 50, width: 250, height: 60
    })
    jsmaf.root.children.push(titleImg)
  } else {
    const titleText = new jsmaf.Text()
    titleText.text = lang.payloadMenu
    titleText.style = 'title'
    titleText.x = 960 - (titleText.text.length * 10) // توسيط تقريبي
    titleText.y = 70
    jsmaf.root.children.push(titleText)
  }

  // تسجيل دوال النظام للبحث عن الملفات
  fn.register(0x05, 'open_sys', ['bigint', 'bigint', 'bigint'], 'bigint')
  fn.register(0x06, 'close_sys', ['bigint'], 'bigint')
  fn.register(0x110, 'getdents', ['bigint', 'bigint', 'bigint'], 'bigint')
  fn.register(0x03, 'read_sys', ['bigint', 'bigint', 'bigint'], 'bigint')

  const scanPaths = ['/download0/payloads']
  if (is_jailbroken) {
    scanPaths.push('/data/payloads')
  }

  const path_addr = mem.malloc(256)
  const buf = mem.malloc(4096)

  for (const currentPath of scanPaths) {
    for (let i = 0; i < currentPath.length; i++) {
      mem.view(path_addr).setUint8(i, currentPath.charCodeAt(i))
    }
    mem.view(path_addr).setUint8(currentPath.length, 0)

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

          if (d_type === 8 && name !== '.' && name !== '..') {
            const lowerName = name.toLowerCase()
            if (lowerName.endsWith('.elf') || lowerName.endsWith('.bin') || lowerName.endsWith('.js')) {
              fileList.push({ name, path: currentPath + '/' + name })
            }
          }
          offset += d_reclen
        }
      }
      fn.close_sys(fd)
    }
  }

  // --- توزيع الأزرار بشكل شبكة (Grid) ---
  const startY = 200
  const buttonSpacing = 95
  const buttonsPerRow = 5
  const buttonWidth = 320
  const buttonHeight = 70
  const startX = 100
  const xSpacing = 350

  for (let i = 0; i < fileList.length; i++) {
    const row = Math.floor(i / buttonsPerRow)
    const col = i % buttonsPerRow
    const btnX = startX + col * xSpacing
    const btnY = startY + row * buttonSpacing

    const button = new Image({
      url: normalButtonImg, x: btnX, y: btnY, width: buttonWidth, height: buttonHeight, alpha: 0.7
    })
    buttons.push(button)
    jsmaf.root.children.push(button)

    const marker = new Image({
      url: 'file:///assets/img/ad_pod_marker.png',
      x: btnX + buttonWidth - 30, y: btnY + 30, width: 12, height: 12, visible: false
    })
    buttonMarkers.push(marker)
    jsmaf.root.children.push(marker)

    let displayName = fileList[i]!.name
    if (displayName.length > 25) displayName = displayName.substring(0, 22) + '...'

    const text = new jsmaf.Text()
    text.text = displayName
    text.x = btnX + 15
    text.y = btnY + 25
    text.style = 'white'
    buttonTexts.push(text)
    jsmaf.root.children.push(text)

    buttonOrigPos.push({ x: btnX, y: btnY })
    textOrigPos.push({ x: text.x, y: text.y })
  }

  // --- تلميح العودة (Back Hint) المترجم ---
  let backHint: Image | jsmaf.Text
  const hintY = 1000
  if (useImageText) {
    backHint = new Image({
      url: textImageBase + (jsmaf.circleIsAdvanceButton ? 'xToGoBack.png' : 'oToGoBack.png'),
      x: 960 - 100, y: hintY, width: 200, height: 40
    })
  } else {
    backHint = new jsmaf.Text()
    backHint.text = jsmaf.circleIsAdvanceButton ? lang.xToGoBack : lang.oToGoBack
    backHint.x = 960 - (backHint.text.length * 7)
    backHint.y = hintY
    backHint.style = 'white'
  }
  jsmaf.root.children.push(backHint)

  // --- نظام الحركة (Animation) والتحكم ---
  let zoomInInterval: number | null = null, zoomOutInterval: number | null = null, prevButton = -1
  function easeInOut (t: number) { return (1 - Math.cos(t * Math.PI)) / 2 }

  function animateZoomIn (btn: Image, text: jsmaf.Text, bOX: number, bOY: number, tOX: number, tOY: number) {
    if (zoomInInterval) jsmaf.clearInterval(zoomInInterval)
    let elapsed = 0
    zoomInInterval = jsmaf.setInterval(function () {
      elapsed += 16
      const t = Math.min(elapsed / 175, 1), eased = easeInOut(t), scale = 1.0 + (0.08 * eased)
      btn.scaleX = scale; btn.scaleY = scale; btn.x = bOX - (buttonWidth * (scale - 1)) / 2; btn.y = bOY - (buttonHeight * (scale - 1)) / 2
      text.scaleX = scale; text.scaleY = scale; text.x = tOX - (buttonWidth * (scale - 1)) / 2; text.y = tOY - (buttonHeight * (scale - 1)) / 2
      if (t >= 1) { jsmaf.clearInterval(zoomInInterval!); zoomInInterval = null }
    }, 16)
  }

  function updateHighlight () {
    if (prevButton >= 0 && prevButton !== currentButton) {
      const pB = buttons[prevButton]!
      pB.url = normalButtonImg; pB.alpha = 0.7; pB.borderWidth = 0
      buttonMarkers[prevButton]!.visible = false
      // العودة للحجم الطبيعي بدون انيميشن معقد لتوفير الأداء
      pB.scaleX = 1; pB.scaleY = 1; pB.x = buttonOrigPos[prevButton]!.x; pB.y = buttonOrigPos[prevButton]!.y
      buttonTexts[prevButton]!.scaleX = 1; buttonTexts[prevButton]!.x = textOrigPos[prevButton]!.x
    }
    const cB = buttons[currentButton]!
    cB.url = selectedButtonImg; cB.alpha = 1.0; cB.borderColor = 'rgb(100,180,255)'; cB.borderWidth = 3
    buttonMarkers[currentButton]!.visible = true
    animateZoomIn(cB, buttonTexts[currentButton]!, buttonOrigPos[currentButton]!.x, buttonOrigPos[currentButton]!.y, textOrigPos[currentButton]!.x, textOrigPos[currentButton]!.y)
    prevButton = currentButton
  }

  const confirmKey = jsmaf.circleIsAdvanceButton ? 13 : 14
  const backKey = jsmaf.circleIsAdvanceButton ? 14 : 13

  jsmaf.onKeyDown = function (keyCode) {
    if (keyCode === 6) { if (currentButton + buttonsPerRow < fileList.length) currentButton += buttonsPerRow; updateHighlight() }
    else if (keyCode === 4) { if (currentButton - buttonsPerRow >= 0) currentButton -= buttonsPerRow; updateHighlight() }
    else if (keyCode === 5) { if ((currentButton + 1) % buttonsPerRow !== 0 && currentButton + 1 < fileList.length) currentButton++; updateHighlight() }
    else if (keyCode === 7) { if (currentButton % buttonsPerRow !== 0) currentButton--; updateHighlight() }
    else if (keyCode === confirmKey) handleButtonPress()
    else if (keyCode === backKey) {
        let t = (typeof CONFIG !== 'undefined' && CONFIG.theme) ? CONFIG.theme : 'default'
        include('themes/' + t + '/main.js')
    }
  }

  function handleButtonPress () {
    const entry = fileList[currentButton]
    if (!entry) return
    log('Launching: ' + entry.name)
    if (entry.name.toLowerCase().endsWith('.js')) {
      if (entry.path.startsWith('/download0/')) include('payloads/' + entry.name)
      else {
          // قراءة ملف JS خارجي
          const p_addr = mem.malloc(256)
          for (let i = 0; i < entry.path.length; i++) mem.view(p_addr).setUint8(i, entry.path.charCodeAt(i))
          mem.view(p_addr).setUint8(entry.path.length, 0)
          const fd = fn.open_sys(p_addr, new BigInt(0, 0), new BigInt(0, 0))
          if (!fd.eq(new BigInt(0xffffffff, 0xffffffff))) {
            const buf_size = 1024 * 512
            const s_buf = mem.malloc(buf_size)
            const len = fn.read_sys(fd, s_buf, new BigInt(0, buf_size))
            fn.close_sys(fd)
            let code = ''
            for (let i = 0; i < (len.lo || len); i++) code += String.fromCharCode(mem.view(s_buf).getUint8(i))
            eval(code)
          }
      }
    } else {
      include('binloader.js')
      const { bl_load_from_file } = binloader_init()
      bl_load_from_file(entry.path)
    }
  }

  updateHighlight()
})()
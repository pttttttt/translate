const input = document.querySelector('input')
const target = document.querySelector('.target')
const dst = document.querySelector('.dst')
const container = document.querySelector('.show-container')
const play = document.querySelector('.play')

// 页面所需变量
const controller = {
  to: 'zh',
  query: '',
  ocr: '自动检测',

  isAutoMode: true, // 判断当前是否为自动模式
  isCommandMode: false, // 判断当前是否为命令模式
  tmpText: '',
  audio: new Audio(),
}

// 配置对象

// 命令执行失败提示文本模版
const errorText = {
  notParam: '执行失败\n该命令不支持参数',
  notSuffix: '执行失败\n该命令不支持后缀',
  misParam(command, param) {
    return `执行失败\n命令 ${command} 中，不支持参数：${param}`
  },
  misSuffix(command, suffix) {
    return `执行失败\n命令 ${command} 中，不支持后缀：${suffix}`
  },
}
// 其他提示文本
const tipText = {
  clearTip: `使用 ${PREFIX}clear 或 ${PREFIX}c 隐藏`,
  initTip: `按下回车键翻译或执行命令 \r使用 ${PREFIX}help 查看所有命令`,
}
/**
 * 命令配置对象
 */
const command = {
  commandList: [
    {
      code: ['help', 'h'],
      parameter: ['所有命令'],
      suffix: false,
      usageMethod: '查看所有命令',
      check([, parameter]) {
        if (!parameter) {
          tableHtml.mounted('command')
          input.value = ''
          dstChange(`使用 ${PREFIX}clear 或 ${PREFIX}c 隐藏\n所有命令均以 ${PREFIX} 开头`, 'white')
          return false
        }
        return parameter
      },
      run(parameter) {
        !hasPrefix(parameter) && (parameter = PREFIX + parameter)
        const target = command.commandMap[parameter]
        if (!target) return dstChange(`执行失败\n未找到命令：${parameter}`)
        const html = `<span>${parameter}${target.parameter ? ' [参数]' : ''}${target.suffix ? ' [后缀]' : ''}</span>
                <ul>
                  <li><span>命令</span><span>${PREFIX + target.code.join(' ' + PREFIX)}</span></li>
                  ${target.parameter ? `<li><span>支持参数</span><span>${target.parameter.join(' ')}</span></li>` : ''}
                  ${target.suffix ? `<li><span>支持后缀</span><span>${target.suffix.join(' ')}</span></li>` : ''}
                  <li><span>作用</span><span>${target.usageMethod}</span></li>
                </ul>`
        addChild(html)
        dstChange(target.usageMethod, 'white')
        input.value = ''
      }
    },
    {
      code: ['switch', 's'],
      parameter: ['所有语种代码以及别称'],
      get suffix() {
        return command._getKeyMap(this.suffixMap)
      },
      usageMethod: '切换翻译或ocr的目标语言',
      suffixMap: {
        translate: {
          all: languages,
          name: '翻译',
          changeHandler(tmpTo) {
            controller.isAutoMode = false
            controller.to = tmpTo
          },
        },
        get t() {
          return this.translate
        },
        ocr: {
          all: OCRLanguages,
          name: 'ocr',
          changeHandler(tmpTo) {
            controller.ocr = tmpTo
          },
        },
        get o() {
          return this.ocr
        },
      },
      check([command, parameter, suffix]) {
        if (!parameter) {
          controller.isAutoMode = true
          tipTextChange()
          input.value = ''
          dstChange('已恢复为自动', 'white')
          return false
        }
        let tmpData = {}
        if (!suffix) {
          tmpData = this.suffixMap.translate
        } else {
          tmpData = this.suffixMap[suffix]
          if (!tmpData) {
            dstChange(errorText.misSuffix(command, suffix))
            return false
          }
        }
        const [tmpTo] = queryKeyword(parameter, tmpData.all)
        if (!tmpTo) {
          dstChange(`切换失败 \n未从支持的${tmpData.name}语种库中找到目标语种: ${parameter}`)
          return false
        }
        return { tmpTo, data: tmpData }
      },
      run({ tmpTo, data }) {
        data.changeHandler(tmpTo)
        dstChange(`${data.name}目标语种切换成功`, 'white')
        tipTextChange()
        input.value = ''
      }
    },
    {
      code: ['check', 'ck'],
      get parameter() {
        return command._getKeyMap(this.parameterMap)
      },
      suffix: ['所选表格子项'],
      usageMethod: '查看语种表格与快捷键',
      parameterMap: {
        get _default() {
          return this.translate
        },
        translate: {
          tableKey: 'languages',
          all: languages,
          name: '翻译'
        },
        get t() {
          return this.translate
        },
        ocr: {
          tableKey: 'ocrLanguages',
          all: OCRLanguages,
          name: 'ocr'
        },
        get o() {
          return this.ocr
        },
        key: {
          tableKey: 'keyEvent',
          all: false,
          name: '快捷键'
        },
        get k() {
          return this.key
        }
      },
      check([command, parameter, suffix]) {
        let tmpData = {}
        if (!parameter) {
          tmpData = this.parameterMap._default
        } else {
          tmpData = this.parameterMap[parameter]
          if (!tmpData) {
            dstChange(errorText.misParam(command, parameter))
            return
          }
        }
        if (!suffix) {
          tableHtml.mounted(tmpData.tableKey)
          input.value = ''
          dstChange(tipText.clearTip, 'white')
          return false
        }
        if (!tmpData.all) {
          dstChange(`执行失败\n此参数不能添加后缀`)
          return false
        }
        const result = queryKeyword(suffix, tmpData.all)[1]
        if (!result) {
          dstChange(`执行失败\n未从支持的${tmpData.name}语种中找语种: ${suffix}`)
          return false
        }
        return result
      },
      run(result, [, , suffix]) {
        dstChange(tipText.clearTip, 'white')
        const html = `<span>${suffix}</span>
                  <ul>
                    <li><span>语种</span><span>${result.name}</span></li>
                    <li><span>代码</span><span>${result.code}</span></li>
                    <li><span>别名</span><span>${result.alias.join(' ')}</span></li>
                  </ul>`
        addChild(html)
        input.value = ''
      }
    },
    {
      code: ['clear', 'c', 'cls'],
      parameter: false,
      suffix: false,
      usageMethod: '恢复页面数据至初始状态',
      check() {
        return true
      },
      run() {
        container.innerHTML = ''
        input.value = ''
        dstChange(tipText.initTip, 'white')
      }
    },
    {
      code: ['open', 'o'],
      get parameter() {
        return command._getKeyMap(this.urlData)
      },
      suffix: [PREFIX],
      urlData: {
        _translateUrl: 'https://cn.bing.com/translator?ref=TThis&text=&from=en&to=zh-Hans',
        _typingUrl: '../typing/index.html',
        _pxUrl: '../convert.html',
        get _defUrl() {
          return this._translateUrl
        },
        get fanyi() {
          return this._translateUrl
        },
        get f() {
          return this._translateUrl
        },
        get typing() {
          return this._typingUrl
        },
        get t() {
          return this._typingUrl
        },
        get px() {
          return this._pxUrl
        },
        get p() {
          return this._pxUrl
        }
      },
      usageMethod: '跳转至目标网页',
      check([command, parameter, suffix]) {
        const urlData = this.urlData
        let url = urlData._defUrl, judge = false
        if (!parameter) return [url, judge]
        url = urlData[parameter]
        if (!url) {
          dstChange(errorText.misParam(command, parameter))
          return false
        }
        if (suffix) {
          if (this.suffix.indexOf(suffix) === -1) {
            dstChange(errorText.misSuffix(command, suffix))
            return false
          }
          judge = true
        }
        return [url, judge]
      },
      run([url, judge]) {
        window.open(url, judge ? '_blank' : '_self')
      }
    },
    {
      code: ['token', 'tk'],
      parameter: ['ocr', 'speech'],
      suffix: false,
      usageMethod: '更新各个api的token',
      check([command, parameter]) {
        const tokenConfig = parameter ? tokens[parameter] : tokens.ocr
        if (!tokenConfig) {
          dstChange(errorText.misParam(command, parameter) + `\n使用命令：${PREFIX}help token 查看所有支持的参数`)
          return false
        }
        return tokenConfig
      },
      run(tokenConfig) {
        dstChange(`${tokenConfig.name} token更新中`, 'white')
        Api.getToken(tokenConfig.ak, tokenConfig.sk).then(data => {
          localStorage.setItem(tokenConfig.key, data)
          dstChange(`${tokenConfig.name} token更新成功\n新:${data}\n旧:${tokenConfig.value}`, 'white')
          tokenConfig.value = data
        })
      }
    },
    {
      code: [''],
      parameter: false,
      suffix: false,
      usageMethod: '切换命令模式和翻译模式',
      check() {
        return true
      },
      run() {
        modeChange()
      }
    },
    {
      code: ['!'],
      parameter: false,
      suffix: false,
      usageMethod: '检索目录',
      path: 'D:\\SteamLibrary\\steamapps\\workshop\\content\\431960',
      disable: false,
      check() {
        return !this.disable
      },
      run() {
        this.disable = true
        const basePath = this.path
        let count = 0
        let errCount = 0
        const normal = []
        const tooFew = []
        const tooMuch = []
        const typeErr = []
        const promiseArr = []
        dstChange('开始检索目录: ' + basePath, 'white')
        Api.getFileData(basePath).then(data => {
          const arr = data.data
          if (arr.length === 0) {
            this.disable = false
            dstChange('该目录下未找到任何文件: ' + basePath)
            return
          }
          const sumLeg = arr.length
          dstChange(`检索中,总共${sumLeg}个文件,已检索: ${count},异常: ${errCount}`, 'white')
          arr.forEach(path => {
            const targetPath = basePath + '\\' + path
            const promise = Api.getFileData(targetPath)
            promiseArr.push(promise)
            promise.then(data2 => {
              count++
              const arr2 = data2.data
              for (let i = 0; i < arr2.length; i++) {
                const fileName = arr2[i]
                if (fileName.match(/\.(exe|zip|rar|7z)$/)) {
                  const suffix = fileName.split(/\./).pop()
                  typeErr.push({ name: path, path: targetPath, leg: arr2.length, type: suffix })
                  errCount++
                  return
                }
              }
              if (arr2.length < 3) {
                tooFew.push({ name: path, leg: arr2.length, path: targetPath })
                errCount++
                return
              }
              if (arr2.length > 4) {
                tooMuch.push({ name: path, leg: arr2.length, path: targetPath })
                errCount++
                return
              }
              normal.push({ name: path, leg: arr2.length, path: targetPath })
            })
            promise.then(() => {
              dstChange(`检索中,总共${sumLeg}个文件,已检索: ${count},异常: ${errCount}`, 'white')
            })
          })
          Promise.all(promiseArr).finally(() => {
            dstChange(`检索完成,总共${sumLeg}个文件,已检索: ${count},异常: ${errCount}`, 'white')
            this.disable = false
            const summary = [...typeErr, ...tooFew, ...tooMuch]
            let liHtml = ''
            summary.forEach(item => {
              liHtml += `<li onclick="clickLi('${item.name}')" data-file="${item.name}"><span>${item.name}</span><span>${item.leg + (item.type ? ' ' + item.type : '')}</span></li>`
            })
            const html = `<span>异常目录</span>
                          <ul id="errFile">
                            ${liHtml}
                          </ul>`
            addChild(html)
            input.value = ''
          })
        })
      },
    },
  ],
  commandMap: {},
  init() {
    this._listToMap()
  },
  _getKeyMap(obj) {
    const arr = []
    for (const key in obj) {
      if (key[0] !== '_') {
        arr.push(key)
      }
    }
    return arr
  },
  _listToMap() {
    for (const v of this.commandList) {
      v.code.forEach(code => {
        this.commandMap[PREFIX + code] = v
      })
    }
  },
  _splitCommand(command) { // 以 命令 参数 后缀 分割字符串
    return command.split(/\s+/)
  },
  /**
   * 执行命令
   * @param {string} command 输入的命令字符
   */
  execute(command) {
    const strArr = this._splitCommand(command)
    if (strArr.length > 3) return dstChange(`执行失败\n命令格式错误！\n请使用以下格式：${PREFIX}[命令] [参数] [后缀]`)
    const target = this.commandMap[strArr[0]]
    if (!target) return dstChange(`执行失败 \n命令不存在: ${strArr[0]} \n输入${PREFIX}h查看所有命令`)
    if (strArr.length > 1 && target.parameter === false) {
      dstChange(errorText.notParam)
      return
    }
    if (strArr.length > 2 && target.suffix === false) {
      dstChange(errorText.notSuffix)
      return
    }
    const res = target.check(strArr)
    res && target.run(res, strArr)
  },
  /**
   * 静默执行 命令不合法时不再报错 直接忽略
   * @param {string} command 输入的命令字符
   */
  silentExecute(command) {
    const strArr = this._splitCommand(command)
    const suffix = strArr[strArr.length - 1]
    if (suffix === PREFIX) return false // 输入后缀为命令前缀时 不执行命令
    const target = this.commandMap[strArr[0]]
    if (!target) return false
    if (strArr.length > 1 && target.parameter === false) return false
    if (strArr.length > 2 && target.suffix === false) return false
    history.add(command, 'command') // 记录
    const res = target.check(strArr)
    res && target.run(res, strArr)
    return true
  }
}
/**
 * 键盘绑定事件
 */
const keyEvent = [
  {
    key: 'Enter',
    combinationKey: 'enter',
    usageMethod: '翻译或者执行命令',
    other: {
      ctrl: '识别图片文本'
    },
    fn(e) {
      query = input.value.replace(/^\s*|\s*$/g, "") // 去除输入文本前后的空格
      if (e.ctrlKey) { // 识别图片文本
        _ocrHandler()
        return
      }
      if (controller.isCommandMode) query = hasPrefix(query) ? query : PREFIX + query // 命令模式下自动给字符串添加前缀
      if (query === '') return dstChange('内容不能为空')
      history.resetSubscript() // 重置历史记录下标位置
      if (command.silentExecute(PREFIX + query)) return
      if (hasPrefix(query)) { // 执行命令
        history.add(query, 'command') // 记录
        command.execute(query)
      } else { // 翻译
        _translateHandler(query)
      }
    }
  },
  {
    key: 'Escape',
    combinationKey: 'escape',
    usageMethod: '清空输入框',
    fn() {
      input.value = ''
      input.focus()
    }
  },
  {
    key: 'ArrowUp',
    combinationKey: 'arrowUp',
    usageMethod: '读取翻译历史记录',
    other: {
      ctrl: '读取命令历史记录',
      alt: '读取ocr历史记录',
    },
    fn(e) {
      if (e.ctrlKey || controller.isCommandMode) history.read('command', true)
      else if (e.altKey) history.read('ocr', true)
      else history.read('translate', true)
    }
  },
  {
    key: 'ArrowDown',
    combinationKey: 'arrowDown',
    usageMethod: '读取翻译历史记录',
    other: {
      ctrl: '读取命令历史记录',
      alt: '读取ocr历史记录',
    },
    fn(e) {
      if (e.ctrlKey || controller.isCommandMode) history.read('command', false)
      else if (e.altKey) history.read('ocr', false)
      else history.read('translate', false)
    }
  },
  {
    key: '\\',
    combinationKey: 'ctrl + \\',
    usageMethod: '拆分驼峰命名法的各个单词',
    fn(e) {
      if (e.ctrlKey) input.value = input.value.replace(/(?<!\s)([A-Z])/g, ' $1')
    }
  },
  {
    key: ' ',
    combinationKey: 'ctrl + space',
    usageMethod: '切换模式',
    fn(e) {
      if (e.ctrlKey) modeChange()
    }
  }
]
/**
 * 历史记录
 */
const history = {
  translate: {
    currentLocation: -1,
    arr: [],
    dstText: []
  },
  command: {
    currentLocation: -1,
    arr: [],
    dstText: []
  },
  ocr: {
    currentLocation: -1,
    arr: [],
    dstText: []
  },
  /**
   * 记录
   * @param {string} str input 输入框的值
   * @param {string} sign 存储目标
   * @param {string} dst dst 区域的值
   */
  add(str, sign, dst = '') {
    const target = this[sign]
    const isRepeat = target.arr.indexOf(str)
    isRepeat !== -1 && target.arr.splice(isRepeat, 1)
    target.arr.unshift(str)
    if (dst) {
      isRepeat !== -1 && target.dstText.splice(isRepeat, 1)
      target.dstText.unshift(dst)
    }
  },
  /**
   * 读取记录
   * @param {string} sign 读取目标
   * @param {boolean} direction 读取方向
   */
  read(sign, direction) {
    const target = this[sign]
    if (direction) target.currentLocation < target.arr.length - 1 && target.currentLocation++
    else target.currentLocation > 0 && target.currentLocation--
    target.currentLocation >= 0 && (input.value = target.arr[target.currentLocation])
    target.dstText[target.currentLocation] && dstChange(target.dstText[target.currentLocation], 'white')
  },
  /**
   * 重置历史记录下标位置
   */
  resetSubscript() {
    this.translate.currentLocation = -1
    this.command.currentLocation = -1
    this.ocr.currentLocation = -1
  },
  /**
   * 清楚指定历史记录
   * @param {string} sign 清除目标
   */
  clearHistory(sign) {
    if (sign) {
      this[sign].arr = []
    } else {
      for (const key in this) {
        this[key].arr = []
      }
    }
  }
}
/**
 * 各类表格
 */
const tableHtml = {
  languages: '<div>语种代码<span>对应语种</span></div>',
  ocrLanguages: '<div>语种代码<span>对应语种</span></div>',
  command: '<div>命令<span>使用方法</span></div>',
  keyEvent: '<div>快捷键<span>作用</span></div>',
  init() {
    languages.forEach(v => {
      const commandStr = PREFIX + 'switch ' + v.code + ' translate'
      this.languages += `<div onclick="clickLiTwo('${commandStr}')">${v.code}<span>${v.name}</span></div>`
    })
    OCRLanguages.forEach(v => {
      const commandStr = PREFIX + 'switch ' + v.code + ' ocr'
      this.ocrLanguages += `<div onclick="clickLiTwo('${commandStr}')">${v.code}<span>${v.name}</span></div>`
    })
    command.commandList.forEach(v => {
      const commandStr = PREFIX + 'help ' + (v.code[0] || PREFIX)
      this.command += `<div onclick="clickLiTwo('${commandStr}')">${PREFIX + v.code.join(' 或 ' + PREFIX)}<span>${v.usageMethod}</span></div>`
    })
    keyEvent.forEach(v => {
      this.keyEvent += `<div>${v.combinationKey}<span>${v.usageMethod}</span></div>`
      if (v.other) {
        for (const key in v.other) {
          this.keyEvent += `<div>&nbsp;&nbsp;${key + ' + ' + v.combinationKey}<span>${v.other[key]}</span></div>`
        }
      }
    })
  },
  /**
   * 显示需要的表格
   * @param {string} key 目标
   */
  mounted(key) {
    addChild(this[key], 'table')
  }
}

command.init()
tableHtml.init()

// 逻辑主体
input.focus() // 打开网页时自动聚焦
tipTextChange()
dstChange(tipText.initTip, 'white')
window.oncontextmenu = () => false // 禁用鼠标右键
dst.addEventListener('mouseup', e => e.stopPropagation()) // 阻止鼠标在结果区域时的事件冒泡
play.addEventListener('click', () => { // 文本合成语音
  const text = dst.innerText.replace(/^\s*|\s*$/g, "")
  if (text === controller.tmpText) {
    controller.audio.play()
    return
  }
  controller.tmpText = text
  Api.speechSynthesis(controller.tmpText).then(data => {
    controller.audio.src = URL.createObjectURL(data)
    controller.audio.play()
  })
})
addEventListener('mousedown', e => e.button === 2 ? copyText(dst.innerText) : false) // 鼠标按下右键 将翻译结果复制到剪切板
addEventListener('mouseup', e => {
  input.focus() // 鼠标点击自动聚焦
  e.button === 1 && (input.value = '') // 鼠标点击中键 将输入框清空
  if (e.button === 4) input.value = input.value.replace(/(?<!\s)([A-Z])/g, ' $1') // 鼠标点击4键 分割驼峰命名法各个单词
})
addEventListener('keyup', e => {
  for (let i = 0, n = keyEvent.length; i < n; i++) {
    if (keyEvent[i].key === e.key) {
      keyEvent[i].fn(e)
      break
    }
  }
})
let errorTip = true
getClipboardUpdateHandler()
setInterval(getClipboardUpdateHandler, 2000)

function clickLi(fileName) { // 鼠标点击列表项
  copyText(command.commandMap[PREFIX + '!'].path + '\\' + fileName)
  const ul = document.querySelector('#errFile')
  for (let i = 0, n = ul.children.length; i < n; i++) {
    const li = ul.children[i]
    if (li.dataset.file === fileName) {
      li.style.color = 'green'
      return
    }
  }
}
function clickLiTwo(command) {
  input.value = command
}

/**
 * 检查剪贴板数据是否发生变化
 */
function getClipboardUpdateHandler() {
  if (document.hidden) return
  Api.getClipboardUpdate(errorTip).then(data => {
    if (data.status === 0) {
      const str = data.str
      errorTip = true
      input.value = str
      if (str.match(/(https?:\/\/[^\s]+)|(([a-zA-Z]:)?[\\/][\w\-\.\\\/ ]+)/g)) return
      _translateHandler(str)
    }
  }, err => {
    errorTip = false
    console.log(err)
  })
}

/**
 * 翻译处理程序
 * @param {string} query 输入的字符串
 */
function _translateHandler(query) {
  if (controller.isAutoMode) controller.to = /.*[\u4e00-\u9fa5]+.*$/.test(query) ? 'en' : 'zh' // 判断输入文本是否含有中文
  dstChange('正在翻译中', 'white')
  Api.translate(query, controller.to).then(res => { // 翻译并处理翻译结果
    let dst = '翻译失败，请按下回车键重新翻译'
    if (!res.trans_result) {
      let result = lookup(res.error_code, errorCode)
      dstChange(
        `翻译失败
        错误码: ${result.code}
        ${result.meaning}
        解决方法:  ${result.resolvent}`
      )
      return
    }
    dst = res.trans_result[0].dst
    dstChange(dst, 'white')
    history.add(query, 'translate', dst)
  })
}

/**
 * 图片文本识别
 * @param {string} languageType 待识别的语种
 */
function _ocrHandler() {
  history.resetSubscript() // 重置历史记录下标位置
  dstChange('正在获取图片文件', 'white')
  Api.getFileData().then(data => {
    if (data.code !== 200) return dstChange(data.msg)
    const imgFileNameList = data.data.filter(fileName => fileName.match(/\.(jpg|jpeg|png|bmp)$/))
    if (imgFileNameList.length === 0) return dstChange('该文件夹没有找到合适格式的图片')
    const imgFilePath = data.path + '\\' + imgFileNameList.pop()
    input.value = imgFilePath
    addChild(`<img src="${imgFilePath}" alt="加载失败"/>`, 'img')
    Api.getFileData(imgFilePath).then(data => {
      if (data.code !== 200) return dstChange(data.msg)
      const imageFile = data.data
      dstChange(`正在识别文件：${imgFilePath}`, 'white')
      Api.imgTextRecognition({ image: imageFile, language_type: controller.ocr })
        .then(OCRResult => {
          if (OCRResult.error_code) {
            dstChange(`图片识别失败\ncode:${OCRResult.error_code}\nmsg:${OCRResult.error_msg}`)
            return
          }
          const resultArr = []
          OCRResult.words_result.forEach(value => {
            resultArr.push(value.words)
          })
          const resultStr = resultArr.join('\n')
          dstChange(resultStr, 'white')
          history.add(imgFilePath, 'ocr', resultStr) // 记录
        })
    })
  })
}

/**
 * 匹配代码所对应的对象
 * @param {object} data 需查询的数据
 * @param {array} arr 在此数组中查询
 * @returns 查询结果
 */
function lookup(data, arr) {
  let result = false
  arr.forEach(v => result = v.code === data ? v : result)
  return result
}

/**
 * 将传入的字符串复制到剪切板
 * @param {string} text 需粘贴到剪贴板的字符串
 * @returns {boolean} 成功与否
 */
function copyText(text) {
  return navigator.clipboard.writeText(text)
}

/**
 * 匹配传入字符所在传入对象中对应的代码
 * @param {string} query 命令的参数
 * @param {object} obj 在此对象中查询
 * @returns {array} 匹配结果
 */
function queryKeyword(query, obj = languages) {
  let result = null
  for (let i = 0; i < obj.length; i++) {
    const language = obj[i]
    if (query === language.code || query === language.name) {
      result = language
      break
    }
    const matchedAlias = language.alias.some(alias => alias === query)
    if (matchedAlias) {
      result = language
      break
    }
  }
  return [result?.code, result]
}

/**
 * 切换模式
 */
function modeChange() {
  controller.isCommandMode = !controller.isCommandMode
  tipTextChange()
  input.value = ''
  dstChange('切换成功' + (controller.isCommandMode ? '\n输入 ' + PREFIX + ' 退出' : ''), 'white')
}

/**
 * 创建并新增子节点
 * @param {string} html 子节点中的html代码
 * @param {string} myClass 该节点的类名
 */
function addChild(html, myClass = 'item') {
  const div = document.createElement('div')
  div.classList.add(myClass)
  div.innerHTML = html
  const child = container.firstChild
  container.insertBefore(div, child)
}

/**
 * 结果显示区域的文本以及样式切换
 * @param {string} text 文本
 * @param {string} color 文本颜色
 */
function dstChange(text = 'error', color = 'red') {
  dst.style.color = color
  dst.innerText = text
}

/**
 * 更改提示区域文本
 */
function tipTextChange() {
  const translate = queryKeyword(controller.isAutoMode ? 'auto' : controller.to)[1]
  const ocrLanguages = queryKeyword(controller.ocr, OCRLanguages)[1]
  target.innerText = `目标语言: ${translate.name} ocr语言: ${ocrLanguages.name} ${controller.isCommandMode ? '<- 命令模式 ->' : ''}`
}

/**
 * 判断字符串有无命令前缀
 * @param {string} str 待判断的字符串
 */
function hasPrefix(str) {
  return str.startsWith(PREFIX);
}

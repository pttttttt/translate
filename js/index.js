const input = document.querySelector('input')
const target = document.querySelector('.target')
const dst = document.querySelector('.dst')
const container = document.querySelector('.show-container')
const play = document.querySelector('.play')

// api所需参数
let salt = new Date()
let from = 'auto'
let to = 'zh'
let query = ''
let str1 = ''
let sign = ''
let ocr = '自动检测'

let isAutoMode = true // 判断当前是否为自动模式
let isCommandMode = false // 判断当前是否为命令模式
let tmpText = ''
const audio = new Audio()

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
  clearTip: '使用 -clear 或 -c 隐藏',
  initTip: '按下回车键翻译或执行命令 \r使用 -hlep 查看所有命令',
}
/**
 * 命令配置对象
 */
const command = [
  {
    code: ['-help', '-h'],
    parameter: ['所有命令'],
    suffix: false,
    usageMethod: '查看所有命令',
    check([command, parameter, suffix]) {
      if (!parameter) {
        addChild(commandHtml, 'table')
        input.value = ''
        dstChange("使用 -clear 或 -c 隐藏\n所有命令均以 - 开头", 'white')
        return false
      }
      return parameter
    },
    run(parameter) {
      parameter[0] !== '-' && (parameter = '-' + parameter)
      let html
      command.forEach(value => {
        if (!(value.code.indexOf(parameter) + 1)) return
        html = `<span>${parameter}${value.parameter[0] ? ' [参数]' : ''}${value.suffix[0] ? '[后缀]' : ''}</span>
                <ul>
                  <li><span>命令</span><span>${value.code.join(' ')}</span></li>
                  ${value.parameter[0] ? `<li><span>支持参数</span><span>${value.parameter.join(' ')}</span></li>` : ''}
                  ${value.suffix[0] ? `<li><span>支持后缀</span><span>${value.suffix.join(' ')}</span></li>` : ''}
                  <li><span>作用</span><span>${value.usageMethod}</span></li>
                </ul>`
        addChild(html)
        dstChange(value.usageMethod, 'white')
        input.value = ''
      })
      if (!html) dstChange(`执行失败\n未找到命令：${parameter}`)
    }
  },
  {
    code: ['-switch', '-s'],
    parameter: ['所有语种代码以及别称'],
    suffix: false,
    usageMethod: '-s 切换到自动模式\n\n-s [语种代码] 切换到指定语种',
    check([command, parameter, suffix]) {
      if (!parameter) {
        isAutoMode = true
        tipTextChange('自动')
        input.value = ''
        dstChange('已恢复为自动', 'white')
        return false
      }
      const [tmpTo] = queryKeyword(parameter)
      if (!tmpTo) {
        dstChange(`切换失败 \n未从支持的语种库中找到目标语种: ${parameter}`)
        return false
      }
      return tmpTo
    },
    run(tmpTo) {
      dstChange('正在切换中', 'white')
      _translate('苹果', tmpTo).then(res => {
        if (!res.trans_result) return dstChange(`切换失败 \n未从支持的语种库中找到目标语种: ${tmpTo}`)
        let result = lookup(tmpTo, languages)
        to = tmpTo
        dstChange(`切换成功`, 'white')
        tipTextChange(`${result.code}[${result.name}]`, ocr, isCommandMode)
        input.value = ''
        isAutoMode = false
      })
    }
  },
  {
    code: ['-check', '-ck'],
    parameter: ['所有语种代码以及别称'],
    suffix: false,
    usageMethod: '查看各个语种以及对应代码',
    check([command, parameter, suffix]) {
      if (!parameter) {
        addChild(languagesHtml, 'table')
        input.value = ''
        return false
      }
      const result = lookup(queryKeyword(parameter)[0], languages)
      if (!result) {
        dstChange(`执行失败\n未从支持语种中找语种: ${parameter}`)
        return false
      }
      return result
    },
    run(result, [command, parameter, suffix]) {
      dstChange(tipText.clearTip, 'white')
      const html = `<span>${parameter}</span>
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
    code: ['-clear', '-c'],
    parameter: false,
    suffix: false,
    usageMethod: '清除已显示的提示信息',
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
    code: ['-open', '-o'],
    parameter: ['fanyi', 'f', 'typing', 't'],
    suffix: ['-'],
    defUrl: 'https://fanyi.baidu.com/?aldtype=16047#auto/zh',
    url: ['https://fanyi.baidu.com/?aldtype=16047#auto/zh', 'https://fanyi.baidu.com/?aldtype=16047#auto/zh', '../typing/index.html', '../typing/index.html'],
    usageMethod: '跳转至目标网页',
    check([command, parameter, suffix]) {
      let url = this.defUrl, judge = false
      if (!parameter) return [url, judge]
      url = this.url[this.parameter.indexOf(parameter)]
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
    code: ['-'],
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
    code: ['-type', '-t'],
    parameter: ['所有图片文本识别语种'],
    suffix: false,
    usageMethod: '切换图片文本识别语种',
    check([command, parameter, suffix]) {
      if (!parameter) {
        addChild(ocrLanguagesHtml, 'table')
        dstChange(tipText.clearTip, 'white')
        input.value = ''
        return false
      }
      const [code, resultObj] = queryKeyword(parameter, OCRLanguages)
      if (!code) {
        dstChange(`未从支持的语种库中找到该语种：${parameter}\n使用命令：-hlep type 以查看所有支持的语种`)
        return false
      }
      return resultObj
    },
    run(resultObj) {
      ocr = resultObj.name
      dstChange('切换ocr语种成功', 'white')
      tipTextChange(to, ocr, isCommandMode)
      input.value = ''
    }
  },
  {
    code: ['-token', '-tk'],
    parameter: ['ocr', 'speech'],
    suffix: false,
    usageMethod: '更新各个api的token',
    check([command, parameter, suffix]) {
      const tokenConfig = parameter ? tokens[parameter] : tokens.ocr
      if (!tokenConfig) {
        dstChange(errorText.misParam(command, parameter) + '\n使用命令：-help token 查看所有支持的参数')
        return false
      }
      return tokenConfig
    },
    run(tokenConfig) {
      dstChange(`${tokenConfig.name} token更新中`, 'white')
      _getToken(tokenConfig.ak, tokenConfig.sk).then(data => {
        localStorage.setItem(tokenConfig.key, data)
        tokenConfig.value = data
        dstChange(`${tokenConfig.name} token更新成功\n新:${data}\n旧:${tokenConfig.value}`, 'white')
      })
    }
  }
]
/**
 * 键盘绑定事件
 */
const keyEvent = [
  {
    key: 'Enter',
    combinationKey: 'enter',
    usageMethod: '翻译或者执行命令',
    fn(e) {
      query = input.value.replace(/^\s*|\s*$/g, "") // 去除输入文本前后的空格
      if (e.ctrlKey) { // 识别图片文本
        const [code] = queryKeyword(query, OCRLanguages)
        if (!code) return dstChange(`未从支持的语种库中找到该语种：${query}\n使用命令：-hlep type 以查看所有支持的语种`)
        _ocrHandler(code && ocr)
        return
      }
      if (isCommandMode) query = query[0] === '-' ? query : '-' + query // 命令模式下自动给字符串首字母新增字符 -
      if (query === '') return dstChange('内容不能为空')
      history.resetSubscript() // 重置历史记录下标位置
      if (isCommandMode || query[0] === '-') { // 执行命令
        _executeCommandHandler(query)
      } else { // 翻译
        _translateHanlder(query)
      }
    }
  },
  {
    key: 'Escape',
    combinationKey: 'escape',
    usageMethod: '清空输入框',
    fn(e) {
      input.value = ''
      input.focus()
    }
  },
  {
    key: 'ArrowUp',
    combinationKey: 'arrowUp',
    usageMethod: '读取历史记录',
    fn(e) {
      if (e.ctrlKey || isCommandMode) readHistory(history.command, true)
      else if (e.altKey) readHistory(history.ocr, true)
      else readHistory(history.translate, true)
    }
  },
  {
    key: 'ArrowDown',
    combinationKey: 'arrowDown',
    usageMethod: '读取历史记录',
    fn(e) {
      if (e.ctrlKey || isCommandMode) readHistory(history.command, false)
      else if (e.altKey) readHistory(history.ocr, false)
      else readHistory(history.translate, false)
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
  resetSubscript() {
    this.translate.currentLocation = -1
    this.command.currentLocation = -1
    this.ocr.currentLocation = -1
  },
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

// 生成查询表格
let languagesHtml = '<div>语种代码<span>对应语种</span></div>'
let ocrLanguagesHtml = '<div>语种代码<span>对应语种</span></div>'
let commandHtml = '<div>命令<span>使用方法</span></div>'
let keyEventHtml = '<div>快捷键<span>作用</span></div>'
languages.forEach(v => {
  languagesHtml += `<div>${v.code}<span>${v.name}</span></div>`
})
OCRLanguages.forEach(v => {
  ocrLanguagesHtml += `<div>${v.code}<span>${v.name}</span></div>`
})
command.forEach(v => {
  commandHtml += `<div>${v.code.join(' 或 ')}<span>${v.usageMethod}</span></div>`
})
keyEvent.forEach(v => {
  keyEventHtml += `<div>${v.combinationKey}<span>${v.usageMethod}</span></div>`
})

// 逻辑主体
input.focus() // 打开网页时自动聚焦
tipTextChange('自动', ocr)
window.oncontextmenu = () => false // 禁用鼠标右键
dst.addEventListener('mouseup', e => e.stopPropagation()) // 阻止鼠标在结果区域时的事件冒泡
play.addEventListener('click', e => { // 文本合成语音
  const text = dst.innerText.replace(/^\s*|\s*$/g, "")
  if (text === tmpText) {
    audio.play()
    return
  }
  tmpText = text
  _speechSynthesis(tmpText).then(data => {
    audio.src = URL.createObjectURL(data)
    audio.play()
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
    if (keyEvent[i].key === e.key) keyEvent[i].fn(e)
  }
})
getClipboardUpdateHandler()
setInterval(getClipboardUpdateHandler, 2000)

// 回调函数

/**
 * 检查剪贴板数据是否发生变化
 */
function getClipboardUpdateHandler() {
  if (document.hidden) return
  _getClipboardUpdate().then(data => {
    if (data.status === 0) {
      input.value = data.str
      _translateHanlder(data.str)
    }
  }, err => {
    console.log(err)
  })
}

/**
 * 执行命令
 * @param {string} query 输入的命令字符
 */
function _executeCommandHandler(query) {
  addHistory(query, history.command) // 记录
  const strArr = query.split(/\s+/) // 以 命令 参数 后缀 分割字符串
  if (strArr.length > 3) return dstChange('执行失败\n命令格式错误！\n请使用以下格式：-[命令] [参数] [后缀]')
  for (let i = 0, n = command.length; i < n; i++) {
    if (command[i].code.indexOf(strArr[0]) !== -1) {
      const target = command[i]
      if (strArr.length > 1 && target.parameter === false) {
        dstChange(errorText.notParam)
        return
      }
      if (strArr.length > 2 && target.suffix === false) {
        dstChange(errorText.notSuffix)
        return
      }
      const res = command[i].check(strArr)
      res && command[i].run(res, strArr)
      return
    }
  }
  dstChange(`执行失败 \n命令不存在: ${strArr[0]} \n输入-h查看所有命令`)
}

/**
 * 翻译处理程序
 * @param {string} query 输入的字符串
 */
function _translateHanlder(query) {
  if (isAutoMode) to = /.*[\u4e00-\u9fa5]+.*$/.test(query) ? 'en' : 'zh' // 判断输入文本是否含有中文
  dstChange('正在翻译中', 'white')
  _translate(query, to).then(res => { // 翻译并处理翻译结果
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
    addHistory(query, history.translate, dst)
  })
}

/**
 * 图片文本识别
 * @param {string} languageType 待识别的语种
 */
function _ocrHandler(languageType = 'auto_detect') {
  history.resetSubscript() // 重置历史记录下标位置
  dstChange('正在获取图片文件', 'white')
  _getFileData().then(data => {
    if (data.code !== 200) return dstChange(data.msg)
    const imgFileNameList = data.data.filter(fileName => fileName.match(/\.(jpg|jpeg|png|bmp)$/))
    if (imgFileNameList.length === 0) return dstChange('该文件夹没有找到合适格式的图片')
    const imgFilePath = data.path + '\\' + imgFileNameList.pop()
    input.value = imgFilePath
    addChild(`<img src="${imgFilePath}"/>`, 'img')
    _getFileData(imgFilePath).then(data => {
      if (data.code !== 200) return dstChange(data.msg)
      const imageFile = data.data
      dstChange(`正在识别文件：${imgFilePath}`, 'white')
      _imgTextRecognition({ image: imageFile, language_type: languageType })
        .then(OCRResult => {
          if (OCRResult.error_code) {
            dstChange(`图片识别失败\ncode:${OCRResult.error_code}\nmsg:${OCRResult.error_msg}`)
            return
          }
          const resultArr = new Array()
          OCRResult.words_result.forEach(value => {
            resultArr.push(value.words)
          })
          const resultStr = resultArr.join('\n')
          dstChange(resultStr, 'white')
          addHistory(imgFilePath, history.ocr, resultStr) // 记录
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
  let textarea = document.createElement("input")//创建input元素
  const currentFocus = document.activeElement//当前获得焦点的元素，保存一下
  document.body.appendChild(textarea)//添加元素
  textarea.value = text
  textarea.focus()
  textarea.setSelectionRange(0, textarea.value.length)//获取光标起始位置到结束位置
  //textarea.select(); 这个是直接选中所有的，效果和上面一样
  try {
    var flag = document.execCommand("copy")//执行复制
  } catch (eo) {
    var flag = false
  }
  document.body.removeChild(textarea)//删除元素
  currentFocus.focus() //恢复焦点
  return flag
}

/**
 * 匹配传入字符所在传入对象中对应的代码
 * @param {string} query -s 命令后跟的参数
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
  return [result && result.code, result]
}

/**
 * 切换模式
 */
function modeChange() {
  isCommandMode = !isCommandMode
  const result = lookup(to, languages)
  if (isCommandMode) target.innerText = '命令模式 输入-退出'
  else tipTextChange(isAutoMode ? '自动' : `${to}[${result.name}]`)
  input.value = ''
  dstChange('切换成功', 'white')
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
 * 记录
 * @param {string} str input 输入框的值
 * @param {object} obj 存储目标对象
 * @param {string} dst dst 区域的值
 */
function addHistory(str, obj, dst) {
  const isRepeat = obj.arr.indexOf(str)
  isRepeat !== -1 && obj.arr.splice(isRepeat, 1)
  obj.arr.unshift(str)
  if (dst) {
    isRepeat !== -1 && obj.dstText.splice(isRepeat, 1)
    obj.dstText.unshift(dst)
  }
}

/**
 * 读取记录
 * @param {object} obj 读取目标对象
 * @param {boolean} judge 读取方向
 */
function readHistory(obj, judge) {
  if (judge) obj.currentLocation < obj.arr.length - 1 && obj.currentLocation++
  else obj.currentLocation > 0 && obj.currentLocation--
  obj.currentLocation >= 0 && (input.value = obj.arr[obj.currentLocation])
  obj.dstText[obj.currentLocation] && dstChange(obj.dstText[obj.currentLocation], 'white')
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
 * @param {string} translateLanguages 翻译目标语种
 * @param {string} ocrLanguages ocr目标语种
 * @param {boolean} isCommandMode 是否显示命令模式的提示
 */
function tipTextChange(translateLanguages = '自动', ocrLanguages = '自动检测', isCommandMode = false) {
  target.innerText = `目标语言: ${translateLanguages} ocr语言: ${ocrLanguages} ${isCommandMode ? '<- 命令模式 ->' : ''}`
}

const input = document.querySelector('input')
const target = document.querySelector('.target')
const dst = document.querySelector('.dst')
const show = document.querySelector('.show')
const languagesHtml = document.querySelector('.languages')
const help = document.querySelector('.help')
const commandHtml = document.querySelector('.command')
const container = document.querySelector('.left')

/* 
  api所需参数
*/

const appid = '替换为你的APPID' // ！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
const key = '替换为你的秘钥' // ！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
if (appid === '替换为你的APPID' || key === '替换为你的秘钥') {
  target.innerText = '无法使用!'
  target.style.color = 'red'
  dst.innerText = '请替换为你自己的AppId和秘钥!\n请替换为你自己的AppId和秘钥!\n请替换为你自己的AppId和秘钥!'
  dst.style.color = 'red'
}
let salt = 123
// (new Date).getTime()
let from = 'auto'
let to = 'zh'
let query = ''
// 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
let str1 = ''
let sign = ''

let isAutoMode = true // 判断当前是否为自动模式
let isCommandMode = false // 判断当前是否为命令模式

/* 
  语种 错误码 命令
*/

const languages = [{ name: '中文', code: 'zh', alias: ['china', '中国', '新加坡', '汉语'] }, { name: '英语', code: 'en', alias: ['english', '大不列颠共和国', '英国', '美国', '大不列颠', '日不落帝国', '日不落'] }, { name: '粤语', code: 'yue', alias: ['广东'] }, { name: '文言文', code: 'wyw', alias: ['古汉语'] }, { name: '繁体中文', code: 'cht', alias: ['繁体', '台湾'] }, { name: '日语', code: 'jp', alias: ['日本', '樱花', '小日子'] }, { name: '韩语', code: 'kor', alias: ['韩国'] }, { name: '法语', code: 'fra', alias: ['法国'] }, { name: '西班牙语', code: 'spa', alias: ['西班牙'] }, { name: '泰语', code: 'th', alias: ['泰国'] }, { name: '阿拉伯语', code: 'ara', alias: ['阿拉伯'] }, { name: '俄语', code: 'ru', alias: ['俄罗斯', '俄国'] }, { name: '葡萄牙语', code: 'pt', alias: ['葡萄牙'] }, { name: '德语', code: 'de', alias: ['德国'] }, { name: '意大利语', code: 'it', alias: ['意大利'] }, { name: '希腊语', code: 'el', alias: ['希腊'] }, { name: '荷兰语', code: 'nl', alias: ['荷兰'] }, { name: '波兰语', code: 'pl', alias: ['波兰'] }, { name: '保加利亚语', code: 'bul', alias: ['保加利亚'] }, { name: '爱沙尼亚语', code: 'est', alias: ['爱沙尼亚'] }, { name: '丹麦语', code: 'dan', alias: ['丹麦'] }, { name: '芬兰语', code: 'fin', alias: ['芬兰'] }, { name: '捷克语', code: 'cs', alias: ['捷克'] }, { name: '罗马尼亚语', code: 'rom', alias: ['罗马尼亚'] }, { name: '斯洛文尼亚语', code: 'slo', alias: ['斯洛文尼亚'] }, { name: '瑞典语', code: 'swe', alias: ['瑞典'] }, { name: '匈牙利语', code: 'hu', alias: ['匈牙利'] }, { name: '越南语', code: 'vie', alias: ['越南'] }, { name:  `自动`, code: 'auto', alias: ['智能'] }]
const errorCode = [{ code: '52001', meaning: '请求超时', resolvent: '请重试' }, { code: '52002', meaning: '系统错误', resolvent: '请重试' }, { code: '52003', meaning: '未授权用户', resolvent: '请检查appid是否正确或者服务是否开通' }, { code: '54000', meaning: '必填参数为空', resolvent: '请检查是否少传参数' }, { code: '54001', meaning: '签名错误', resolvent: '请检查您的签名生成方法' }, { code: '54003', meaning: '访问频率受限', resolvent: '请降低您的调用频率，或进行身份认证后切换为高级版/尊享版 ' }, { code: '54004', meaning: '账户余额不足', resolvent: '请前往管理控制台为账户充值' }, { code: '54005', meaning: '长文本请求频繁', resolvent: '请降低长文本的发送频率，3s后再试' }, { code: '58000', meaning: '客户端IP非法', resolvent: '检查个人资料里填写的IP地址是否正确，可前往开发者信息-基本信息修改 ' }, { code: '58001', meaning: '译文语言方向不支持', resolvent: '检查译文语言是否在语言列表里' }, { code: '58002', meaning: '服务当前已关闭', resolvent: '请前往管理控制台开启服务' }, { code: '90107', meaning: '认证未通过或未生效', resolvent: '请前往我的认证查看认证进度' }]
const command = [
  {
    code: ['-help', '-h'],
    parameter: ['所有命令'],
    suffix: [],
    usageMethod: '查看所有命令',
    fn ([commands, parameter, suffix]) {
      if (suffix && suffix !== 0) return dstChange('执行失败\n该命令不支持后缀')
      if (parameter) {
        parameter[0] !== '-' && (parameter = '-' + parameter)
        let html
        command.forEach(value => {
          if (value.code.indexOf(parameter) + 1) {
            html = `<span>${parameter}${value.parameter[0] ? ' [参数]' : ''}${value.suffix[0] ? '[后缀]' : ''}</span>
                    <ul>
                      <li><span>命令</span><span>${value.code.join(' ')}</span></li>
                      ${value.parameter[0] ? `<li><span>支持参数</span><span>${value.parameter.join(' ')}</span></li>` : ''}
                      ${value.suffix[0] ? `<li><span>支持后缀</span><span>${value.suffix.join(' ')}</span></li>` : ''}
                      <li><span>作用</span><span>${value.usageMethod}</span></li>
                    </ul>`
            addChild(html, container)
          }
        })
        if (!html)  dstChange(`执行失败\n未找到命令：${parameter}`)
      } else {
        help.style.display = 'block'
        input.value = ''
        dstChange("使用 -clear 或 -c 隐藏\n所有命令均以 - 开头", 'white')
      }
    }
  },
  {
    code: ['-s'],
    parameter: ['所有语种代码以及别称'],
    suffix: [],
    usageMethod: '-s 切换到自动模式\n\n-s [语种代码] 切换到指定语种',
    fn ([command, parameter, suffix]) {
      if (suffix && suffix !== 0) return dstChange('执行失败\n该命令不支持后缀')
      if (parameter) {
        dstChange('正在切换中', 'white')
        const tmpTo = handleLanguages(parameter)
        ajax('苹果', tmpTo).then(res => {
          if (res.trans_result) {
            let result = lookup(tmpTo, languages)
            to = tmpTo
            dstChange(`切换成功`, 'white')
            target.innerText = `目标语言: ${result.code}[${result.name}]`
            input.value = ''
            isAutoMode = false
          } else {
            dstChange(`切换失败 \n未从支持的语种库中找到目标语种: ${tmpTo}`)
          }
        })
      } else {
        isAutoMode = true
        target.innerText = `目标语言: 自动`
        input.value = ''
        dstChange(`已恢复为自动`, 'white')
      }
    }
  },
  {
    code: ['-show'],
    parameter: ['所有语种代码以及别称'],
    suffix: [],
    usageMethod: '查看各个语种以及对应代码',
    fn ([command, parameter, suffix]) {
      if (suffix && suffix !== 0) return dstChange('执行失败\n该命令不支持后缀')
      if (parameter) {
        const result = lookup(handleLanguages(parameter), languages)
        if (result) {
          let html = `<span>${parameter}</span>
                    <ul>
                      <li><span>语种</span><span>${result.name}</span></li>
                      <li><span>代码</span><span>${result.code}</span></li>
                      <li><span>别名</span><span>${result.alias.join(' ')}</span></li>
                    </ul>`
          addChild(html, container)
        } else return dstChange(`执行失败\n未从支持语种中找语种: ${parameter}`)
      } else {
        show.style.display = 'block'
        input.value = ''
      }
      dstChange("使用'-clear'或'-c'隐藏", 'white')
    }
  },
  {
    code: ['-clear', '-c'],
    parameter: [],
    suffix: [],
    usageMethod: '清除已显示的提示信息',
    fn ([command, parameter, suffix]) {
      if (parameter && parameter !== 0) return dstChange('执行失败\n该命令不支持参数')
      show.style.display = 'none'
      help.style.display = 'none'
      container.innerHTML = ''
      input.value = ''
      dstChange('按下回车键翻译或执行命令 \r使用 -hlep 查看所有命令', 'white')
    }
  },
  {
    code: ['-open', '-o'],
    parameter: ['fanyi', 'f', 'typing', 't'],
    suffix: ['-'],
    url: ['https://fanyi.baidu.com/?aldtype=16047#auto/zh', 'https://fanyi.baidu.com/?aldtype=16047#auto/zh', '../typing/index.html', '../typing/index.html'],
    usageMethod: '跳转至目标网页',
    fn ([command, parameter, suffix]) {
      if (parameter) {
        let url = this.url[this.parameter.indexOf(parameter)]
        if (!url) return dstChange(`执行失败\n命令 ${command} 中不支持参数：${parameter}`)
        if (this.suffix.indexOf(suffix) + 1) window.location.href = url
        else if (suffix !== '') dstChange(`执行失败\n命令 ${command} 中，不支持后缀：${suffix}`)
        else window.open(url)
      } else window.open('https://fanyi.baidu.com/?aldtype=16047#auto/zh')
    }
  },
  {
    code: ['-'],
    parameter: [],
    suffix: [],
    usageMethod: '切换命令模式和翻译模式',
    fn ([command, parameter, suffix]) {
      if (parameter && parameter !== 0) return dstChange('执行失败\n该命令不支持参数')
      modeChange()
    }
  }]
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
  clearSubscript () {
    this.translate.currentLocation = -1
    this.command.currentLocation = -1
  },
  clearHistory (sign) {
    if (sign) {
      this[sign].arr = []
    } else {
      for (const key in this) {
        this[key].arr = []
      }
    }
  }
}
languages.forEach( v => {
  let div = document.createElement('div')
  div.innerHTML = `${v.code}<span>${v.name}</span>`
  languagesHtml.appendChild(div)
})
command.forEach( v => {
  let div = document.createElement('div')
  div.innerHTML = `${v.code.join(' 或 ')}<span>${v.usageMethod}</span>`
  commandHtml.appendChild(div)
})

/* 
  逻辑主体
*/

input.focus() // 打开网页时自动聚焦
window.oncontextmenu = () => false // 禁用鼠标右键
dst.addEventListener('mouseup', e => e.stopPropagation()) // 阻止鼠标在结果区域时的事件冒泡
addEventListener('mousedown', e => e.button === 2 ? copyText(dst.innerText) : false) // 鼠标按下右键 将翻译结果复制到剪切板
addEventListener('mouseup', e => {
  input.focus() // 鼠标点击自动聚焦
  e.button === 1 && (input.value = '') // 鼠标点击中键 将输入框清空
})
addEventListener('keyup', e => {
  if (e.key === 'Enter') {
    query = input.value.replace(/^\s*|\s*$/g,"") // 去除输入文本前后的空格
    if (isCommandMode) query = query[0] === '-' ? query : '-' + query // 命令模式下自动给字符串首字母新增字符 -
    if (query === '') return dstChange('内容不能为空')
    history.clearSubscript() // 重置历史记录下标位置
    if (isCommandMode || query[0] === '-') { // 执行命令
      addHistory(query, history.command) // 记录
      const strArr = query.split(/\s+/) // 以 命令 参数 后缀 分割字符串
      if (strArr.length > 3) return dstChange('执行失败\n命令格式错误！\n请使用以下格式：-[命令] [参数] [后缀]')
      for (let i = 0, n = command.length; i < n; i++) {
        if (command[i].code.indexOf(strArr[0]) !== -1) return command[i].fn(strArr)
      }
      dstChange(`执行失败 \n命令不存在: ${query} \n输入-h查看所有命令`)
    } else { // 翻译
      if(isAutoMode) to = /.*[\u4e00-\u9fa5]+.*$/.test(query) ? 'en' : 'zh' // 判断输入文本是否含有中文
      dstChange('正在翻译中', 'white')
      ajax(query, to).then(res => { // 翻译并处理翻译结果
        let dst = '翻译失败，请按下回车键重新翻译'
        if (res.trans_result) {
          dst = res.trans_result[0].dst
          dstChange(dst, 'white')
        } else {
          let result = lookup(res.error_code, errorCode)
          dstChange(
            `翻译失败
            错误码: ${result.code}
            ${result.meaning}
            解决方法:  ${result.resolvent}`
            )
          }
        addHistory(query, history.translate, dst)
      })
    }
  } else if (e.key === 'Escape') {
    input.value = ''
    input.focus()
  } else if (e.key === 'ArrowUp') {
    if (e.ctrlKey || isCommandMode) readHistory(history.command, true)
    else readHistory(history.translate, true)
  } else if (e.key === 'ArrowDown') {
    if (e.ctrlKey || isCommandMode) readHistory(history.command, false)
    else readHistory(history.translate, false)
  } else if (e.key === ' ') {
    if (e.ctrlKey) modeChange()
  }
})

/*
  回调函数
*/

// 发送ajax请求
function ajax (query, to) {
  str1 = appid + query + salt + key
  sign = MD5(str1)
  return new Promise((res, rel) => {
    $.ajax({
      url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
      type: 'get',
      dataType: 'jsonp',
      timeout: 5000,
      data: {
        q: query,
        appid: appid,
        salt: salt,
        from: from,
        to: to,
        sign: sign
      },
      success(data) {
        res(data)
      },
      error(data, exception) {
        if (exception === 'timeout') {
          dstChange(`请求超时，请检查您的网络连接`)
        }
      }
    })
  })
}

// 匹配代码所对应的对象
function lookup (data, arr) {
  let result = false
  arr.forEach(v => result = v.code === data ? v : result)
  return result
}
// document.execCommand
// 将传入的字符串复制到剪切板
function copyText (text) {
  let textarea = document.createElement("input")//创建input元素
  const currentFocus = document.activeElement//当前获得焦点的元素，保存一下
  document.body.appendChild(textarea)//添加元素
  textarea.value = text
  textarea.focus()
  textarea.setSelectionRange(0, textarea.value.length)//获取光标起始位置到结束位置
  //textarea.select(); 这个是直接选中所有的，效果和上面一样
  try {
    var flag = document.execCommand("copy")//执行复制
  } catch(eo) {
    var flag = false
  }
  document.body.removeChild(textarea)//删除元素
  currentFocus.focus() //恢复焦点
  return flag
}

// 匹配 -s 命令后跟的参数
function handleLanguages (str) {
  for (let i = 0; i < languages.length; i++) {
    const language = languages[i]
    if (str === language.code || str === language.name) return language.code
    const matchedAlias = language.alias.some(alias => alias === str)
    if (matchedAlias) return language.code
  }
  return str
}

// 切换模式
function modeChange () {
  isCommandMode = !isCommandMode
  const result = lookup(to, languages)
  target.innerText = isCommandMode ? '命令模式 输入-退出' : `目标语言: ${isAutoMode ? '自动' : `${to}[${result.name}]`}`
  input.value = ''
  dstChange('切换成功', 'white')
}

// 创建并新增子节点
function addChild (html, dom) {
  const div = document.createElement('div')
  div.innerHTML = html
  dom.appendChild(div)
  input.value = ''
}

// 结果显示区域的文本以及样式切换
function dstChange (text = 'error', color = 'red') {
  dst.style.color = color
  dst.innerText = text
}

// 记录
function addHistory (str, obj, dst) {
  const isRepeat = obj.arr.indexOf(str)
  isRepeat !== -1 && obj.arr.splice(isRepeat, 1)
  obj.arr.unshift(str)
  if (dst) {
    isRepeat !== -1 && obj.dstText.splice(isRepeat, 1)
    obj.dstText.unshift(dst)
  }
}

// 读取记录
function readHistory (obj, judge) {
  if (judge) obj.currentLocation < obj.arr.length - 1 && obj.currentLocation++
  else obj.currentLocation > 0 && obj.currentLocation--
  obj.currentLocation >= 0 && (input.value = obj.arr[obj.currentLocation])
  obj.dstText[obj.currentLocation] && dstChange(obj.dstText[obj.currentLocation], 'white')
}
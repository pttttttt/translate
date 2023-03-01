const input = document.querySelector('input')
const target = document.querySelector('.target')
const dst = document.querySelector('.dst')
const show = document.querySelector('.show')
const languagesHtml = document.querySelector('.languages')
const help = document.querySelector('.help')
const commandHtml = document.querySelector('.command')
/* 
    api所需参数
*/
const appid = '替换为你的APPID'; // ！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
const key = '替换为你的秘钥'; // ！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
if (appid === '替换为你的APPID' || key === '替换为你的秘钥') {
    target.innerText = '无法使用!'
    target.style.color = 'red'
    dst.innerText = '请替换为你自己的AppId和秘钥!\n请替换为你自己的AppId和秘钥!\n请替换为你自己的AppId和秘钥!'
    dst.style.color = 'red'
}
let salt = (new Date).getTime();
let from = 'auto';
let to = 'zh';
let query = ''
// 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
let str1 = ''
let sign = ''
let judgeSwitch = true
/* 
    语种 错误码 命令
*/
let languages = [{
        name: '中文',
        code: 'zh'
    }, {
        name: '英语',
        code: 'en'
    }, {
        name: '粤语',
        code: 'yue'
    }, {
        name: '文言文',
        code: 'wyw'
    }, {
        name: '繁体中文',
        code: 'cht'
    }, {
        name: '日语',
        code: 'jp'
    }, {
        name: '韩语',
        code: 'kor'
    }, {
        name: '法语',
        code: 'fra'
    }, {
        name: '西班牙语',
        code: 'spa'
    }, {
        name: '泰语',
        code: 'th'
    }, {
        name: '阿拉伯语',
        code: 'ara'
    }, {
        name: '俄语',
        code: 'ru'
    }, {
        name: '葡萄牙语',
        code: 'pt'
    }, {
        name: '德语',
        code: 'de'
    }, {
        name: '意大利语',
        code: 'it'
    }, {
        name: '希腊语',
        code: 'el'
    }, {
        name: '荷兰语',
        code: 'nl'
    }, {
        name: '波兰语',
        code: 'pl'
    }, {
        name: '保加利亚语',
        code: 'bul'
    }, {
        name: '爱沙尼亚语',
        code: 'est'
    }, {
        name: '丹麦语',
        code: 'dan'
    }, {
        name: '芬兰语',
        code: 'fin'
    }, {
        name: '捷克语',
        code: 'cs'
    }, {
        name: '罗马尼亚语',
        code: 'rom'
    }, {
        name: '斯洛文尼亚语',
        code: 'slo'
    }, {
        name: '瑞典语',
        code: 'swe'
    }, {
        name: '匈牙利语',
        code: 'hu'
    }, {
        name: '越南语',
        code: 'vie'
    }, {
        name:  `[请使用'-s'切换]自动检测`,
        code: 'auto'
    }]
let errorCode = [{
        code: '52001',
        meaning: '请求超时',
        resolvent: '请重试'
    }, {
        code: '52002',
        meaning: '系统错误',
        resolvent: '请重试'
    }, {
        code: '52003',
        meaning: '未授权用户',
        resolvent: '请检查appid是否正确或者服务是否开通'
    }, {
        code: '54000',
        meaning: '必填参数为空',
        resolvent: '请检查是否少传参数'
    }, {
        code: '54001',
        meaning: '签名错误',
        resolvent: '请检查您的签名生成方法'
    }, {
        code: '54003',
        meaning: '访问频率受限',
        resolvent: '请降低您的调用频率，或进行身份认证后切换为高级版/尊享版 '
    }, {
        code: '54004',
        meaning: '账户余额不足',
        resolvent: '请前往管理控制台为账户充值'
    }, {
        code: '54005',
        meaning: '长文本请求频繁',
        resolvent: '请降低长文本的发送频率，3s后再试'
    }, {
        code: '58000',
        meaning: '客户端IP非法',
        resolvent: '检查个人资料里填写的IP地址是否正确，可前往开发者信息-基本信息修改 '
    }, {
        code: '58001',
        meaning: '译文语言方向不支持',
        resolvent: '检查译文语言是否在语言列表里'
    }, {
        code: '58002',
        meaning: '服务当前已关闭',
        resolvent: '请前往管理控制台开启服务'
    }, {
        code: '90107',
        meaning: '认证未通过或未生效',
        resolvent: '请前往我的认证查看认证进度'
    }]
let command = [{
    code: '-help',
    usageMethod: '查看所有命令\n简写 -h'
}, {
    code: '-s',
    usageMethod: '-s 切换到自动模式\n\n-s [语种代码] 切换到指定语种'
}, {
    code: '-show',
    usageMethod: '查看各个语种以及对应代码'
}, {
    code: '-clear',
    usageMethod: '清除已显示的提示表格\n简写 -c'
}, {
    code: '-typing',
    usageMethod: '切换网页至\'typing\'\n简写 -t'
}]
languages.forEach( v => {
    let div = document.createElement('div')
    div.innerHTML = `${v.code}<span>${v.name}</span>`
    languagesHtml.appendChild(div)
})
command.forEach( v => {
    let div = document.createElement('div')
    div.innerHTML = `${v.code}<span>${v.usageMethod}</span>`
    commandHtml.appendChild(div)
})
/* 
    逻辑主体
*/
// 打开网页时自动聚焦
input.focus()
// 禁用鼠标右键
window.oncontextmenu = () => {
    return false
}
// 阻止鼠标在结果区域时的事件冒泡
dst.addEventListener('mouseup', e => e.stopPropagation())
// 鼠标按下右键 将翻译结果复制到剪切板
addEventListener('mousedown', e => e.button === 2 ? copyText(dst.innerText) : false)
addEventListener('mouseup', e => {
    // 鼠标点击自动聚焦
    input.focus()
    // 鼠标点击中键 将输入框清空
    e.button === 1 ? input.value = '' : ''
})
addEventListener('keyup', e => {
    if (e.key === 'Enter') {
        if (appid === '替换为你的APPID' || key === '替换为你的秘钥') {
            target.innerText = '无法使用!'
            target.style.color = 'red'
            dst.innerText = '请替换为你自己的AppId和秘钥!\n请替换为你自己的AppId和秘钥!\n请替换为你自己的AppId和秘钥!'
            dst.style.color = 'red'
            return
        }
        // 去除输入文本的空格
        query = input.value.replace(/^\s*|\s*$/g,"")
        // 匹配命令 -s 后的参数
        let languages = /(?<=^-s\s)([a-z]{3}|[a-z]{2})\b/.exec(query)
        if (languages) {
            dst.style.color = 'white'
            dst.innerText = '正在切换中'
            // 发送ajax请求以测试输入的目标语种是否存在
            Ajax(appid, salt, key, from, languages[0], '苹果', translateText)
        } else if(/^-s$/.exec(query)) { // 匹配 -s 命令
            judgeSwitch = true
            dst.style.color = 'white'
            dst.innerText = `已恢复为自动`
            target.innerText = `目标语言: 自动`
            input.value = ''
        } else if (query === '-show') { // 匹配 -show 命令
            show.style.display = 'block'
            dst.style.color = 'white'
            dst.innerText = "使用'-clear'或'-c'隐藏"
            input.value = ''
        } else if (query === '-help' || query === '-h') { // 匹配 -help 命令
            help.style.display = 'block'
            dst.style.color = 'white'
            dst.innerText = "使用 -clear 或 -c 隐藏\n所有命令均以 '-' 开头"
            input.value = ''
        } else if (query === '-c' || query === '-clear') { // 匹配 -clear 命令
            show.style.display = 'none'
            help.style.display = 'none'
            dst.style.color = 'white'
            dst.innerText = '按下回车键翻译或执行命令 \r使用 -hlep 查看所有命令'
            input.value = ''
        } else if (query === '-typing' || query === '-t') {
            window.location.href='../typing/index.html'
        } else {
            // 判断输入语种是否含有中文
            if(judgeSwitch) to = fnChina(query) ? 'en' : 'zh'
            dst.style.color = 'white'
            dst.innerText = '正在翻译中'
            // 翻译并处理翻译结果
            Ajax(appid, salt, key, from, to, query, translate)
        }
    } else if (e.key === 'Escape') {
        input.value = ''
        input.focus()
    }
})
/*
    函数区域
*/
// 发送ajax请求
function Ajax(appid, salt, key, from, tos, query, callback) {
    str1 = appid + query + salt + key;
    sign = MD5(str1);
    $.ajax({
        url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
        type: 'get',
        dataType: 'jsonp',
        data: {
            q: query,
            appid: appid,
            salt: salt,
            from: from,
            to: tos,
            sign: sign
        },
        success: function (data) {
            callback(data, tos)
            // console.log(data)
        }
    })
}
// 处理翻译结果
function translate(data, tos) {
    if (data.trans_result) {
        if (!(dst.style.color === 'white')) dst.style.color = 'white'
        dst.style.color = 'white'
        dst.innerText = data.trans_result[0].dst
        // target.innerText = `目标语言: ${tos}`
    } else {
        let result = lookup(data.error_code, errorCode)
        dst.style.color = 'red'
        dst.innerText = `翻译失败    错误码:  ${result.code}
        ${result.meaning}
        解决方法:  ${result.resolvent}`
    }
}
// 判断输入的目标语种是否能够被查找
function translateText(data, tos) {
    let result = lookup(tos, languages)
    if (data.trans_result) {
        to = tos
        dst.style.color = 'white'
        dst.innerText = `切换成功`
        target.innerText = `目标语言: ${result.code}[${result.name}]`
        input.value = ''
        judgeSwitch = false
    } else {
        dst.style.color = 'red'
        dst.innerText = `切换失败 未找到目标语种: ${tos}`
    }
}
// 判断输入是否含有中文
function fnChina(str) {
    return /.*[\u4e00-\u9fa5]+.*$/.test(str) ? true : false
}
// 匹配代码所对应的对象
function lookup(data, arr) {
    let result = {
        code: '无结果',
        name: '无结果',
        meaning: '无结果',
        resolvent: '无结果'
    }
    arr.forEach(v => result = v.code === data ? v : result)
    return result
}
// document.execCommand
// 将传入的字符串复制到剪切板
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
    } catch(eo) {
        var flag = false
    }
    document.body.removeChild(textarea)//删除元素
    currentFocus.focus() //恢复焦点
    return flag
}
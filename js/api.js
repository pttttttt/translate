/**
 * 百度翻译api
 * @param {string} query 需翻译的字符串
 * @param {string} to 目标语种代码
 * @returns promise
 */
function _translate (query, to) {
  str1 = appid + query + salt + key
  sign = MD5(str1)
  return new Promise((res, rej) => {
    ajax.jsonp('http://api.fanyi.baidu.com/api/trans/vip/translate', {
      q: query,
      appid: appid,
      salt: salt,
      from: from,
      to: to,
      sign: sign
    },
    {
      timeout: 5000
    }).then(data => {
      res(data)
    }, err => {
      dstChange(err.msg)
      rej(err)
    })
  })
}

/**
 * 百度ocr api
 * @param {object} data 需要传递的参数
 * @param {boolean} isNeedHighPrecision 是否需要高精度识别
 * @param {boolean} isNeedPosition 是否需要位置信息
 * @returns promise
 */
function _imgTextRecognition (data, isNeedHighPrecision = true, isNeedPosition = false) {
  return new Promise((res, rej) => {
    ajax.post(`https://aip.baidubce.com/rest/2.0/ocr/v1/${isNeedHighPrecision ? 'accurate' : 'general'}${isNeedPosition ? '' : '_basic'}?access_token=${token}`, data, { timeout: 5000 })
      .then(data => {
        res(data)
      }, err => {
        dstChange(err.msg)
        rej(err)
      })
  })
}

/**
 * 从本地服务上获取文件
 * @param {string} path 绝对路径
 * @param {boolean} original 是否需要原始数据 选择false的话就返回base64转码后的数据
 */
function _getFileData (path = 'C:\\Users\\86136\\Pictures\\Screenshots', original = false) {
  return new Promise((res, rej) => {
    ajax.post('http://127.0.0.1:3000/api/getFileData', JSON.stringify({ path, original }))
      .then(data => {
        res(data)
      }, err => {
        dstChange('从本地服务上获取图片数据失败,请检查本地服务是否启动')
        rej(err)
      })
  })
}

/**
 * 获取token
 * @param {string} apiKey 
 * @param {string} secretKey 
 * @returns promise
 */
function _getToken ( apiKey, secretKey) {
  return new Promise((res, rej) => {
    ajax.post('http://127.0.0.1:3000/api/getToken', JSON.stringify({ apiKey, secretKey }))
      .then(data => {
        res(data)
      }, err => {
        dstChange('从本地服务上获取token失败,请检查本地服务是否启动或者其他原因')
      })
  })
}

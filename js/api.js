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
        } else {
          dstChange('翻译失败')
          rej(data)
        }
      }
    })
  })
}

// function _updateOCRToken () {
//   console.log(`https://aip.baidubce.com/oauth/2.0/token?client_id=${apiKey}&client_secret=${secretKey}&grant_type=client_credentials`)
//   $.ajax({
//     url: `https://aip.baidubce.com/oauth/2.0/token?client_id=${apiKey}&client_secret=${secretKey}&grant_type=client_credentials`,
//     type: 'GET',
//     dataType: 'jsonp',
//     headers: {
//       'Content-Type': 'application/json',
//       Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
//     },
//     success (data) {
//       console.log(data, 1)
//     },
//     error (data) {
//       console.log(data, 2)
//     }
//   })
// }
// _updateOCRToken()

// function getToken() {
// const url = `https://aip.baidubce.com/oauth/2.0/token?client_id=${apiKey}&client_secret=${secretKey}&grant_type=client_credentials`

//   $.ajax({
//       url: url,
//       method: 'POST',
//       dataType: 'jsonp',
//       headers: {
//         'Content-Type': 'application/json',
//         Accept: 'application/json'
//       },
//       success: function(data) {
//         console.log(data.access_token)
//       },
//       error: function(error) {
//         console.error(error)
//       }
//   })
// }

// getToken()

/**
 * 百度ocr api
 * @param {object} data 需要传递的参数
 * @param {boolean} isNeedHighPrecision 是否需要高精度识别
 * @param {boolean} isNeedPosition 是否需要位置信息
 * @returns promise
 */
function _imgTextRecognition (data, isNeedHighPrecision = true, isNeedPosition = false) {
  return new Promise((res, rej) => {
    $.ajax({
      url: `https://aip.baidubce.com/rest/2.0/ocr/v1/${isNeedHighPrecision ? 'accurate' : 'general'}${isNeedPosition ? '' : '_basic'}?access_token=${token}`,
      type: 'post',
      'Content-Type': 'application/x-www-form-urlencoded',
      timeout: 5000,
      data,
      success(data) {
        res(data)
      },
      error(data, exception) {
        if (exception === 'timeout') {
          dstChange('请求超时，请检查您的网络连接')
        } else {
          dstChange('识别失败\n可能是token失效\n请输入-token命令更新token')
          rej(data)
        }
      }
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
    $.ajax({
      url: 'http://127.0.0.1:3000/api/getFileData',
      type: 'post',
      data: JSON.stringify({ path, original }),
      success (data) {
        res(JSON.parse(data))
      },
      error (data) {
        dstChange(data.msg || '从本地服务上获取数据失败, 请检查本地服务是否启动或者其他原因')
        rej(data)
      }
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
    $.ajax({
      url: 'http://127.0.0.1:3000/api/getToken',
      type: 'post',
      data: JSON.stringify({ apiKey, secretKey }),
      success (data) {
        res(JSON.parse(data))
      },
      error (data) {
        dstChange(data.msg || '从本地服务上获取token失败，请检查本地服务是否启动或者其他原因')
        rej(data)
      }
    })
  })
}

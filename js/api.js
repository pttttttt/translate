const Api = {
  api: {
    translate: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
    imgTextRecognition: 'https://aip.baidubce.com/rest/2.0/ocr/v1/',
    speechSynthesis: 'https://tsn.baidu.com/text2audio',
    getFileData: BASEPATH + 'getFileData',
    getToken: BASEPATH + 'getToken',
    getClipboardUpdate: BASEPATH + 'getClipboardUpdate',
  },
  /**
   * 百度翻译 api
   * @param {string} query 需翻译的字符串
   * @param {string} to 目标语种代码
   * @returns promise
   */
  translate(query, to) {
    const salt = new Date()
    const str1 = appid + query + salt + key
    const sign = MD5(str1)
    const tmpData = { q: query, appid, salt, from: 'auto', to, sign }
    return new Promise((res, rej) => {
      ajax.jsonp(this.api.translate, tmpData, { timeout: 2000 })
        .then(data => {
          res(data)
        }, err => {
          dstChange(err.msg)
          rej(err)
        })
    })
  },

  /**
   * 百度ocr api
   * @param {object} data 需要传递的参数
   * @param {boolean} isNeedHighPrecision 是否需要高精度识别
   * @param {boolean} isNeedPosition 是否需要位置信息
   * @returns promise
   */
  imgTextRecognition(data, isNeedHighPrecision = true, isNeedPosition = false) {
    const path = `${isNeedHighPrecision ? 'accurate' : 'general'}${isNeedPosition ? '' : '_basic'}?access_token=${tokens.ocr.value}`
    return new Promise((res, rej) => {
      ajax.post(this.api.imgTextRecognition + path, data, { timeout: 5000 })
        .then(data => {
          res(data)
        }, err => {
          dstChange(err.msg)
          rej(err)
        })
    })
  },

  /**
   * 百度语音合成 api
   * @param {string} text 需合成语音的文本
   * @returns 
   */
  speechSynthesis(text) {
    const tmpData = {
      tex: encodeURIComponent(text),
      tok: tokens.speech.value,
      cuid: 'DC-21-48-F9-44-12',
      ctp: '1',
      lan: 'zh',
      spd: '5',
      pit: '5',
      vol: '5',
      per: '0', // 度小宇=1，度小美=0，度逍遥（基础）=3，度丫丫=4
      aue: '3'
    }
    return new Promise((res, rej) => {
      ajax.post(this.api.speechSynthesis, tmpData, { timeout: 5000, dataType: 'blob' })
        .then(data => {
          if (data.type !== 'audio/mp3') {
            dstChange(`语音合成失败,尝试使用命令 ${PREFIX}token speech 更新鉴权`)
            return
          }
          res(data)
        }, err => {
          dstChange(err.msg)
        })
    })
  },
  /**
   * 从本地服务上获取文件
   * @param {string} path 绝对路径
   * @param {boolean} original 是否需要原始数据 选择false的话就返回base64转码后的数据
   */
  getFileData(path = 'C:\\Users\\86136\\Pictures\\Screenshots', original = false) {
    return new Promise((res, rej) => {
      ajax.post(this.api.getFileData, JSON.stringify({ path, original }))
        .then(data => {
          res(data)
        }, err => {
          dstChange('从本地服务上获取图片数据失败,请检查本地服务是否启动')
          rej(err)
        })
    })
  },
  /**
   * 获取token
   * @param {string} apiKey 
   * @param {string} secretKey 
   * @returns promise
   */
  getToken(apiKey, secretKey) {
    return new Promise((res, rej) => {
      ajax.post(this.api.getToken, JSON.stringify({ apiKey, secretKey }))
        .then(data => {
          res(data)
        }, err => {
          dstChange('从本地服务上获取token失败,请检查本地服务是否启动或者其他原因')
        })
    })
  },
  /**
   * 获取剪贴板变化的数据
   * @returns promise
   */
  getClipboardUpdate(errorTip = true) {
    return new Promise((res, rej) => {
      ajax.get(this.api.getClipboardUpdate)
        .then(data => {
          res(data)
        }, err => {
          if (errorTip) dstChange('剪贴板内容获取失败')
          rej(err)
        })
    })
  },
}

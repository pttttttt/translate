const ajax = {
  get (url, data, config = {}) {
    return new Promise((res, rej) => {
      http('GET', url, data, config, res, rej)
    })
  },
  post (url, data, config = {}) {
    return new Promise((res, rej) => {
      http('POST', url, data, config, res, rej)
    })
  },
  jsonp (url, data, config = {}) {
    return new Promise((res, rej) => {
      url = url + '?' + conversion(data)
      const script = document.createElement('script')
      script.src = `${url}&callback=${'callback'}`
      const timer = setTimeout(() => {
        rej({ code: 404, msg: '请求超时' })
      }, config.timeout || 10000)
      window['callback'] = data => {
        clearTimeout(timer)
        res(data)
        document.body.removeChild(script)
      }
      document.body.appendChild(script)
    })
  }
}

function http (type, url, data, config, res, rej) {
  const xhr = new XMLHttpRequest()
  xhr.open(type, url)
  xhr.responseType = config.dataType || 'json'
  if (type === 'POST') xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
  xhr.send(conversion(data))
  const timer = setTimeout(() => {
    xhr.abort()
    rej({ code: 404, msg: '请求超时'})
  }, config.timeout || 10000)
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      clearTimeout(timer)
      if (xhr.status === 200) {
        res(xhr.response)
      } else {
        console.log(xhr)
        rej({ code: 405, msg: '未知错误\n尝试检查参数是否有误\n或者使用-token命令更新鉴权'})
      }
    }
  }
}

function conversion (data) {
  if (data.constructor === Object) {
    const fd = []
    for (const key in data) {
      fd.push(`${key}=${encodeURIComponent(data[key])}`)
    }
    return fd.join('&')
  } else {
    return data
  }
}
// pkg -t node16-win-x64 api.js
const http = require('http')
const fs = require('fs')
const request = require('request')
const ncp = require('copy-paste')

const port = 3001
let cacheStr = ''

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.setHeader('Access-Control-Allow-Origin', '*')
  let data = ''
  req.on('data', chunk => {
    data += chunk
  })
  req.on('end', () => {
    const result = data && JSON.parse(data.toString())
    if (req.method === 'POST' && req.url === '/api/getFileData') {
      if (/\./.test(result.path)) {
        fs.readFile(result.path, (err, data) => {
          if (err) {
            res.statusCode = 201
            res.end(JSON.stringify({ code: 201, err, path: result.path, msg: '文件读取失败' }))
          } else {
            res.statusCode = 200
            if (!result.original) data = Buffer.from(data).toString('base64')
            res.end(JSON.stringify({ code: 200, data, path: result.path, msg: '文件读取成功' }))
          }
        })
      } else {
        try {
          let fileArr = fs.readdirSync(result.path)
          res.statusCode = 200
          res.end(JSON.stringify({ code: 200, data: fileArr, path: result.path, msg: '目录读取成功' }))
        } catch (err) {
          res.statusCode = 201
          res.end(JSON.stringify({ code: 201, err, path: result.path, msg: '目录读取失败' }))
        }
      }
    } else if (req.method === 'POST' && req.url === '/api/getToken') {
      const options = {
        'method': 'POST',
        'url': `https://aip.baidubce.com/oauth/2.0/token?client_id=${result.apiKey}&client_secret=${result.secretKey}&grant_type=client_credentials`,
        'headers': {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
      }
      request(options, function (error, response) {
        if (error) res.end(JSON.stringify(error))
        else res.end(JSON.stringify(JSON.parse(response.body).access_token))
      })
    } else if (req.method === 'GET' && req.url === '/api/getClipboardUpdate') {
      let str = ncp.paste()
      let data
      if (str.length < 512 && str.length !== 0) {
        if (str !== cacheStr) {
          // console.log('变化:' + res)
          data = {
            code: 200,
            str,
            status: 0,
            msg: '剪切板数据改变'
          }
          cacheStr = str
        } else {
          // console.log('未变化')
          data = {
            code: 200,
            str,
            status: 1,
            msg: '剪切板数据未改变'
          }
        }
      } else if (str.length >= 512) {
        // console.log('剪贴板内容过长')
          data = {
            code: 200,
            str: '',
            status: 2,
            msg: '剪贴板内容过长'
          }
      } else {
        // console.log('不是文本内容')
          data = {
            code: 200,
            str: '',
            status: 3,
            msg: '不是文本内容'
          }
      }
      res.statusCode = data.code
      res.end(JSON.stringify(data))
    } else {
      res.statusCode = 404
      res.end('Not Found')
    }
  })
})

server.listen(port, () => {
  console.log('Server is running on port ' + port)
})
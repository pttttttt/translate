const http = require('http')
const fs = require('fs')
const request = require('request')

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.setHeader('Access-Control-Allow-Origin', '*')
  let data = ''
  req.on('data', chunk => {
    data += chunk
  })
  req.on('end', () => {
    const result = JSON.parse(data.toString())
    if (req.method === 'POST' && req.url === '/api/getFileData') {
      if (/\./.test(result.path)) {
        fs.readFile(result.path, (err, data) => {
          if (err) {
            res.statusCode = 201
            res.end(JSON.stringify({ code: 201, err, path: result.path, msg: '本地服务读取二进制文件失败' }))
          } else {
            res.statusCode = 200
            if (!result.original) data = Buffer.from(data).toString('base64')
            res.end(JSON.stringify({ code: 200, data, path: result.path, msg: '读取成功' }))
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
    } else {
      res.statusCode = 404
      res.end('Not Found')
    }
  })
})

server.listen(3000, () => {
  console.log('Server is running on port 3000')
})
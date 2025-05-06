const fs = require('fs')
const path = require('path')
const http = require('http')

const hostname = '127.0.0.1'
const port = 3000;

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/') {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain')
      res.setHeader('Access-Control-Allow-Origin', '*')
      const imgPath = 'C:\\Users\\86136\\Pictures\\Screenshots'
      const files = fs.readdirSync(imgPath)
      if (files.length <= 1) {
        res.end('没有图片文件')
      } else {
        let lastImage = files.filter(function(file) {
          return file.match(/\.(jpg|jpeg|png|bmp)$/)
        }).pop()
        const imagePath = path.join(imgPath, lastImage)
        const imgOriginalFile = fs.readFileSync(imagePath)
        const imgBinaryFiles = Buffer.from(imgOriginalFile).toString('base64')
        res.end(JSON.stringify({ path: imagePath, baseFile: imgBinaryFiles, originFile: imgOriginalFile}))
      }
    } else {
      res.statusCode = 404
      res.end()
    }
  })
  
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
  })

  // 弃用
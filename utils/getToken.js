const request = require('request')
const apiKey = 'pwVtFCr7ep4KEmHkk6fQ1ru8'
const secretKey = '1HXTzFafdlqxbFZAzDXnw2l74UkgQsN0'

async function main() {
    var options = {
        'method': 'POST',
        'url': `https://aip.baidubce.com/oauth/2.0/token?client_id=${apiKey}&client_secret=${secretKey}&grant_type=client_credentials`,
        'headers': {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
        }
    }

    request(options, function (error, response) {
        if (error) throw new Error(error)
        console.log(JSON.parse(response.body).access_token)
    })
}
main()
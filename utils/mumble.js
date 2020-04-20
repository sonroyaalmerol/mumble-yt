const noodleJS = require('noodle.js')
const options = require('./yargs')

module.exports = new noodleJS({
  url: options.url.split(":")[0] || '127.0.0.1',
  port: options.url.split(":")[1] || '64738',
  name: options.name || 'YoutubeBot',
  password: options.password || ''
})
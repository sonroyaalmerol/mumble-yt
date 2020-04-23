const url = require('yt-scraper')
const search = require('scrape-youtube')
const youtubeUrl = require('youtube-url')

module.exports = async (query) => {
  var details = {}
  if(youtubeUrl.valid(query)) {
    var tmp = await url.videoInfo(query)
    details.title = tmp.title
    details.url = tmp.url
    details.duration = tmp.length
  } else {
    var tmp = await search.search(query, { limit: 1, type: 'video' })
    details.title = tmp[0].title
    details.url = tmp[0].link
    details.duration = tmp[0].duration
  }
  return details
}
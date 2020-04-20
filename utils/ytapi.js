const url = require('yt-scraper')
const search = require('scrape-youtube')
const { validateUrl } = require('youtube-validate')

module.exports = async (query) => {
  var details = {}
  try {
    await validateUrl(query)
    var tmp = await url.videoInfo(query)
    details.title = tmp.title
    details.url = tmp.url
    details.duration = tmp.length
  } catch (err) {
    var tmp = await search.search(query, { limit: 1, type: 'video' })
    details.title = tmp[0].title
    details.url = tmp[0].link
    details.duration = tmp[0].duration
  }
  return details
}
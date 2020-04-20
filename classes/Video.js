const yt = require('../utils/ytapi')
const client = require('../utils/mumble')
const youtubeStream = require('youtube-audio-stream')


class Video {
  constructor() {
    this._title = ''
    this._url = ''
    this._duration = 0
    this._currentTimer = setTimeout(() => {}, 0)
    this.vidStream = null
  }

  async init(q) {
    var api = 0
    var query = q.replace(/(<([^>]+)>)/ig,"")
    var result = await yt(query)
    this._title = result.title
    this._url = result.url
    this._duration = result.duration
    this._currentTimer = setTimeout(() => {}, 0)
  }

  async play(volume) {
    volume = volume || 1;
    const videoTimer = (duration) => new Promise((resolve, reject) => {
      this._currentTimer = setTimeout(() => {
        try {
          this.stop()
          resolve()
        } catch (err) {
          reject(err)
        }
      }, ((duration)*1000)-200)
    })

    this.vidStream = youtubeStream(this._url)
    client.voiceConnection.playStream(this.vidStream)
    client.sendMessage(`Now playing: ${this._title}`)

    client.voiceConnection.setVolume(volume)
    await videoTimer(this._duration)
  }

  stop() {
    this.vidStream.end()
    client.voiceConnection.stopStream()
    clearTimeout(this._currentTimer)
  }

  clearDuration() {
    clearTimeout(this._currentTimer)
  }

  get title() {
    return this._title
  }

  get url() {
    return this._url
  }

  get duration() {
    return this._duration
  }

  get timer() {
    return this._currentTimer
  }
}

module.exports = Video
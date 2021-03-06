const yt = require('../utils/ytapi')
const client = require('../utils/mumble')
const youtubeStream = require('youtube-audio-stream')


class Video {
  constructor() {
    this._title = ''
    this._url = ''
    this._duration = 0
    this._currentTimer = null
    this.vidStream = null
  }

  set({ title, url, duration }) {
    this._title = title
    this._url = url
    this._duration = duration
    this._currentTimer = null
  }

  async init(q) {
    var query = q.replace(/(<([^>]+)>)/ig,"")
    var result = await yt(query)
    this._title = result.title
    this._url = result.url
    this._duration = result.duration
    this._currentTimer = null
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
    try {

      this.vidStream = youtubeStream(this._url)
      client.voiceConnection.playStream(this.vidStream)
      client.sendMessage(`Now playing: ${this._title}`)

      client.voiceConnection.setVolume(volume)
      await videoTimer(this._duration)

    } catch (err) {
      client.sendMessage(`Error occurred while playing: ${this._title}`)
      this.stop()
    }
  }

  stop() {
    if (this.vidStream != null) {
      this.vidStream.end()
      client.voiceConnection.stopStream()
      this.clearDuration()
      this.vidStream = null
    }
  }

  clearDuration() {
    clearTimeout(this._currentTimer)
    this._currentTimer = null
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
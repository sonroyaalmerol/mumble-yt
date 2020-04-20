const client = require('../utils/mumble')

class Player {
  constructor() {
    this.videos = []
    this.currentPlaying = 0
    this._volume = 1
    this.loop = 2 // 0 for no loop, 1 for loop 1 song, 2 for loop queue
  }

  add(video) {
    client.sendMessage(`Adding ${ video.title } to queue.`)
    if (this.videos.length === 0) {
      this.videos.push(video)
      video.play(this._volume).then(() => {
        this.next()
      })
    } else {
      this.videos.push(video)
    }
  }

  stop() {
    client.voiceConnection.stopStream()
    this.videos = []
    this.currentPlaying = 0
  }

  remove(x) {
    var index = x-1
    client.sendMessage(`Removing ${this.videos[index].title} from queue.`)
    this.videos.splice(index, 1)
  }

  list() {
    if(this.videos.length > 0) {
      client.sendMessage(`Queue list (Now playing #${this.currentPlaying+1}):`)
    } else {
      client.sendMessage(`Nothing in queue yet.`)
    }
    var number = 1
    this.videos.forEach(video => {
      client.sendMessage(`${number}.) ${video.title}`)
      number++
    })
  }

  next() {
    this.videos[this.currentPlaying].stop()
    this.currentPlaying++
    if (this.currentPlaying >= this.videos.length && this.loop === 2) {
      this.currentPlaying = 0
    } else if (this.currentPlaying >= this.videos.length && this.loop === 1) {
      this.currentPlaying--
    } else if (this.currentPlaying >= this.videos.length && this.loop === 0) {
      this.videos = []
      this.currentPlaying = 0
    }
    if(this.videos.length > 0) {
      this.videos[this.currentPlaying].play(this._volume).then(() => {
        this.next()
      })
    }
  }

  setVolume(vol) {
    this._volume = vol/100
    client.voiceConnection.setVolume(this._volume)
  }

  hasVideos() {
    return this.videos.length > 0
  }

  get volume() {
    return this._volume
  }

  get currentVideo() {
    return this.videos[this.currentPlaying]
  }
  
}

module.exports = Player
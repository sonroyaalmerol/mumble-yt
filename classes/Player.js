const client = require('../utils/mumble')
const Database = require('./Database')
const Video = require('./Video')

class Player {
  constructor() {
    this.videos = []
    this.currentPlaying = 0
    this._volume = 1
    this.loop = 2 // 0 for no loop, 1 for loop 1 song, 2 for loop queue
    this._database = new Database()
    this._rev = null
    this.playing = false
  }

  add(video) {
    client.sendMessage(`Adding ${ video.title } to queue.`)
    if (this.videos.length === 0) {
      this.videos.push(video)
      this.playing = true
      video.play(this._volume).then(() => {
        this.next()
      }).catch(() => {
        this.playing = false
      })
    } else {
      this.videos.push(video)
    }
  }

  stop() {
    if (this.videos.length > 0) {
      this.videos[this.currentPlaying].stop()
    }
    this.playing = false
    this.videos = []
    this.currentPlaying = 0
  }

  remove(x) {
    var index = x-1
    if (this.videos[index]) {
      client.sendMessage(`Removing ${this.videos[index].title} from queue.`)
      this.videos.splice(index, 1)
    } else {
      client.sendMessage(`There is nothing in queue #${x}.`)
    }
  }

  list() {
    var toPrint = ''
    if(this.videos.length > 0) {
      toPrint = `Queue list (Now playing #${this.currentPlaying+1}):<br />`
    } else {
      client.sendMessage(`Nothing in queue yet.`)
    }
    var number = 1
    this.videos.forEach(video => {
      toPrint = toPrint + `${number}.) ${video.title}<br />`
      number++
    })
    client.sendMessage(toPrint)
  }

  next() {
    if(this.videos.length > 0) {
      this.videos[this.currentPlaying].stop()
      this.playing = false
      this.currentPlaying++
      if (this.currentPlaying >= this.videos.length && this.loop === 2) {
        this.currentPlaying = 0
      } else if (this.currentPlaying >= this.videos.length && this.loop === 1) {
        this.currentPlaying--
      } else if (this.currentPlaying >= this.videos.length && this.loop === 0) {
        this.videos = []
        this.currentPlaying = 0
      }
      this.playing = true
      this.videos[this.currentPlaying].play(this._volume).then(() => {
        this.next()
      }).catch(() => {
        this.playing = false
      })
    } else {
      client.sendMessage(`Nothing in queue yet.`)
    }
  }

  setVolume(vol) {
    this._volume = vol/100
    client.voiceConnection.setVolume(this._volume)
  }

  setLoop(loop) {
    if (loop < 0 || loop > 2) {
      client.sendMessage(`Invalid option for loop. (0 for no loop, 1 for loop current song, 2 for loop queue)`)
    } else {
      this.loop = loop
      if (loop === 0) {
        client.sendMessage('Loop disabled.')
      } else if (loop === 1) {
        client.sendMessage('Looping current song.')
      } else {
        client.sendMessage('Looping queue.')
      }
    }
  }

  async savePlaylist(name) {
    if (this.videos.length > 0) {
      await this._database.newPlaylist(this.videos, name, this._rev)
      client.sendMessage('Saved current playlist.')
    } else {
      client.sendMessage('The queue is currently empty.')
    }
  }

  async removePlaylist(name) {
    try {
      await this._database.deletePlaylist(name)
      client.sendMessage(`Removed "${name}" playlist.`)
    } catch (err) {
      client.sendMessage(`"${name}" not found. Please use playlist name.`)
    }
  }

  async listPlaylist() {
    var number = 1
    var toprint = 'Saved playlists: <br />'
    var playlists = await this._database.getPlaylists()
    playlists.forEach((res) => {
      toprint = toprint + `${number}.) ${res._id}<br />`
      number++
    })
    client.sendMessage(toprint)
  }

  async playPlaylist(name) {
    var playlist = await this._database.getPlaylist(name)
    if (playlist) {
      
      this.stop()
      var toprint = `Now playing ${playlist._id}: <br />`

      for (var i = 0; i < playlist.playlist.length; i++) {
        var res = playlist.playlist[i]
        toprint = toprint + `${i+1}.) ${res.title}<br />`
        var vid = new Video()
        await vid.init(res.url)
        this.videos.push(vid)

        if (i === 0 && !this.playing) {
          this.playing = true
          this.videos[0].play(this._volume).then(() => {
            this.next()
          }).catch(() => {
            this.playing = false
          })
        }
      }

      this._rev = playlist._rev
      client.sendMessage(toprint)
    } else {
      client.sendMessage('Playlist does not exist!')
    }
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

  get database() {
    return this._database
  }
  
}

module.exports = Player
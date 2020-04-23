const PouchDB = require('pouchdb')

class Database {
  constructor() {
    this.db = new PouchDB('mumble-yt')
  }

  async getPlaylists() {
    var result = await this.db.allDocs({include_docs: true})
    return result.rows.map((item) => {
      return item.doc
    })
  }

  async getPlaylist(name) {
    try {
      return await this.db.get(name)
    } catch (err) {
      return null
    }
  }

  async newPlaylist(rawPlaylist, name, _rev) {
    var playlist = []
    rawPlaylist.forEach(video => {
      playlist.push({
        url: video.url,
        title: video.title
      })
    })
    try {
      return await this.db.post({
        _id: name,
        playlist
      })
    } catch (err) {
      return await this.db.put({
        _id: name,
        playlist,
        _rev
      })
    }
  }

  async deletePlaylist(name) {
    var playlist = await this.db.get(name)
    return await this.db.remove(playlist)
  }

  async editPlaylist(playlist) {
    return await this.db.put(playlist)
  }
}

module.exports = Database
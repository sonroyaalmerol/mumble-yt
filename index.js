#!/usr/bin/env node

require('./utils/yargs')

const client = require('./utils/mumble')
const Player = require('./classes/Player')
const Video = require('./classes/Video')
const player = new Player()

const reconnect = () => {
  if (player.hasVideos()) {
    player.currentVideo.stop()
  }
  client.destroy()
  client.connect()
  if (player.hasVideos()) {
    player.next()
  }
}

client.on('message', async message => {
  if (message.content.startsWith('.play ') || message.content.startsWith('.p ')) {
    var vid = new Video()
    try {
      await vid.init(message.content.substr(message.content.indexOf(' ')+1))
      player.add(vid)
    } catch (err) {
      console.log(err)
      message.reply(err)
    }

  } else if (message.content === '.stop') {
    player.stop()

  } else if (message.content === '.skip') {
    player.next()

  } else if (message.content === '.queue') {
    player.list()

  } else if (message.content.startsWith('.remove ')) {
    player.remove(parseInt(message.content.substr(message.content.indexOf(' ')+1)))

  } else if (message.content.startsWith('.volume ')) {
    player.setVolume(parseFloat(message.content.substr(message.content.indexOf(' ')+1)))
  
  } else if (message.content.startsWith('.loop ')) {
    player.setLoop(parseInt(message.content.substr(message.content.indexOf(' ')+1)))
  
  } else if (message.content.startsWith('.plsave ')) {
    player.savePlaylist(message.content.substr(message.content.indexOf(' ')+1))
  
  } else if (message.content.startsWith('.plremove ')) {
    player.removePlaylist(message.content.substr(message.content.indexOf(' ')+1))
  
  } else if (message.content === '.pl') {
    player.listPlaylist()
  
  } else if (message.content.startsWith('.pl ')) {
    player.playPlaylist(message.content.substr(message.content.indexOf(' ')+1))
  
  } else if (message.content === '.help') {
    message.reply('List of commands: ')
    message.reply('.play <yt url/keywords> | .stop | .skip | .queue | .remove <number from queue> | .volume <0-100> | .loop <0,1,2>')
    message.reply('.pl | .pl <playlist name> | .plsave <playlist name> | .plremove <playlist name>')
  }
})

client.voiceConnection.on('error', error => {
  client.sendMessage.reply('Voice Connection error:')
  client.sendMessage.reply(error)
  player.savePlaylist('pre-error')
  console.log(error)
  reconnect()
})

client.on('error', error => {
  client.sendMessage.reply('Mumble error:')
  client.sendMessage.reply(error)
  player.savePlaylist('pre-error')
  console.log(error)
  reconnect()
})

client.connect()
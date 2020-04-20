#!/usr/bin/env node

const yargs = require("yargs")

const options = yargs
 .usage("Usage: -u <url> -n <name> -p <password>")
 .option("u", { alias: "url", describe: "Mumble Server URL with Port", type: "string", demandOption: true })
 .option("n", { alias: "name", describe: "Bot Username", type: "string", demandOption: true })
 .option("p", { alias: "password", describe: "Bot Password", type: "string", demandOption: false })
 .argv

const client = require('./utils/mumble')(options)
const Player = require('./classes/Player')
const Video = require('./classes/Video')
const player = new Player()

const reconnect = () => {
  if (player.hasVideos()) {
    player.currentVideo.clearDuration()
  }
  client.destroy()
  setTimeout(() => {
    client.connect()
    if (player.hasVideos()) {
      player.next()
    }
  }, 2000)
}

client.on('message', async message => {
  if (message.content.startsWith('.play ')) {
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
  
  } else if (message.content === '.help') {
    message.reply('List of commands: ')
    message.reply('.play <yt url/keywords> | .stop | .skip | .queue | .remove <number from queue> | .volume <0-100> | .loop <0,1,2>')
  
  }
})

client.voiceConnection.on('error', error => {
  console.log('Voice Connection error:')
  console.log(error)
  reconnect()
})

client.on('error', error => {
  console.log('Mumble error:')
  console.log(error)
  reconnect()
})

client.connect()
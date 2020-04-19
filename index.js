const noodleJS = require('noodle.js')
const { YouTube } = require('popyt')
const youtubeStream = require('youtube-audio-stream')
const { validateUrl } = require('youtube-validate')

const youtube = new YouTube('AIzaSyArBFTlqt7nt91J70adVZuf4aGz3IrC6u8')

const client = new noodleJS({
  url: '127.0.0.1',
  port: '64738',
  name: 'DemocraticMusic'
})

var queue = []
var currentPlaying = 0
var volume = 1
var currentTimer = setTimeout(() => {}, 0)

const stopTimer = (duration) => new Promise((resolve, reject) => {
  currentTimer = setTimeout(() => {
    try {
      client.voiceConnection.stopStream()
      resolve()
    } catch (err) {
      reject(err)
    }
  }, (duration+1)*1000)
})

const play = (video) => {
  const vidStream = youtubeStream(video.url)
  client.voiceConnection.playStream(vidStream)
  client.sendMessage(`Now playing: ${video.title}`)

  client.voiceConnection.setVolume(volume)

  vidStream.on('error', error => {
    console.log(error)
    client.voiceConnection.stopStream()
    nextVideo()
  })
}

const playWithDuration = (video) => {
  play(video)
  stopTimer(video.duration).then(() => {
    nextVideo()
  })
}

const addToQueue = async (q) => {
  var query = q.replace(/(<([^>]+)>)/ig,"")
  var video = { title: '', url: '', duration: 0 }
  try {
    await validateUrl(query)
    var result = await youtube.getVideo(query)
    video = { title: result.title, url: query, duration: result.seconds + (result.minutes*60) }
  } catch (err) {
    var result = await youtube.searchVideos(query, 1)
    var details = await youtube.getVideo(result.results[0].url)
    video = { title: result.results[0].title, url: result.results[0].url, duration: details.seconds + (details.minutes*60) }
  }
  console.log(video)
  client.sendMessage(`Adding ${ video.title } to queue.`)
  if (queue.length === 0) {
    queue.push(video)
    playWithDuration(video)
  } else {
    queue.push(video)
  }
}

const nextVideo = () => {
  currentPlaying++
  if (currentPlaying >= queue.length) {
    currentPlaying = 0
  }
  if(queue.length > 0) {
    playWithDuration(queue[currentPlaying])
  }
}

const printQueue = () => {
  if(queue.length > 0) {
    client.sendMessage(`Now playing (${currentPlaying+1}): ${queue[currentPlaying].title}`)
  }
  var number = 1
  queue.forEach(video => {
    client.sendMessage(`${number}.) ${video.title}`)
    number++
  })
}

const removeQueue = (x) => {
  var index = x-1
  client.sendMessage(`Removing ${queue[index].title} from queue.`)
  queue.splice(index, 1)
}

client.on('message', async message => {
  if (message.content.startsWith('.play ')) {
    addToQueue(message.content.substr(message.content.indexOf(' ')+1))
  } else if (message.content === '.stop') {
    client.voiceConnection.stopStream()
    queue = []
    currentPlaying = 0
  } else if (message.content === '.skip') {
    clearTimeout(currentTimer)
    client.voiceConnection.stopStream()
    nextVideo()
  } else if (message.content === '.queue') {
    printQueue()
  } else if (message.content.startsWith('.remove ')) {
    removeQueue(parseInt(message.content.substr(message.content.indexOf(' ')+1)))
  } else if (message.content.startsWith('.volume ')) {
    volume = parseFloat(message.content.substr(message.content.indexOf(' ')+1))/100
    client.voiceConnection.setVolume(volume)
  }
})

client.voiceConnection.on('error', error => {
  console.log(error)
})

client.on('error', error => {
  console.log(error)
})

client.connect()
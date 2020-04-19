const noodleJS = require('noodle.js')
const { YouTube } = require('popyt')
const youtubeStream = require('youtube-audio-stream')
const { validateUrl } = require('youtube-validate')

const youtube = new YouTube('AIzaSyArBFTlqt7nt91J70adVZuf4aGz3IrC6u8')

const client = new noodleJS({
  url: '18.163.117.60',
  port: '64738',
  name: 'DemocraticMusic'
})

var queue = []
var currentPlaying = 0

const play = (video) => {
  client.voiceConnection.playStream(youtubeStream(video.url))
  client.sendMessage(`Now playing: ${video.title}`)
}

const addToQueue = async (q) => {
  var query = q.replace(/(<([^>]+)>)/ig,"")
  var video = { title: '', url: '' }
  try {
    await validateUrl(query)
    var result = await youtube.getVideo(query)
    console.log(result)
    video = { title: result.title, url: query }
  } catch (err) {
    var result = await youtube.searchVideos(query, 1)
    video = { title: result.results[0].title, url: result.results[0].url }
  }
  client.sendMessage(`Adding ${ video.title } to queue.`)
  if (queue.length === 0) {
    queue.push(video)
    play(video)
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
    play(queue[currentPlaying])
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

client.voiceConnection.on('end', () => {
  nextVideo()
})

client.on('message', async message => {
  if (message.content.startsWith('.play ')) {
    addToQueue(message.content.substr(message.content.indexOf(' ')+1))
  } else if (message.content === '.stop') {
    client.voiceConnection.stopStream()
    queue = []
    currentPlaying = 0
  } else if (message.content === '.skip') {
    client.voiceConnection.stopStream()
    nextVideo()
  } else if (message.content === '.queue') {
    printQueue()
  } else if (message.content.startsWith('.remove ')) {
    removeQueue(parseInt(message.content.substr(message.content.indexOf(' ')+1)))
  }
})

client.connect()
const WebSocket = require('ws')

const client = new WebSocket('ws://localhost:8080/socket')

client.on('close', client.close).on('error', console.log)

// Initial response handler
client.on('message', m => {
  const message = JSON.parse(m)
  console.log(message)
})
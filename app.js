var express = require('express');
var logger = require('morgan');
var fs = require('fs');
var WebSocket = require('ws');

var app = express();

app.use(logger('dev'));
app.use(express.json());

var connectionkey = "e9wvmN3n2DhTU8thmB64AYNGkT5ah4sE";

var allClients = [];

const port = process.env.PORT || 8080;
const server = app.listen(port, () => console.log(`application started:${port}...`));

const findaclient = (id) => {
  for (let i = 0; i < allClients.length; i++) {
    const client = allClients[i];
    if(client.id === id) return client;
  }
};

app.get('/notifyallclients', function (req, res) {
  if(connectionkey !== req.query.key) return res.send('error');
  for (let i = 0; i < allClients.length; i++) {
    const client = allClients[i];
    // data.json is usually a large file
    fs.readFile("./data.json", 'utf8', (err, data) => {
      for (let index = 0; index < data.length; index++) {
        var e = data[index];
        client.send(JSON.stringify(e))
      }
    });
  }
  res.send('done');
});

app.get('/notifyaclient/:id', function (req, res) {
  if(connectionkey !== req.query.key) return res.send('error');
  var id = req.params.id;
  var client = findaclient(id);
  // data.json is usually a large file
  fs.readFile("./data.json", 'utf8', (err, data) => {
    for (let index = 0; index < data.length; index++) {
      var e = data[index];
      client.send(JSON.stringify(e))
    }
  });
  res.send('done');
});

app.get('/getAllClientIds', function (req, res) {
  if(connectionkey !== req.query.key) return res.send('error');
  res.send({ idx: allClients.map(c => c.id)});
});

var wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (client) => {
  client.id = Math.random().toString(36).substring(2);
  allClients.push(client);
});

server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host}`)
  const { pathname } = url;
  if (pathname === '/socket') {
    wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request);
    });
  }
});

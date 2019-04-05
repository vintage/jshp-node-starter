import express from 'express'
import fileUpload from 'express-fileupload'
import socketIO from 'socket.io'
import { client as dbClient } from './db'
import routes from './routes'

const PORT = process.env.PORT
const app = express()

app.use(express.json())
app.use(fileUpload())
app.use('/static', express.static('public'))
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html')
})

dbClient.connect(err => {
  app.use(routes)
  const server = app.listen(PORT, () => {
    console.log('Server started on port: ' + PORT)
  })

  const io = socketIO.listen(server)
  io.on('connection', socket => {
    console.log('User connected')
    socket.on('disconnect', function() {
      console.log('User disconnected')
    })
    socket.on('chat message', data => {
      io.emit('chat message', data)
    })
  })
})

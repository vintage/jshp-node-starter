import express from 'express'
import fileUpload from 'express-fileupload'
import { client as dbClient } from './db'
import routes from './routes'

const PORT = process.env.PORT
const app = express()

app.use(express.json())
app.use(fileUpload())
app.use('/static', express.static('public'))

dbClient.connect(err => {
  app.use(routes)
  const server = app.listen(PORT, () => {
    console.log('Server started on port: ' + PORT)
  })
})

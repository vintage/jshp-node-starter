import express from 'express'

const PORT = process.env.PORT
const app = express()
app.use(express.json())

app.get('/', (req, res) => res.send('Node.js has power!'))

app.listen(PORT, () => {
  console.log('Server started on port: ' + PORT)
})

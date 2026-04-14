require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000

const connectMongo = require('./src/config/mongo')
//const pool = require('./src/config/postgres')
const initDB = require('./src/config/initDB')
const decisionRoutes = require('./src/routes/decision.js');
connectMongo()
initDB()


app.use(cors({
	origin: ['http://localhost:5173', 'http://127.0.0.1:5173','http://103.195.6.119'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}))

app.use(express.json())

app.use('/api/profile', require('./src/routes/profile'))


app.use('/api/loan', require('./src/routes/loan'))
app.use('/api/decisions', decisionRoutes);
//app.use(cors())
//app.use(express.json())

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Vitto Lending API is running' })
})


// app.use('/api/profile', require('./src/routes/profile'))
// app.use('/api/loan',    require('./src/routes/loan'))
// app.use('/api/decision',require('./src/routes/decision'))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: 'Something went wrong' })
})


app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

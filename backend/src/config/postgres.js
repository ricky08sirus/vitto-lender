const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
})

const connectWithRetry = async (retries = 5, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.connect()
      console.log('PostgreSQL connected')
      return
    } catch (err) {
      console.log(`PostgreSQL not ready, retrying in ${delay / 1000}s... (${i + 1}/${retries})`)
      await new Promise(res => setTimeout(res, delay))
    }
  }
  console.error('PostgreSQL failed to connect after all retries')
}

connectWithRetry()

module.exports = pool

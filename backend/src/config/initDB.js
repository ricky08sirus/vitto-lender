const pool = require('./postgres')

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id            SERIAL PRIMARY KEY,
        owner_name    VARCHAR(100) NOT NULL,
        pan           VARCHAR(10)  NOT NULL UNIQUE,
        business_type VARCHAR(50)  NOT NULL,
        monthly_revenue NUMERIC(15,2) NOT NULL,
        created_at    TIMESTAMP DEFAULT NOW()
      );
    `)

    //loans table 
    await pool.query(`
      CREATE TABLE IF NOT EXISTS loans (
        id SERIAL PRIMARY KEY,

        business_id INTEGER NOT NULL,

        requested_amount NUMERIC(12,2) NOT NULL,
        tenure_months INTEGER NOT NULL,

        purpose VARCHAR(50) NOT NULL,

        status VARCHAR(20) DEFAULT 'pending',

        created_at TIMESTAMP DEFAULT NOW(),

        CONSTRAINT fk_business
          FOREIGN KEY (business_id)
          REFERENCES businesses(id)
          ON DELETE CASCADE
      );
    `)
    console.log('Database tables initialized')
  } catch (err) {
    console.error('Database init error:', err.message)
  }
}

module.exports = initDB



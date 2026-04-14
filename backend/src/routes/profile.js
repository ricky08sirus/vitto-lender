const express = require('express')
const router = express.Router()
const pool = require('../config/postgres')
const { body, validationResult } = require('express-validator')

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/

const validateProfile = [
  body('owner_name')
    .trim()
    .notEmpty().withMessage('Owner name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Owner name must be 2-100 characters'),

  body('pan')
    .trim()
    .notEmpty().withMessage('PAN is required')
    .toUpperCase()
    .matches(PAN_REGEX).withMessage('Invalid PAN format. Expected: ABCDE1234F'),

  body('business_type')
    .trim()
    .notEmpty().withMessage('Business type is required')
    .isIn(['retail', 'manufacturing', 'services', 'wholesale', 'agriculture'])
    .withMessage('Business type must be one of: retail, manufacturing, services, wholesale, agriculture'),

  body('monthly_revenue')
    .notEmpty().withMessage('Monthly revenue is required')
    .isFloat({ min: 1 }).withMessage('Monthly revenue must be a positive number'),
]

router.post('/', validateProfile, async (req, res) => {
  // 1. Check validation errors
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(e => ({
        field: e.path,
        message: e.msg
      }))
    })
  }

  const { owner_name, pan, business_type, monthly_revenue } = req.body


  try {
    const result = await pool.query(
      `INSERT INTO businesses (owner_name, pan, business_type, monthly_revenue)
       VALUES ($1, $2, $3, $4)
       RETURNING id, owner_name, pan, business_type, monthly_revenue, created_at`,
      [owner_name, pan.toUpperCase(), business_type, monthly_revenue]
    )

    return res.status(201).json({
      success: true,
      message: 'Business profile created successfully',
      data: result.rows[0]
    })

  } catch (err) {
    // Duplicate PAN
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        errors: [{ field: 'pan', message: 'A business with this PAN already exists' }]
      })
    }

    console.error('Profile creation error:', err.message)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM businesses ORDER BY created_at DESC'
    )

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    })

  } catch (err) {
    console.error('Fetch profiles error:', err.message)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

router.get('/:id', async (req, res) => {
  const { id } = req.params

  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID' })
  }

  try {
    const result = await pool.query(
      'SELECT * FROM businesses WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Business profile not found' })
    }

    return res.status(200).json({ success: true, data: result.rows[0] })

  } catch (err) {
    console.error('Fetch profile error:', err.message)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

module.exports = router




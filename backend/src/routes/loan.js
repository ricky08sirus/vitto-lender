const express = require("express")
const router = express.Router()

const pool = require("../config/postgres")





const validateLoan = (data) => {
  const errors = []
  if (!data.business_id) {
    errors.push({
      field: "business_id",
      message: "Business ID is required"
    })
  }

  if (!data.requested_amount) {
    errors.push({
      field: "requested_amount",
      message: "Requested amount is required"
    })
  }

  if (data.requested_amount <= 0) {
    errors.push({
      field: "requested_amount",
      message: "Requested amount must be positive"
    })
  }

  if (!data.tenure_months) {
    errors.push({
      field: "tenure_months",
      message: "Tenure is required"
    })
  }

  if (
    data.tenure_months < 1 ||
    data.tenure_months > 120
  ) {
    errors.push({
      field: "tenure_months",
      message: "Tenure must be between 1–120 months"
    })
  }

  const validPurposes = [
    "business_expansion",
    "inventory",
    "equipment",
    "working_capital",
    "personal"
  ]

  if (!data.purpose) {
    errors.push({
      field: "purpose",
      message: "Purpose is required"
    })
  }

  if (
    data.purpose &&
    !validPurposes.includes(data.purpose)
  ) {
    errors.push({
      field: "purpose",
      message: "Invalid loan purpose"
    })
  }

  return errors


}



router.post("/", async (req, res) => {

  try {

    const errors = validateLoan(req.body)

    if (errors.length > 0) {

      return res.status(400).json({
        success: false,
        errors
      })

    }

    const {
      business_id,
      requested_amount,
      tenure_months,
      purpose
    } = req.body

    const query = `
      INSERT INTO loans
      (
        business_id,
        requested_amount,
        tenure_months,
        purpose
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `

    const values = [
      business_id,
      requested_amount,
      tenure_months,
      purpose
    ]

    const result =
      await pool.query(query, values)


    res.status(201).json({

      success: true,
      message: "Loan created successfully",
      data: result.rows[0]

    })



  } catch (err) {
    console.error(err)
    res.status(500).json({

      success: false,
      message: "Internal server error"

    })

  }
})


router.get("/", async (req, res) => {

  try {

    const query = `
      SELECT *
      FROM loans
      ORDER BY created_at DESC
    `

    const result = await pool.query(query)

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    })

  } catch (err) {

    console.error(err)

    res.status(500).json({
      success: false,
      message: "Internal server error"
    })

  }

})
module.exports = router




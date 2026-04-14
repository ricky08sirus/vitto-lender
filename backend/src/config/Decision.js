const mongoose = require('mongoose')

const decisionSchema = new mongoose.Schema({
  loan_id: { type: Number, required: true },
  business_id: { type: Number, required: true },
  decision: { type: String, enum: ['APPROVED', 'REJECTED'], required: true },
  credit_score: { type: Number, required: true },
  reason_codes: [{ type: String }],
  breakdown: {
    revenue_to_emi_score: Number,
    loan_to_revenue_score: Number,
    tenure_score: Number,
    business_type_score: Number,
  },
  emi_computed: { type: Number },
  created_at: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Decision', decisionSchema)





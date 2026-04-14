const express = require('express');
const router = express.Router();
const pool = require('../config/postgres');
const Decision = require('../config/Decision');





const MONTHLY_INTEREST_RATE = 0.015; // 1.5%/month ~ 18% annual

function computeEMI(principal, tenureMonths) {
  const r = MONTHLY_INTEREST_RATE;
  return (principal * r) / (1 - Math.pow(1 + r, -tenureMonths));
}

function scoreRevenueToEMI(monthlyRevenue, emi) {
  const ratio = monthlyRevenue / emi;
  if (ratio >= 3) return { score: 100, ratio };
  if (ratio >= 2) return { score: 75, ratio };
  if (ratio >= 1.5) return { score: 50, ratio };
  if (ratio >= 1) return { score: 25, ratio };
  return { score: 0, ratio };
}

function scoreLoanToRevenue(loanAmount, monthlyRevenue) {
  const multiple = loanAmount / monthlyRevenue;
  if (multiple <= 6) return { score: 100, multiple };
  if (multiple <= 12) return { score: 75, multiple };
  if (multiple <= 24) return { score: 50, multiple };
  if (multiple <= 36) return { score: 25, multiple };
  return { score: 0, multiple };
}

function scoreTenure(tenure) {
  if (tenure >= 6 && tenure <= 24) return 100;
  if (tenure >= 3 && tenure <= 36) return 65;
  if (tenure >= 1 && tenure <= 48) return 30;
  return 0;
}

function scoreBusinessType(businessType) {
  const map = {
    services: 100,
    retail: 75,
    manufacturing: 60,
    construction: 40,
    other: 50,
  };
  return map[businessType?.toLowerCase()] ?? 50;
}

function runDecisionEngine({ monthlyRevenue, loanAmount, tenureMonths, businessType }) {
  const emi = computeEMI(loanAmount, tenureMonths);
  const { score: s1, ratio: emiRatio } = scoreRevenueToEMI(monthlyRevenue, emi);
  const { score: s2, multiple: ltrMultiple } = scoreLoanToRevenue(loanAmount, monthlyRevenue);
  const s3 = scoreTenure(tenureMonths);
  const s4 = scoreBusinessType(businessType);
  const creditScore = Math.round((s1 * 0.35) + (s2 * 0.30) + (s3 * 0.20) + (s4 * 0.15));
  const decision = creditScore >= 60 ? 'APPROVED' : 'REJECTED';

  const reasons = [];
  if (emiRatio < 1.5) reasons.push('LOW_REVENUE_TO_EMI');
  if (ltrMultiple > 24) reasons.push('HIGH_LOAN_RATIO');
  if (tenureMonths < 3 || tenureMonths > 48) reasons.push('UNUSUAL_TENURE');
  if (loanAmount > monthlyRevenue * 50) reasons.push('DATA_INCONSISTENCY');
  if (decision === 'REJECTED' && reasons.length === 0) reasons.push('LOW_CREDIT_SCORE');

  return {
    decision,
    credit_score: creditScore,
    reason_codes: reasons,
    emi_computed: Math.round(emi),
    breakdown: {
      revenue_to_emi_score: s1,
      loan_to_revenue_score: s2,
      tenure_score: s3,
      business_type_score: s4,
    }
  };
}



router.post('/:loan_id', async (req, res) => {
  const { loan_id } = req.params;

  try {
    // 1. Fetch loan + business together
    const { rows } = await pool.query(`
      SELECT 
        l.id             AS loan_id,
        l.business_id,
        l.requested_amount,
        l.tenure_months,
        l.purpose,
        b.monthly_revenue,
        b.business_type,
        b.pan
      FROM loans l
      JOIN businesses b ON b.id = l.business_id
      WHERE l.id = $1
    `, [loan_id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Loan application not found' });
    }

    const row = rows[0];

    // 2. Run engine
    const result = runDecisionEngine({
      monthlyRevenue: parseFloat(row.monthly_revenue),
      loanAmount: parseFloat(row.requested_amount),
      tenureMonths: row.tenure_months,
      businessType: row.business_type,
    });

    // 3. Save to MongoDB
    const decisionDoc = await Decision.create({
      loan_id: row.loan_id,
      business_id: row.business_id,
      ...result,
    });

    // 4. Update loan status in PostgreSQL
    await pool.query(
      `UPDATE loans SET status = $1 WHERE id = $2`,
      [result.decision === 'APPROVED' ? 'approved' : 'rejected', loan_id]
    );

    return res.status(200).json({
      loan_id: row.loan_id,
      business_id: row.business_id,
      ...result,
      decision_id: decisionDoc._id,
    });

  } catch (err) {
    console.error('Decision engine error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/:loan_id', async (req, res) => {
  try {
    const doc = await Decision.findOne({ loan_id: req.params.loan_id });
    if (!doc) return res.status(404).json({ error: 'No decision found for this loan' });
    return res.status(200).json(doc);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;



function calculatePercentage(score, total) {
  if (!total || total === 0) return 0;
  return ((score / total) * 100).toFixed(2);
}

module.exports = { calculatePercentage };


const express = require('express');
const router = express.Router();

// Mock data for now — replace later with DB query
const questions = [
  {
    id: 1,
    title: "Two Sum",
    description: "Given an array of integers, return indices of the two numbers such that they add up to a target.",
    inputExample: "[2,7,11,15], target = 9",
    outputExample: "[0,1]",
    functionName: "twoSum"
  }
];

router.get('/', (req, res) => {
  res.render('coding/index', { title: 'Coding Practice', questions });
});

router.get('/:id', (req, res) => {
  const question = questions.find(q => q.id === parseInt(req.params.id));
  if (!question) return res.status(404).send('Question not found');
  res.render('coding/challenge', { title: question.title, question });
});

module.exports = router;

const express = require("express");
const router = express.Router();

// Mock Data – Replace with DB fetch later
const challenges = [
  { id: 1, title: "Reverse a String", difficulty: "Easy", subject: "Java" },
  { id: 2, title: "Find Missing Number", difficulty: "Medium", subject: "DSA" },
  { id: 3, title: "Implement Stack using Queues", difficulty: "Hard", subject: "Data Structures" },
];

// Route: Show all challenges
router.get("/", (req, res) => {
  res.render("coding/challenges", { title: "Coding Challenges", challenges });
});

// Route: Show single question
router.get("/:id", (req, res) => {
  const question = challenges.find(q => q.id === parseInt(req.params.id));
  if (!question) return res.status(404).send("Challenge not found");
  
  // You can expand this with more details later
  question.problem_statement = "Write a program to reverse a given string.";
  question.input_format = "A single string S";
  question.output_format = "Reversed string";
  question.sample_input = "hello";
  question.sample_output = "olleh";
  question.constraints = "1 ≤ |S| ≤ 1000";

  res.render("coding/question", { title: question.title, question });
});

// Route: Submit solution
router.post("/:id/submit", (req, res) => {
  // For now, just redirect or show success message
  res.send("Solution submitted successfully!");
});

module.exports = router;

// controllers/codingController.js
const CodingProblem = require('../models/codingProblemModel');
const { executeJava } = require('../utils/codeExecutor');

exports.getAllProblems = async (req, res) => {
  const difficulty = req.params.difficulty || 'Easy';
  try {
    const problems = await CodingProblem.getProblemsByDifficulty(difficulty);
    res.render('coding/codingHome', { title: 'Coding Practice', problems, difficulty });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Error loading coding problems' });
  }
};

exports.getProblemById = async (req, res) => {
  try {
    const problem = await CodingProblem.getProblemById(req.params.id);
    if (!problem) return res.status(404).render('error', { message: 'Problem not found' });

    res.render('coding/codingProblem', { title: problem.title, problem });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Error loading problem' });
  }
};

exports.runCode = async (req, res) => {
  const { code } = req.body;
  const { id } = req.params;
  try {
    const testCases = await CodingProblem.getTestCases(id);
    const sample = testCases.find(tc => tc.is_sample);
    if (!sample) return res.status(400).json({ error: 'No sample test case found' });

    const output = await executeJava(code, sample.input_data);
    res.json({ input: sample.input_data, expected: sample.expected_output, output: output.trim() });
  } catch (error) {
    res.status(500).json({ error: 'Execution failed', details: error.message });
  }
};

exports.submitCode = async (req, res) => {
  const { code } = req.body;
  const { id } = req.params;
  try {
    const testCases = await CodingProblem.getTestCases(id);
    let passed = 0;
    const results = [];

    for (const tc of testCases) {
      const output = await executeJava(code, tc.input_data);
      const passedCase = output.trim() === tc.expected_output.trim();
      if (passedCase) passed++;
      results.push({ input: tc.input_data, expected: tc.expected_output, output: output.trim(), passed: passedCase, isSample: tc.is_sample });
    }

    res.json({ total: testCases.length, passed, results });
  } catch (error) {
    res.status(500).json({ error: 'Submission failed', details: error.message });
  }
};

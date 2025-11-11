// models/codingProblemModel.js
const pool = require('../db');

const CodingProblem = {
  async getProblemsByDifficulty(difficulty) {
    const { rows } = await pool.query('SELECT * FROM coding_questions WHERE difficulty = $1 ORDER BY id ASC', [difficulty]);
    return rows;
  },

  async getProblemById(id) {
    const { rows } = await pool.query('SELECT * FROM coding_questions WHERE id = $1', [id]);
    if (!rows.length) return null;
    const problem = rows[0];
    const testCases = await this.getTestCases(id);
    problem.test_cases = testCases;
    return problem;
  },

  async getTestCases(questionId) {
    const { rows } = await pool.query('SELECT * FROM test_cases WHERE question_id = $1', [questionId]);
    return rows;
  }
};

module.exports = CodingProblem;

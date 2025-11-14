// models/codingProblemModel.js
const pool = require('../db');
const { parse } = require('path');

const CodingProblem = {
    // Fetches a list of problems by difficulty (e.g., for the codingHome view)
    async getProblemsByDifficulty(difficulty) {
        const { rows } = await pool.query('SELECT * FROM coding_questions WHERE difficulty = $1 ORDER BY id ASC', [difficulty]);
        return rows;
    },

    // Fetches the main problem details and only the sample test case for display
    async getProblemById(id) {
        const { rows } = await pool.query('SELECT * FROM coding_questions WHERE id = $1', [id]);
        if (!rows.length) return null;
        
        const problem = rows[0];
        
        // Fetch only the sample test case for displaying on the problem page
        const sampleTestCase = await this.getSampleTestCase(id); 
        problem.sample_test_case = sampleTestCase.length > 0 ? sampleTestCase[0] : null;

        return problem;
    },

    // Fetches ONLY the sample test case (is_sample = true) for initial display
    async getSampleTestCase(questionId) {
        const { rows } = await pool.query(
            'SELECT input_data, expected_output FROM test_cases WHERE question_id = $1 AND is_sample = TRUE', 
            [questionId]
        );
        return rows;
    },

    // Fetches ALL test cases (sample and hidden) for submission checking
    async getAllTestCases(questionId) {
        const { rows } = await pool.query(
            'SELECT input_data, expected_output, is_sample FROM test_cases WHERE question_id = $1 ORDER BY id ASC', 
            [questionId]
        );
        return rows;
    }
};

module.exports = CodingProblem;
// utils/codeExecutor.js
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

exports.executeJava = (code, input) => {
  return new Promise((resolve, reject) => {
    const dir = path.join(__dirname, '../public/temp');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, 'Main.java');
    fs.writeFileSync(filePath, code);

    exec(`javac ${filePath}`, (compileErr) => {
      if (compileErr) return reject(new Error('Compilation failed'));

      exec(`echo "${input}" | java -cp ${dir} Main`, (runErr, stdout, stderr) => {
        if (runErr || stderr) return reject(new Error('Runtime Error'));
        resolve(stdout);
      });
    });
  });
};

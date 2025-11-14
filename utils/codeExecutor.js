const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const tempDir = path.join(__dirname, '../views/temp');
const javaFile = path.join(tempDir, 'Main.java');

function writeCodeToFile(code) {
    return fs.promises.writeFile(javaFile, code);
}

function clearTempMain() {
    return fs.promises.writeFile(javaFile, '');
}

function runSingleTest(code, input) {
    return new Promise(async (resolve) => {
        try {
            await writeCodeToFile(code);

            // Compile Main.java
            exec(`javac ${javaFile}`, (compileErr, stdout, stderr) => {
                if (compileErr) {
                    return resolve({ status: 'error', stderr: stderr || compileErr.message });
                }

                // Run Main class
                const runProcess = exec(`java -cp ${tempDir} Main`, (runErr, runStdout, runStderr) => {
                    if (runErr) {
                        return resolve({ status: 'error', stderr: runStderr || runErr.message });
                    }
                    resolve({ status: 'success', stdout: runStdout, stderr: runStderr });
                });

                // Provide input to the program
                if (input) {
                    runProcess.stdin.write(input + '\n');
                }
                runProcess.stdin.end();
            });
        } catch (err) {
            resolve({ status: 'error', stderr: err.message });
        }
    });
}

module.exports = {
    runSingleTest,
    clearTempMain
};

// utils/codeExecutor.js
const fs = require('fs/promises');
const { exec } = require('child_process');
const path = require('path');

// Set the directory where temporary files will be created and executed.
// This path is relative to the directory where app.js is run (project/ in your structure).
const TEMP_DIR = path.join(__dirname, '..', 'temp'); 

// Placeholder: Define execution commands for different languages
const EXECUTION_COMMANDS = {
    // Note: The commands now assume they are running FROM the TEMP_DIR
    // Java needs to compile AND run, and the file name is dynamic.
    'java': (baseName) => `javac ${baseName}.java && java ${baseName}`,
    // JavaScript is executed directly by Node.
    'javascript': (baseName) => `node ${baseName}.js`,
    // Add C++: (baseName) => `g++ ${baseName}.cpp -o ${baseName} && ./${baseName}`
};

// Placeholder function to execute a child process with a timeout
function executeCommand(command, execOptions) {
    return new Promise((resolve, reject) => {
        exec(command, execOptions, (error, stdout, stderr) => {
            if (error) {
                // If the error object exists, it means execution failed (runtime or compilation)
                reject({ error: stderr || error.message || 'Execution failed' });
            } else {
                // Successful execution
                resolve({ stdout, stderr });
            }
        });
    });
}

exports.execute = async (code, language, problemId) => {
    // 1. Create unique base name for files
    const baseName = `${Date.now()}_${problemId}`;
    let extension;

    switch (language) {
        case 'java':
            extension = 'java';
            break;
        case 'javascript':
            extension = 'js';
            break;
        default:
            return { status: 'error', output: null, error: `Unsupported language: ${language}` };
    }

    const filePath = path.join(TEMP_DIR, `${baseName}.${extension}`);
    const command = EXECUTION_COMMANDS[language](baseName);

    // Options for exec: Run command *inside* the temp directory and limit time/memory.
    const execOptions = {
        cwd: TEMP_DIR, // Crucial: Run the command from the temp folder
        timeout: 5000, // 5 second timeout
        maxBuffer: 1024 * 512, // 512KB buffer limit
    };
    
    // List of files to clean up later
    const filesToClean = [
        filePath
    ];
    if (language === 'java') {
        filesToClean.push(path.join(TEMP_DIR, `${baseName}.class`));
    }
    // if (language === 'c++') { filesToClean.push(path.join(TEMP_DIR, baseName)); }


    try {
        // 1. Write the code to the temporary file
        await fs.writeFile(filePath, code);

        // 2. Execute the code
        const { stdout, stderr } = await executeCommand(command, execOptions);
        
        // 3. Return successful results
        return { 
            status: 'success', 
            output: stdout.trim() || 'No output.', 
            error: null 
        };
    } catch (e) {
        // 4. Handle execution/compilation errors
        let errorMsg = e.error || e.toString();

        if (errorMsg.includes('Timeout')) {
            errorMsg = 'Execution failed: Time Limit Exceeded (5s)';
        }

        return { 
            status: 'error', 
            output: null, 
            error: errorMsg 
        };
    } finally {
        // 5. Clean up temporary files regardless of success or failure
        for (const file of filesToClean) {
            await fs.unlink(file).catch(() => {}); // Use .catch to ignore errors if the file doesn't exist
        }
    }
};
let pyodide;
let outputBuffer = ""; 

async function initializePyodide() {
    pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
    });

    // Capture stdout (print statements)
    pyodide.setStdout({
        write: (text) => (outputBuffer += text),
    });

    console.log("Pyodide initialized");
}

async function runPython(code) {
    outputBuffer = ""; 
    try {
        // Run code and capture result (like REPL)
        const result = await pyodide.runPythonAsync(code);
        // Append result if not undefined (e.g., for expressions like 50)
        if (result !== undefined) {
            outputBuffer += result;
        }
        return outputBuffer || "checkout console by pressing F12 for outout";
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

// Handle JavaScript execution
function runJavaScript(code) {
    try {
        const result = eval(code);
        return String(result ?? "no output"); // Handle undefined/null
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

document.getElementById('runButton').addEventListener('click', async () => {
    const language = document.getElementById('languageSelector').value;
    const code = document.getElementById('codeEditor').value;
    const outputElement = document.getElementById('output');

    outputElement.textContent = 'Running...';

    if (language === 'python') {
        if (!pyodide) {
            await initializePyodide(); 
        }
        const result = await runPython(code);
        outputElement.textContent = result;
    } else if (language === 'javascript') {
        // Run JS synchronously for simplicity
        outputElement.textContent = runJavaScript(code);
    }
});
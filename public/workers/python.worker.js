let pyodide;
self.onmessage = async ({ data }) => {
  try {
    if (data.type === "init") {
      const { loadPyodide } = await import("/pyodide/pyodide.mjs");
      pyodide = await loadPyodide({ indexURL: new URL("/pyodide/", self.location.origin).href });
      // Learner code runs in a dedicated worker without network APIs.
      self.fetch = undefined;
      self.XMLHttpRequest = undefined;
      self.WebSocket = undefined;
      self.postMessage({ type: "ready" });
      return;
    }
    if (data.type === "run" && pyodide) {
      let output = "";
      const append = (text) => { if (output.length < 12000) output += text.slice(0, 12000 - output.length) + "\n"; };
      pyodide.setStdout({ batched: append });
      pyodide.setStderr({ batched: append });
      // Fresh namespace for every attempt; earlier definitions cannot pass later checks.
      const scope = pyodide.runPython("dict()");
      try {
        await pyodide.runPythonAsync(data.code, { globals: scope });
        let passed = false;
        if (data.tests) {
          await pyodide.runPythonAsync(`
assert total_minutes([20, 35, 15]) == 70, "Typical case failed"
assert total_minutes([]) == 0, "Empty list case failed"
assert total_minutes([8]) == 8, "Single item case failed"
print("All 3 challenge checks passed.")
`, { globals: scope });
          passed = true;
        }
        self.postMessage({ type: "result", text: output.trim(), passed });
      } finally {
        scope.destroy();
      }
    }
  } catch (error) {
    self.postMessage({ type: "error", stage: data.type, error: String(error) });
  }
};

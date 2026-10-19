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
      pyodide.setStdout({ batched: (text) => { output += text + "\n"; } });
      pyodide.setStderr({ batched: (text) => { output += text + "\n"; } });
      await pyodide.runPythonAsync(data.code);
      let passed = false;
      if (data.tests) {
        await pyodide.runPythonAsync(`
assert total_minutes([20, 35, 15]) == 70, "Typical case failed"
assert total_minutes([]) == 0, "Empty list case failed"
assert total_minutes([8]) == 8, "Single item case failed"
print("All 3 challenge checks passed.")
`);
        passed = true;
      }
      self.postMessage({ type: "result", text: output.trim(), passed });
    }
  } catch (error) {
    self.postMessage({ type: "error", error: String(error) });
  }
};

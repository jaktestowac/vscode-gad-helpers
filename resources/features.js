//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  const state = vscode.getState();
  const collapsibleState = state?.collapsibleState ? state.collapsibleState : {};
  const favState = state?.favState ? state.favState : {};

  document.querySelectorAll(".feature-button").forEach((button) => {
    button.addEventListener("click", () => {
      const index = button.getAttribute("data-index");
      const key = button.getAttribute("key");
      vscode.postMessage({
        type: "changeFeature",
        value: key,
      });
    });
  });
})();

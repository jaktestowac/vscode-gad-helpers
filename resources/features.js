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

  // Add handling for the refresh button if it exists
  const refreshButton = document.querySelector(".refresh-button");
  if (refreshButton) {
    refreshButton.addEventListener("click", () => {
      vscode.postMessage({
        type: "refreshAppState",
      });
    });
  }

  document.querySelectorAll(".feature-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const index = checkbox.getAttribute("data-index");
      const key = checkbox.getAttribute("data-key");
      vscode.postMessage({
        type: "changeFeature",
        value: key,
        // @ts-ignore
        checked: checkbox.checked,
      });
    });
  });
})();

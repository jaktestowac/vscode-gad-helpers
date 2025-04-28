//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  // @ts-ignore
  const vscode = acquireVsCodeApi();
  const state = vscode.getState();

  const gadHelpersSettingsState = state?.gadHelpersSettingsState ? state.gadHelpersSettingsState : {};

  function updateWholeSettingsState(gadHelpersSettingsState) {
    vscode.setState({ gadHelpersSettingsState });
  }

  function updateSettingsState(key, value, gadHelpersSettingsState) {
    gadHelpersSettingsState[key] = value;
    updateWholeSettingsState(gadHelpersSettingsState);
  }

  restoreSettingsState(gadHelpersSettingsState);

  function restoreSettingsState(gadHelpersSettingsState, toDefault = false) {
    const settingInputs = document.querySelectorAll(".setting-input");
    const directoryPaths = document.querySelectorAll(".directory-path");

    for (const input of settingInputs) {
      const attributeKey = input.getAttribute("key");

      if (gadHelpersSettingsState[attributeKey] === undefined) {
        const defaultValue = input.getAttribute("data-default");
        // @ts-ignore
        gadHelpersSettingsState[attributeKey] = defaultValue;
      }
      input.value = gadHelpersSettingsState[attributeKey];
    }

    for (const path of directoryPaths) {
      const attributeKey = path.getAttribute("key");

      if (gadHelpersSettingsState[attributeKey] === undefined) {
        const defaultValue = path.getAttribute("data-default");
        // @ts-ignore
        gadHelpersSettingsState[attributeKey] = defaultValue;
      }
      path.value = gadHelpersSettingsState[attributeKey];
    }
    console.log("Updated settings state:", gadHelpersSettingsState);
  }

  const directoryPaths = document.querySelectorAll(".directory-path");
  for (const path of directoryPaths) {
    path.addEventListener("change", () => {
      const attributeKey = path.getAttribute("key");
      const pathValue = path.value;

      // @ts-ignore
      updateSettingsState(attributeKey, pathValue, gadHelpersSettingsState);
    });
  }

  const checkboxes = document.querySelectorAll(".checkbox");
  for (const checkbox of checkboxes) {
    checkbox.addEventListener("change", () => {
      const attributeKey = checkbox.getAttribute("key");
      vscode.postMessage({
        type: "updateSetting",
        key: attributeKey,
        // @ts-ignore
        value: checkbox.checked,
      });
    });
  }

  const inputs = document.querySelectorAll(".setting-input");
  for (const input of inputs) {
    input.addEventListener("blur", () => {
      const attributeKey = input.getAttribute("key");
      vscode.postMessage({
        type: "updateSettingInput",
        key: attributeKey,
        // @ts-ignore
        value: input.value,
      });

      // @ts-ignore
      updateSettingsState(attributeKey, input.value, gadHelpersSettingsState);
    });
  }

  // Add event listeners for custom action buttons
  const customActionButtons = document.querySelectorAll(".custom-action-btn");
  for (const btn of customActionButtons) {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      const key = btn.getAttribute("data-key");
      if (action) {
        vscode.postMessage({
          type: action,
          key: key,
        });
      }
    });
  }

  // Add event listeners for reset buttons
  const resetButtons = document.querySelectorAll(".reset-btn");
  for (const btn of resetButtons) {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");

      if (!targetId) {
        console.error("No target ID specified for reset button.");
        return;
      }

      // @ts-ignore
      const inputElement = document.getElementById(targetId);
      if (inputElement) {
        const defaultValue = inputElement.getAttribute("data-default") || "";
        // @ts-ignore
        inputElement.value = defaultValue;

        // If this is a setting input, update the value in the extension
        if (inputElement.classList.contains("setting-input")) {
          const key = inputElement.getAttribute("key");
          if (key) {
            vscode.postMessage({
              type: "updateSettingInput",
              key: key,
              value: defaultValue,
            });
          }
          updateSettingsState(key, defaultValue, gadHelpersSettingsState);
        }
        // If this is a directory path, update it in the extension
        else if (inputElement.classList.contains("directory-path")) {
          // @ts-ignore
          const key = targetId.replace("-path", "");
          vscode.postMessage({
            type: "updateSettingInput",
            key: key,
            value: defaultValue,
          });
          updateSettingsState(key, defaultValue, gadHelpersSettingsState);
        }
      }
    });
  }

  window.addEventListener("message", (event) => {
    const message = event.data;
    if (message.type === "directorySelected") {
      const pathInput = document.getElementById(`${message.key}`);
      if (pathInput) {
        // @ts-ignore
        pathInput.value = message.path;
        // Add this line to update the settings state with the new path
        updateSettingsState(message.key, message.path, gadHelpersSettingsState);
      }
    }
  });

  // Add event listeners for directory select buttons
  const directoryButtons = document.querySelectorAll(".directory-select-btn");
  for (const btn of directoryButtons) {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-key");
      // Send message to request directory selection through VS Code API
      vscode.postMessage({
        type: "selectDirectory",
        key: key,
      });
    });
  }

  // Add event listeners for URL links
  const linkButtons = document.querySelectorAll(".link-button");
  for (const btn of linkButtons) {
    btn.addEventListener("click", () => {
      const url = btn.getAttribute("data-url");
      if (url) {
        vscode.postMessage({
          type: "openUrl",
          url: url,
        });
      }
    });
  }

  // Listen for messages from the extension
  window.addEventListener("message", (event) => {
    const message = event.data;
    if (message.type === "directorySelected") {
      const pathInput = document.getElementById(`${message.key}`);
      if (pathInput) {
        // @ts-ignore
        pathInput.value = message.path;
      }
    }
  });

  const envVarTable = document.getElementById("envVariablesTableBody");

  if (envVarTable) {
    const newRow = createRow();
    envVarTable.appendChild(newRow);
  }

  const addEnvVariableButton = document.getElementById("addEnvVariable");

  if (addEnvVariableButton) {
    addEnvVariableButton.addEventListener("click", () => {
      const envVarTable = document.getElementById("envVariablesTableBody");
      const lastRow = envVarTable?.lastElementChild;
      if (lastRow) {
        const nameInput = lastRow.querySelector("#name");
        const valueInput = lastRow.querySelector("#value");
        // @ts-ignore
        if (nameInput?.value === "" && valueInput?.value === "") {
          return;
        }
      }

      const newRow = createRow();
      envVarTable?.appendChild(newRow);
    });
  }

  function createRow() {
    const newRow = document.createElement("tr");
    newRow.classList.add("envVarRow");

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.setAttribute("placeholder", "Value");
    nameInput.setAttribute("id", "name");
    nameInput.classList.add("settings-table-input");
    nameInput.addEventListener("change", () => {
      inputWasChanged();
    });

    const nameCell = document.createElement("td");
    nameCell.appendChild(nameInput);
    newRow.appendChild(nameCell);

    const valueInput = document.createElement("input");
    valueInput.type = "text";
    valueInput.setAttribute("placeholder", "Value");
    valueInput.setAttribute("id", "value");
    valueInput.classList.add("settings-table-input");
    valueInput.addEventListener("change", () => {
      inputWasChanged();
    });

    const valueCell = document.createElement("td");
    valueCell.appendChild(valueInput);
    newRow.appendChild(valueCell);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "x";
    deleteButton.addEventListener("click", () => {
      newRow.remove();
      inputWasChanged();
      const envVarTableRows = document.getElementsByClassName("envVarRow");
      if (envVarTableRows.length === 0) {
        const newEmptyRow = createRow();
        envVarTable?.appendChild(newEmptyRow);
      }
    });
    const deleteCell = document.createElement("td");
    deleteCell.appendChild(deleteButton);
    newRow.appendChild(deleteCell);

    return newRow;
  }

  function inputWasChanged() {
    const envVarTableRows = document.getElementsByClassName("envVarRow");
    const envVars = [];
    for (const row of envVarTableRows) {
      const nameInput = row.querySelector("#name");
      const valueInput = row.querySelector("#value");
      // @ts-ignore
      if (nameInput?.value === "" || valueInput?.value === "") {
        continue;
      }
      // @ts-ignore
      envVars.push({ name: nameInput.value, value: valueInput.value });
    }
    vscode.postMessage({
      type: "updateEnvVariables",
      key: "updateEnvVariables",
      vars: envVars,
    });
  }

  // Call the createRow function to add a new row to the table
  createRow();
})();

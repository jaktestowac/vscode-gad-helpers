import * as vscode from "vscode";
import MyExtensionContext from "../helpers/my-extension.context";
import { getNonce, openInBrowser } from "../helpers/helpers";
import { KeyValuePairs, NameValuePair, GadSettings, GadSettingsMap } from "../helpers/types";
import { checkAboutStatus } from "../helpers/app.helpers";
import { GAD_BASE_URL_KEY, GAD_REPO_URL } from "../helpers/consts";
import { showInformationMessage } from "../helpers/window-messages.helpers";

export class SettingsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "gad-helpers.settings";

  private _view?: vscode.WebviewView;
  private _urlIsValid?: boolean;
  private _gadVersion?: string;
  private _actionsOnAppUrlChange = [] as (() => void)[];

  constructor(private readonly _extensionUri: vscode.Uri, private _settingsList: GadSettings[]) {}

  private getGadVersion(): string {
    const gadVersion = this._gadVersion ? this._gadVersion : "unknown";
    return gadVersion;
  }

  private getGadUrl(): string {
    const gadUrl = this._urlIsValid ? MyExtensionContext.instance.getWorkspaceValue(GAD_BASE_URL_KEY) : "unknown";
    return gadUrl;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case "updateSetting": {
          this.invokeToggle(data.key, data.value);
          break;
        }
        case "updateSettingInput": {
          const value = data.value.trim();
          this.updateSetting(data.key, value);
          break;
        }
        case "selectDirectory": {
          this.selectDirectory(data.key);
          break;
        }
        case "directorySelected": {
          this.updateSetting(data.key, data.path);
          break;
        }
        case "updateEnvVariables": {
          this.updateEnvVariables(data.vars);
          break;
        }
        case "refreshGadStatus": {
          this.checkAppUrl(true);
          break;
        }
        case "openUrl": {
          openInBrowser(data.url);
          break;
        }
      }
    });
  }

  public registerActionOnAppUrlChange(action: () => void) {
    this._actionsOnAppUrlChange.push(action);
  }

  private async selectDirectory(key: string): Promise<void> {
    const options: vscode.OpenDialogOptions = {
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "Select Directory",
    };

    const fileUri = await vscode.window.showOpenDialog(options);

    if (fileUri && fileUri[0]) {
      const selectedPath = fileUri[0].fsPath;

      // Update the setting value
      this.updateSetting(key, selectedPath);

      // Notify the webview about the selected directory
      if (this._view) {
        this._view.webview.postMessage({
          type: "directorySelected",
          key: key,
          path: selectedPath,
        });
      }
    }
  }

  private updateSetting(key: string, value: string) {
    MyExtensionContext.instance.setWorkspaceValue(key, value);

    if (key === GAD_BASE_URL_KEY) {
      this.checkAppUrl();
    }
  }

  public async checkAppUrl(verbose=false): Promise<void> {
    checkAboutStatus().then((status) => {
      const previousUrlIsValid = this._urlIsValid;
      const previousGadVersion = this._gadVersion;

      if (status?.version !== undefined) {
        this._urlIsValid = true;
        this._gadVersion = status.version;
        if (verbose) {
          showInformationMessage("GAD is online: " + status.version);
        }
      } else if (status?.error !== undefined) {
        this._urlIsValid = false;
        this._gadVersion = undefined;
        if (verbose) {
          showInformationMessage("GAD is offline");
        }
      } else {
        this._urlIsValid = undefined;
        this._gadVersion = undefined;
      }

      if (this._view !== undefined) {
        this._view.webview.html = this._getHtmlForWebview(this._view.webview);
      }

      if (this._urlIsValid !== previousUrlIsValid || this._gadVersion !== previousGadVersion) {
        // Notify the webview about the URL change
        for (const action of this._actionsOnAppUrlChange) {
          action();
        }
      }
    });
  }

  private updateEnvVariables(keyValuePairs: NameValuePair[]) {
    const vars = {} as KeyValuePairs;

    for (const { name, value } of keyValuePairs) {
      vars[name] = value;
    }

    MyExtensionContext.instance.setWorkspaceValue("environmentVariables", vars);
  }

  private invokeToggle(key: string, value: boolean) {
    MyExtensionContext.instance.setWorkspaceValue(key, value);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "resources", "settings.js"));
    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "resources", "vscode.css"));
    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "resources", "main.css"));

    let controlsHTMLList = "";
    let gadUrlLink = "<strong>[unknown]</strong>";

    let urlStatusIcon = "❓";
    if (this._urlIsValid === false) {
      urlStatusIcon = "❌";
    } else if (this._urlIsValid === true) {
      urlStatusIcon = "✅";
      gadUrlLink = `<button class="link-button" data-url="${this.getGadUrl()}">[Open]</button>`;
    }

    const tempList: GadSettingsMap = {};
    for (const setting of this._settingsList) {
      if (!(setting.category in tempList)) {
        tempList[setting.category] = [];
      }
      tempList[setting.category].push(setting);
    }

    // add Gad version to the settings list
    controlsHTMLList += `<h4 aria-label="Base Info" class="nav-list__title">Base Info</h4>`;
    controlsHTMLList += `<label aria-label="Gad Version" >Version: <strong>${this.getGadVersion()}</strong> ${urlStatusIcon}</label><br />`;
    controlsHTMLList += `<label aria-label="Gad page" >Main page: ${gadUrlLink}</label><br />`;
    controlsHTMLList += `<label aria-label="Gad Repository" >Repository: <button class="link-button" data-url="${GAD_REPO_URL}">[Open]</button></label>`;

    for (const [category, settings] of Object.entries(tempList)) {
      controlsHTMLList += `<h4 aria-label="${category}" class="nav-list__title">${category}</h4>`;
      for (const { key, prettyName, type, prettyNameAriaLabel, defaultValue, invokeCustomActionButton } of settings) {
        if (type === "checkbox") {
          const isChecked = MyExtensionContext.instance.getWorkspaceValue(key) ?? defaultValue;
          const ariaLabel = prettyNameAriaLabel ?? prettyName;
          controlsHTMLList += `
          <input class="checkbox" type="checkbox" id="${key}" key="${key}" title="${ariaLabel}" aria-label="${ariaLabel}" ${
            isChecked ? "checked" : ""
          } />
          <label for="${key}">${prettyName}</label><br />
          `;
        } else if (type === "input") {
          const value = MyExtensionContext.instance.getWorkspaceValue(key) ?? defaultValue ?? "";
          const defaultVal = defaultValue ?? "";

          // Create custom action button if defined
          let customActionButton = "";
          if (invokeCustomActionButton) {
            const actionBtn = invokeCustomActionButton;
            customActionButton = `<button class="reset-btn small-btn custom-action-btn" data-action="${actionBtn.actionName}" data-key="${key}" title="${actionBtn.name}">${actionBtn.icon}</button>`;
          }

          controlsHTMLList += `
          <label class="setting-label" for="${key}">
            ${prettyName} ${urlStatusIcon}
            <span>
              ${customActionButton}
              <button class="reset-btn small-btn" data-target="${key}" title="Reset to default value">🧹</button>
            </span>
          </label>
          <div class="input-container">
            <input class="input setting-input" type="text" id="${key}" key="${key}" value="${value}" 
                   data-default="${defaultVal}" title="${prettyName}" aria-label="${prettyName}" />
          </div>
          `;
        } else if (type === "directorySelector") {
          const value = MyExtensionContext.instance.getWorkspaceValue(key) ?? defaultValue ?? "";
          const defaultVal = defaultValue ?? "";
          controlsHTMLList += `
          <label class="setting-label" for="${key}">
            ${prettyName}
            <button class="reset-btn small-btn" data-target="${key}-path" title="Reset to default value">🧹</button>
          </label>
          <div class="directory-selector">
            <input class="input directory-path" type="text" readonly id="${key}-path" value="${value}" 
                   data-default="${defaultVal}" title="${prettyName}" aria-label="${prettyName}" />
            <button class="directory-select-btn" data-key="${key}">Browse...</button>
          </div>
          `;
        }
      }
    }

    controlsHTMLList += `<h4 aria-label="Environment Variables" class="nav-list__title" title="Environment Variables to be set before running scripts">Environment Variables</h4>`;
    controlsHTMLList += `
    <table id="envVariablesTable">
      <tbody id="envVariablesTableBody">
        <tr>
          <td width="50%">Variable</td>
          <td width="50%">Value</td>
          <td width="20px"></td>
        </tr>
      </tbody>
    </table>
    <div align="center">
      <button width="auto" id="addEnvVariable">Prepare New Env Variable</button>
    </div>
    `;

    const nonce = getNonce();

    return `<!DOCTYPE html>
              <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
  
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
                  <link href="${styleVSCodeUri}" rel="stylesheet">
                  <link href="${styleMainUri}" rel="stylesheet">
  
              </head>
              <body class="settings-body">
  
                 ${controlsHTMLList}

                  <script nonce="${nonce}" src="${scriptUri}"></script>
              </body>
              </html>`;
  }
}

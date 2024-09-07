import * as vscode from "vscode";
import MyExtensionContext from "../helpers/my-extension.context";
import { getNonce } from "../helpers/helpers";
import { KeyValuePairs, NameValuePair, GadSettings, GadSettingsMap } from "../helpers/types";

export class SettingsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "gad-helpers.settings";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri, private _settingsList: GadSettings[]) {}

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
        case "updateEnvVariables": {
          this.updateEnvVariables(data.vars);
          break;
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

    const tempList: GadSettingsMap = {};
    for (const setting of this._settingsList) {
      if (!(setting.category in tempList)) {
        tempList[setting.category] = [];
      }
      tempList[setting.category].push(setting);
    }

    for (const [category, settings] of Object.entries(tempList)) {
      controlsHTMLList += `<h4 aria-label="${category}" class="nav-list__title">${category}</h4>`;
      for (const { key, prettyName, type, prettyNameAriaLabel } of settings) {
        if (type === "checkbox") {
          const isChecked = MyExtensionContext.instance.getWorkspaceValue(key) ?? false;
          const ariaLabel = prettyNameAriaLabel ?? prettyName;
          controlsHTMLList += `
          <input class="checkbox" type="checkbox" id="${key}" key="${key}" title="${ariaLabel}" aria-label="${ariaLabel}" ${
            isChecked ? "checked" : ""
          } />
          <label for="${key}">${prettyName}</label><br />
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

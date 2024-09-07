import * as vscode from "vscode";
import { getNonce, getGadScriptsFromPackageJson } from "../helpers/helpers";
import { GadScripts } from "../helpers/types";
import { executeCommandInTerminal } from "../helpers/terminal.helpers";
import { svgPlayIcon, svgWaitContinueIcon } from "../helpers/icons";
import { showErrorMessage } from "../helpers/window-messages.helpers";

export class ScriptsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "gad-helpers.scripts";

  private _view?: vscode.WebviewView;
  private _scriptsList?: GadScripts[];

  constructor(private readonly _extensionUri: vscode.Uri, scripts: GadScripts[] = []) {
    this._scriptsList = scripts;
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
        case "invokeScript": {
          this.invokeScript(data.key, data.instantExecute);
          break;
        }
      }
    });
  }

  private invokeScript(scriptName: string, instantExecute: boolean) {
    getGadScriptsFromPackageJson().then((scripts) => {
      const script = scripts?.find((command) => command.key === scriptName);
      if (script !== undefined) {
        executeCommandInTerminal({
          command: script.script,
          terminalName: script.key,
          execute: instantExecute ?? true,
        });
      } else {
        showErrorMessage(`Script ${scriptName} not found. Refreshing...`);
        this.refresh(scripts);
      }
    });
  }

  public refresh(scripts: GadScripts[]) {
    this._scriptsList = scripts;
    if (this._view !== undefined) {
      this._view.webview.html = this._getHtmlForWebview(this._view.webview);
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "resources", "scripts.js"));
    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "resources", "vscode.css"));
    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "resources", "main.css"));
    let controlsHTMLList = ``;

    if (this._scriptsList !== undefined && this._scriptsList.length > 0) {
      controlsHTMLList += '<nav class="nav-list">';
      for (const script of this._scriptsList) {
        let playButtons = "";
        playButtons = `<span class="run-icon" title="Paste & run" tooltip-text="Paste & run" key="${script.key}">${svgPlayIcon}</span>`;
        playButtons += `<span class="pause-run-icon" title="Paste" tooltip-text="Paste" key="${script.key}">${svgWaitContinueIcon}</span>`;

        controlsHTMLList += `
          <div class="nav-list__item list__item_not_clickable">
            <div class="nav-list__link " aria-label="${script.key}" key="${script.key}" title="${script.script}" tooltip-text="${script.script}">
              <code-icon class="nav-list__icon" modifier="">
              </code-icon>
              <tooltip class="nav-list__label" content="${script.key}" >
                <span>${script.key}</span>
              </tooltip>
            </div>${playButtons}
          </div>`;
      }
      controlsHTMLList += "</div>";
    }

    if (this._scriptsList === undefined || this._scriptsList.length === 0) {
      controlsHTMLList = `<br />No 🐍 GAD scripts found in package.json.<br />
         Please add some scripts and hit refresh button.`;
    }

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
              <body>
                <h4 aria-label="🐍 GAD Scripts from package.json" class="nav-list__title">🐍 GAD Scripts from package.json:</h4>
                 ${controlsHTMLList}

                  <script nonce="${nonce}" src="${scriptUri}"></script>
              </body>
              </html>`;
  }
}

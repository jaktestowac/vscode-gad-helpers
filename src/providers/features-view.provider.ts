import * as vscode from "vscode";
import { getNonce } from "../helpers/helpers";
import { EXTENSION_NAME } from "../helpers/consts";
import { GadFeature } from "../helpers/types";
import { showErrorMessage } from "../helpers/window-messages.helpers";
import { changeFeatureValue, getFeaturesList } from "../helpers/app.helpers";

export class FeaturesViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = `${EXTENSION_NAME}.features`;
  private _view?: vscode.WebviewView;
  private _actionsOnRefresh = [] as (() => void)[];

  constructor(private readonly _extensionUri: vscode.Uri, private features: GadFeature[] = []) {}

  public registerActionOnRefresh(action: () => void) {
    this._actionsOnRefresh.push(action);
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "changeFeature": {
          this.changeFeature(data.value, data.checked);
          break;
        }
        case "refreshAppState": {
          this.executeRefreshActions();
          break;
        }
      }
    });
  }

  private changeFeature(key: string, checked: boolean) {
    const script = this.features?.find((feature) => feature.key === key);
    if (script !== undefined) {
      changeFeatureValue(key, checked).then((response) => {
        if (response.error !== undefined) {
          showErrorMessage(`Error changing feature ${key}: ${response.error}`);
        }
        this.refreshFeatureList();
      });
    } else {
      showErrorMessage(`Feature ${key} not found. Refreshing...`);
      this.refreshFeatureList();
    }
  }

  public refreshFeatureList() {
    getFeaturesList().then((features) => {
      this.refresh(features);
    });
  }

  public refresh(features: GadFeature[]) {
    this.features = features;
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview(this._view.webview);
    }
  }

  private executeRefreshActions() {
    for (const action of this._actionsOnRefresh) {
      action();
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "resources", "features.js"));
    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "resources", "vscode.css"));
    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "resources", "main.css"));

    const nonce = getNonce();
    const featuresHtml = this.features
      .map((feature, index) => {
        const isChecked = feature.value ? "checked" : "";

        return `
        <div class="feature-item">
          <input type="checkbox" id="feature-${index}" class="feature-checkbox" data-index="${index}" data-key="${
          feature.key
        }" ${isChecked}>
          <label for="feature-${index}">${feature.prettyName || feature.key}</label>
        </div>
      `;
      })
      .join("");

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${
          webview.cspSource
        }; script-src 'nonce-${nonce}';">
        <link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <title>Features</title>
      </head>
      <body>
        <div class="features-container">
          ${
            this.features.length
              ? featuresHtml
              : `
            <p>No features available</p>
            <button class="refresh-button">Refresh App State</button>
          `
          }
        </div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}

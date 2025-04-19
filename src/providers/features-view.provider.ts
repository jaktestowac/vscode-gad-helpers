import * as vscode from "vscode";
import { getNonce } from "../helpers/helpers";
import { EXTENSION_NAME } from "../helpers/consts";
import { GadFeature } from "../helpers/types";
import { showErrorMessage } from "../helpers/window-messages.helpers";
import { getFeaturesList } from "../helpers/app.helpers";

export class FeaturesViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = `${EXTENSION_NAME}.features`;
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri, private features: GadFeature[] = []) {}

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
          this.changeFeature(data.value);
          break;
        }
      }
    });
  }

  private changeFeature(key: string) {
    const script = this.features?.find((feature) => feature.key === key);
    console.log("changeFeature: ", script);
    if (script !== undefined) {
      console.log("script: ", script);
      // GET on selectedendpoint
    } else {
      showErrorMessage(`Feature ${key} not found. Refreshing...`);
      getFeaturesList().then((newFeatureList) => {
        this.refresh(newFeatureList);
      });
    }
  }

  public refresh(features: GadFeature[]) {
    this.features = features;
    console.log("this.features: ", this.features);
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview(this._view.webview);
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "resources", "features.js"));
    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "resources", "vscode.css"));
    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "resources", "main.css"));

    const nonce = getNonce();
    const featuresHtml = this.features
      .map((feature, index) => {
        return `
        <button class="feature-button" data-index="${index}" key="${feature.key}">
          ${feature.prettyName || feature.key}
        </button>
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
          ${this.features.length ? featuresHtml : "<p>No features available</p>"}
        </div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}

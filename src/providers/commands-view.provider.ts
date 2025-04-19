import * as vscode from "vscode";
import { GadCommand, GadCommandMap } from "../helpers/types";
import { getNonce } from "../helpers/helpers";
import { svgPlayIcon, svgStarEmptyIcon, svgWaitContinueIcon } from "../helpers/icons";

export class CommandsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "gad-helpers.commands";

  private _view?: vscode.WebviewView;
  private _actionsOnCommands = [] as (() => void)[];

  constructor(private readonly _extensionUri: vscode.Uri, private _commandList: GadCommand[]) {}

  public registerActionOnCommands(action: () => void) {
    this._actionsOnCommands.push(action);
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
        case "invokeCommand": {
          this.invokeCommand(data.key, data.instantExecute);
          break;
        }
      }
    });
  }

  private invokeCommand(commandName: string, instantExecute: boolean) {
    const command = this._commandList.find((command) => command.key === commandName);
    if (command === undefined) {
      return;
    }

    const commandFunc = command?.func;
    if (commandFunc === undefined) {
      return;
    }

    const commandParams = command?.params;

    if (commandParams !== undefined) {
      commandParams.instantExecute = instantExecute;
      commandFunc(commandParams);
    } else {
      commandFunc({ instantExecute: instantExecute });
    }

    setTimeout(() => {
      this._actionsOnCommands.forEach((action) => action());
    }, 5000);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "resources", "commands.js"));
    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "resources", "vscode.css"));
    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "resources", "main.css"));

    let buttonHTMLList = "";

    const tempList: GadCommandMap = {};
    for (const command of this._commandList) {
      if (!(command.category in tempList)) {
        tempList[command.category] = [];
      }
      tempList[command.category].push(command);
    }

    buttonHTMLList += `<h4 aria-label="favorites" id="id-favorites" class="collapsible nav-list__title">Favorites</h4>`;
    buttonHTMLList += `<div class="collapsible-content" aria-label="favorites-content" id="id-favorites-content"></div>`;

    for (const [category, commands] of Object.entries(tempList)) {
      // buttonHTMLList += `<button class="collapsible">${category}</button>`;
      buttonHTMLList += `<h4 aria-label="${category}" id="id-${category}" category="${category}" class="collapsible nav-list__title"><span>${category}</span></h4>`;

      buttonHTMLList += `<div class="collapsible-content">`;

      // buttonHTMLList += `<h4 aria-label="${category}" class="nav-list__title">${category}</h4>`;
      buttonHTMLList += `<nav class="nav-list" category="${category}">`;
      let idx = 0;

      const sortedCommands = commands.sort((a, b) => a.prettyName.localeCompare(b.prettyName));
      for (const { key, prettyName, params, onlyPasteAndRun, onlyPaste } of sortedCommands) {
        let toolTipText = prettyName;

        if (params !== undefined) {
          toolTipText += `: \`${params.command}\``;
        }

        let playButtons = "";
        if (onlyPaste === true) {
          // do nothing
        } else {
          playButtons = `<span class="run-icon" title="Paste & run" tooltip-text="Paste & run" key="${key}">${svgPlayIcon}</span>`;
        }
        if (onlyPasteAndRun === true) {
          // do nothing
        } else {
          playButtons += `<span class="pause-run-icon" title="Paste" tooltip-text="Paste" key="${key}">${svgWaitContinueIcon}</span>`;
        }
        playButtons += `<span class="star-icon" title="Add to favorites" key="${key}">${svgStarEmptyIcon}</span>`;

        buttonHTMLList += `
          <div class="nav-list__item list__item_not_clickable" category="${category}" index="${idx}" key="${key}">
            <div class="nav-list__link search-result" aria-label="${prettyName}" key="${key}" title="${toolTipText}" tooltip-text="${prettyName}" title="${prettyName}">
              <code-icon class="nav-list__icon" modifier="">
              </code-icon>
              <tooltip class="nav-list__label" itemKey="${key}" content="${prettyName}" >
                <span>${prettyName}</span>
              </tooltip>
            </div>${playButtons}
          </div>`;
        idx++;
      }

      buttonHTMLList += "</div>";
      buttonHTMLList += "</div>";
    }

    const searchInputHtml = `
      <input type="text" id="searchInput" class="search" placeholder="Search commands..." />
    `;

    const nonce = getNonce();

    return `<!DOCTYPE html>
              <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <meta http-equiv="Content-Security-Policy" content="default-src 'none';worker-src blob:; 
      child-src blob: gap:;
      img-src 'self' blob: data:; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
  
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
                  <link href="${styleVSCodeUri}" rel="stylesheet">
                  <link href="${styleMainUri}" rel="stylesheet">
  
              </head>
              <body class="commands-view">
                ${searchInputHtml}
                 ${buttonHTMLList}

                  <script nonce="${nonce}" src="${scriptUri}"></script>
              </body>
              </html>`;
  }
}

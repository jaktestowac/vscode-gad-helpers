import * as vscode from "vscode";
import { CommandsViewProvider } from "./providers/commands-view.provider";
import { SettingsViewProvider } from "./providers/settings-view.provider";
import { getCommandList } from "./scripts/commands";
import { getSettingsList } from "./scripts/settings";
import MyExtensionContext from "./helpers/my-extension.context";
import { ScriptsViewProvider } from "./providers/scripts-view.provider";
import { FeaturesViewProvider } from "./providers/features-view.provider";
import { EXTENSION_NAME, GAD_BASE_URL, GAD_BASE_URL_KEY, GAD_FEATURES_KEY } from "./helpers/consts";
import { showInformationMessage } from "./helpers/window-messages.helpers";
import { getGadScriptsFromPackageJson } from "./helpers/helpers";
import { getFeaturesList } from "./helpers/app.helpers";

export function activate(context: vscode.ExtensionContext) {
  MyExtensionContext.init(context);
  MyExtensionContext.instance.setWorkspaceValue("workspaceFolders", vscode.workspace.workspaceFolders);
  MyExtensionContext.instance.setWorkspaceValue("environmentVariables", []);
  MyExtensionContext.instance.setWorkspaceValue(GAD_BASE_URL_KEY, GAD_BASE_URL);

  const commandsList = getCommandList();

  for (const { key, func } of commandsList) {
    registerCommand(context, `${EXTENSION_NAME}.${key}`, func);
  }

  const settingsList = getSettingsList();

  for (const { key, func } of settingsList) {
    registerCommand(context, `${EXTENSION_NAME}.${key}`, func);
  }

  // Register the Sidebar Panel - Commands
  const commandsViewProvider = new CommandsViewProvider(context.extensionUri, commandsList);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(CommandsViewProvider.viewType, commandsViewProvider)
  );

  // Register the Sidebar Panel - Settings
  const settingsViewProvider = new SettingsViewProvider(context.extensionUri, settingsList);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(SettingsViewProvider.viewType, settingsViewProvider)
  );

  // Register the Sidebar Panel - Scripts
  const scriptsViewProvider = new ScriptsViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ScriptsViewProvider.viewType, scriptsViewProvider)
  );

  // Register the Sidebar Panel - Features
  const featuresViewProvider = new FeaturesViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(FeaturesViewProvider.viewType, featuresViewProvider)
  );

  registerCommand(context, `${EXTENSION_NAME}.refreshGadScripts`, () => {
    getGadScriptsFromPackageJson(true).then((scripts) => {
      scriptsViewProvider.refresh(scripts);
      showInformationMessage("Scripts from package.json refreshed");
    });
  });

  registerCommand(context, `${EXTENSION_NAME}.refreshGadFeatures`, () => {
    getFeaturesList().then((features) => {
      featuresViewProvider.refresh(features);
      showInformationMessage("Features refreshed");
    });
  });

  registerCommand(context, `${EXTENSION_NAME}.toggleHideShowCommands`, () => {});

  getGadScriptsFromPackageJson().then((scripts) => {
    scriptsViewProvider.refresh(scripts);
  });

  // Initialize features
  getFeaturesList().then((features) => {
    featuresViewProvider.refresh(features);
  });

  settingsViewProvider.checkAppUrl();
}

function registerCommand(context: vscode.ExtensionContext, id: string, callback: (...args: any[]) => any) {
  let disposable = vscode.commands.registerCommand(id, callback, context);
  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

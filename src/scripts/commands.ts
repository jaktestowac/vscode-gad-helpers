import * as vscode from "vscode";
import { CommandParameters, GadCommandsCategory, GadCommand } from "../helpers/types";
import MyExtensionContext from "../helpers/my-extension.context";
import {
  BASE_TERMINAL_NAME,
  GAD_BASE_URL,
  GAD_BASE_URL_KEY,
  GAD_PROJECT_DIR,
  GAD_PROJECT_PATH,
  GAD_PROJECT_PATH_KEY,
  GAD_REPO_URL,
} from "../helpers/consts";
import { executeCommandInTerminal, executeCommandsInTerminal } from "../helpers/terminal.helpers";
import { exitGadSignal, isGadRunning } from "../helpers/app.helpers";
import { showInformationMessage, showWarningMessage } from "../helpers/window-messages.helpers";
import { checkIfEveryDirectoryExists, checkIfGadCanBeInstalled } from "../helpers/helpers";
import path from "path";

export function getCommandList(): GadCommand[] {
  const commandsList: GadCommand[] = [
    {
      key: "runGad",
      func: runGad,
      prettyName: "Run GAD ",
      category: GadCommandsCategory.gad,
    },
    {
      key: "exitGad",
      func: exitGad,
      prettyName: "Exit GAD ",
      category: GadCommandsCategory.gad,
    },
    {
      key: "gadInit",
      func: gadInit,
      prettyName: "GAD Init (clone -> run)",
      category: GadCommandsCategory.setup,
    },
    {
      key: "gadGitPull",
      func: gadGitPull,
      prettyName: "GAD Git Pull",
      category: GadCommandsCategory.setup,
    },
    {
      key: "gadGitClone",
      func: gadGitClone,
      prettyName: "GAD Git Clone",
      category: GadCommandsCategory.setup,
    },
    {
      key: "gadNpmInstall",
      func: gadNpmInstall,
      prettyName: "GAD npm install",
      category: GadCommandsCategory.setup,
    },
    {
      key: "closeAllTerminals",
      func: closeAllTerminals,
      prettyName: vscode.l10n.t(`Close All GAD Terminals`, BASE_TERMINAL_NAME),
      category: GadCommandsCategory.mics,
      onlyPasteAndRun: true,
    },
  ];

  return commandsList;
}

function findCommandByKey(key: string): GadCommand | undefined {
  return getCommandList().find((command) => command.key === key);
}

function isCommandExecutedWithoutAsking(key: string): boolean {
  const command = findCommandByKey(key);
  const askForExecute = command?.askForExecute ?? false;
  if (askForExecute === true) {
    // Check if the user has set the instantExecute setting to true
    const instantExecute = MyExtensionContext.instance.getWorkspaceBoolValue("instantExecute");
    return instantExecute;
  }
  return false;
}

function closeAllTerminals() {
  vscode.window.terminals.forEach((terminal) => {
    if (terminal.name.includes(BASE_TERMINAL_NAME)) {
      terminal.dispose();
    }
  });
}

async function executeScript(params: CommandParameters) {
  const execute = params.instantExecute ?? isCommandExecutedWithoutAsking(params.key) ?? false;
  executeCommandInTerminal({
    command: params.command,
    execute,
    terminalName: params.terminalName,
  });
}

async function exitGad() {
  const response = await exitGadSignal();

  if (response.message) {
    showInformationMessage(vscode.l10n.t("Shut down succeeded."));
  } else {
    showWarningMessage(vscode.l10n.t("Shut down failed."));
  }
}

async function gadNpmInstall(params: CommandParameters) {
  const execute = params.instantExecute ?? isCommandExecutedWithoutAsking(params.key) ?? false;
  const value = MyExtensionContext.instance.getWorkspaceValue(GAD_PROJECT_PATH_KEY) ?? GAD_PROJECT_PATH;

  const additionalTerminalName = "install";

  executeCommandsInTerminal([
    {
      command: `cd ${value}`,
      execute,
      terminalName: additionalTerminalName,
    },
    {
      command: `npm install`,
      execute,
      terminalName: additionalTerminalName,
    },
  ]);
}

async function gadInit(params: CommandParameters) {
  const execute = params.instantExecute ?? isCommandExecutedWithoutAsking(params.key) ?? false;
  const value = MyExtensionContext.instance.getWorkspaceValue(GAD_PROJECT_PATH_KEY) ?? GAD_PROJECT_PATH;

  const fullPathWithoutProjectDir = value.split(path.sep).slice(0, -1).join(path.sep);
  const projectDir = value.split(path.sep).pop() ?? GAD_PROJECT_DIR;

  const canBeInstalled = checkIfGadCanBeInstalled(fullPathWithoutProjectDir);

  if (!canBeInstalled) {
    showWarningMessage(vscode.l10n.t("GAD cannot be cloned. Directory is not empty."));
    return;
  }

  const additionalTerminalName = "init";

  executeCommandsInTerminal([
    {
      command: `cd ${fullPathWithoutProjectDir}`,
      execute,
      terminalName: additionalTerminalName,
    },
    {
      command: `git clone ${GAD_REPO_URL}`,
      execute,
      terminalName: additionalTerminalName,
    },
    {
      command: `cd ${projectDir}`,
      execute,
      terminalName: additionalTerminalName,
    },
    {
      command: `npm install`,
      execute,
      terminalName: additionalTerminalName,
    },
    {
      command: `npm run start`,
      execute,
      terminalName: additionalTerminalName,
    },
  ]);
}

async function gadGitClone(params: CommandParameters) {
  const execute = params.instantExecute ?? isCommandExecutedWithoutAsking(params.key) ?? false;
  const value = MyExtensionContext.instance.getWorkspaceValue(GAD_PROJECT_PATH_KEY) ?? GAD_PROJECT_PATH;

  const fullPathWithoutProjectDir = value.split(path.sep).slice(0, -1).join(path.sep);
  const projectDir = value.split(path.sep).pop() ?? GAD_PROJECT_DIR;

  const canBeInstalled = checkIfGadCanBeInstalled(fullPathWithoutProjectDir);

  if (!canBeInstalled) {
    showWarningMessage(vscode.l10n.t("GAD cannot be cloned. Directory is not empty."));
    return;
  }

  const additionalTerminalName = "clone";

  executeCommandsInTerminal([
    {
      command: `cd ${value}`,
      execute,
      terminalName: additionalTerminalName,
    },
    {
      command: `git clone ${GAD_REPO_URL}`,
      execute,
      terminalName: additionalTerminalName,
    },
  ]);
}

async function gadGitPull(params: CommandParameters) {
  const execute = params.instantExecute ?? isCommandExecutedWithoutAsking(params.key) ?? false;
  const value = MyExtensionContext.instance.getWorkspaceValue(GAD_PROJECT_PATH_KEY) ?? GAD_PROJECT_PATH;

  const additionalTerminalName = "pull";

  executeCommandsInTerminal([
    {
      command: `cd ${value}`,
      execute,
      terminalName: additionalTerminalName,
    },
    {
      command: `git pull`,
      execute,
      terminalName: additionalTerminalName,
    },
  ]);
}

async function runGad(params: CommandParameters) {
  const execute = params.instantExecute ?? isCommandExecutedWithoutAsking(params.key) ?? false;
  const value = MyExtensionContext.instance.getWorkspaceValue(GAD_PROJECT_PATH_KEY) ?? GAD_PROJECT_PATH;
  const addr = MyExtensionContext.instance.getWorkspaceValue(GAD_BASE_URL_KEY) ?? GAD_BASE_URL;

  const additionalTerminalName = "run";

  isGadRunning().then((isRunning) => {
    if (isRunning) {
      showWarningMessage(vscode.l10n.t("GAD is already running at {0}", addr));
      return;
    }

    const canBeInstalled = checkIfEveryDirectoryExists(value);
    if (!canBeInstalled) {
      showWarningMessage(vscode.l10n.t("GAD cannot be run. Directory does not exist."));
      return;
    }

    executeCommandsInTerminal([
      {
        command: `cd ${value}`,
        execute,
        terminalName: additionalTerminalName,
      },
      {
        command: `npm run start`,
        execute,
        terminalName: additionalTerminalName,
      },
    ]);
    showInformationMessage(vscode.l10n.t("GAD is running at {0}", addr));
  });
}

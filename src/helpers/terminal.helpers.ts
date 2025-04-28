import { terminalCommands } from "../scripts/terminal";
import { BASE_TERMINAL_NAME } from "./consts";
import MyExtensionContext from "./my-extension.context";
import { ExecuteInTerminalParameters, TerminalCommand, TerminalCommandSet, TerminalType } from "./types";
import * as vscode from "vscode";

function getReuseTerminal(): boolean {
  const reuseTerminal = MyExtensionContext.instance.getWorkspaceValue("reuseTerminal");
  if (reuseTerminal === undefined) {
    MyExtensionContext.instance.setWorkspaceValue("reuseTerminal", true);
    return true;
  }
  return reuseTerminal;
}

export function executeCommandsInTerminal(parameters: ExecuteInTerminalParameters[]) {
  const reuseTerminal = getReuseTerminal();
  if (reuseTerminal) {
    executeCommandsInExistingTerminal(parameters);
  } else {
    executeCommandsInNewTerminal(parameters);
  }
}

function executeCommandsInNewTerminal(parameters: ExecuteInTerminalParameters[]) {
  let additionalName = "";
  if (parameters[0].terminalName !== undefined) {
    additionalName = `: ${parameters[0].terminalName}`;
  }
  const terminal = vscode.window.createTerminal(`${BASE_TERMINAL_NAME}${additionalName}`);
  for (const param of parameters) {
    executeCommand(terminal, param, false, false);
  }
}

function executeCommandsInExistingTerminal(parameters: ExecuteInTerminalParameters[]) {
  let existingTerminal = vscode.window.terminals.find((terminal) => terminal.name === BASE_TERMINAL_NAME);

  for (const param of parameters) {
    if (existingTerminal !== undefined) {
      executeCommand(existingTerminal, param);
    } else {
      existingTerminal = vscode.window.createTerminal(BASE_TERMINAL_NAME);
      executeCommand(existingTerminal, param);
    }
  }
}

export function executeCommandInTerminal(parameters: ExecuteInTerminalParameters) {
  const reuseTerminal = getReuseTerminal();
  
  if (reuseTerminal) {
    executeCommandInExistingTerminal(parameters);
  } else {
    executeCommandInNewTerminal(parameters);
  }
}

function executeCommandInNewTerminal(parameters: ExecuteInTerminalParameters) {
  let additionalName = "";
  if (parameters.terminalName !== undefined) {
    additionalName = `: ${parameters.terminalName}`;
  }
  const terminal = vscode.window.createTerminal(`${BASE_TERMINAL_NAME}${additionalName}`);
  executeCommand(terminal, parameters, false);
}

function executeCommandInExistingTerminal(parameters: ExecuteInTerminalParameters) {
  const existingTerminal = vscode.window.terminals.find((terminal) => terminal.name === BASE_TERMINAL_NAME);

  if (existingTerminal !== undefined) {
    executeCommand(existingTerminal, parameters);
    return;
  } else {
    const terminal = vscode.window.createTerminal(BASE_TERMINAL_NAME);
    executeCommand(terminal, parameters);
  }
}

function executeCommand(
  terminal: vscode.Terminal,
  parameters: ExecuteInTerminalParameters,
  focus = false,
  decorateCmd = true
) {
  let params = parameters;
  if (decorateCmd) {
    params = decorateCommand(terminal, parameters);
  }

  terminal.show(focus);
  terminal.sendText(params.command, params.execute);
}

// vscode-go/src/goEnvironmentStatus.ts
export function getTerminalType(terminal: vscode.Terminal): TerminalType {
  if (terminal.creationOptions === undefined) {
    return TerminalType.UNKNOWN;
  }

  const name = terminal.name.toLowerCase();
  let shellPath = (terminal.creationOptions as vscode.TerminalOptions).shellPath?.toLowerCase() ?? "";

  if (shellPath === "" || shellPath === undefined) {
    shellPath = vscode.env.shell;
  }

  if (name === "cmd" || shellPath.includes("cmd.exe")) {
    return TerminalType.CMD;
  } else if (["powershell", "pwsh"].includes(name) || shellPath.includes("powershell.exe")) {
    return TerminalType.POWERSHELL;
  } else if (name === "fish") {
    return TerminalType.FISH;
  } else if (["bash", "sh", "zsh", "ksh"].includes(name)) {
    return TerminalType.BASH;
  }
  return TerminalType.UNKNOWN;
}

export function getMethodForShell(terminal: vscode.Terminal, methodSet: TerminalCommandSet): TerminalCommand {
  const terminalType = getTerminalType(terminal);
  return methodSet[terminalType];
}

export function setEnvVariableInTerminal(terminal: vscode.Terminal, key: string, value: string, execute = false) {
  const setVariable = getMethodForShell(terminal, terminalCommands.setVariable);
  terminal.sendText(setVariable(key, value), execute);
}

export function clearTerminal(terminal: vscode.Terminal, execute = false) {
  const clear = getMethodForShell(terminal, terminalCommands.clear);
  terminal.sendText(clear(), execute);
}

export function decorateCommand(
  terminal: vscode.Terminal,
  params: ExecuteInTerminalParameters
): ExecuteInTerminalParameters {
  const readOnlyMode = MyExtensionContext.instance.getWorkspaceValue("readOnlyMode");
  if (readOnlyMode) {
    const setVariable = getMethodForShell(terminal, terminalCommands.setVariable);
    const cmdToSetEnvVar = setVariable("READ_ONLY", "1");
    const concatCommands = getMethodForShell(terminal, terminalCommands.concatCommands);
    params.command = concatCommands(cmdToSetEnvVar, params.command);
  }

  const envVariables = MyExtensionContext.instance.getWorkspaceValue("environmentVariables");

  if (envVariables !== undefined && Object.keys(envVariables).length > 0) {
    const setVariable = getMethodForShell(terminal, terminalCommands.setVariable);
    const concatCommands = getMethodForShell(terminal, terminalCommands.concatCommands);
    for (const [key, value] of Object.entries(envVariables)) {
      const cmdToSetEnvVar = setVariable(key, value as string);
      params.command = concatCommands(cmdToSetEnvVar, params.command);
    }
  }
  return params;
}

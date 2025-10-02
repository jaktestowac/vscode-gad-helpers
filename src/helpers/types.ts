export interface ExecuteInTerminalParameters {
  command: string;
  execute?: boolean;
  terminalName?: string | undefined;
}

export interface GadAboutStatus {
  version?: string;
  error?: string;
  message?: string;
  status?: string;
  statusCode?: number;
}

export interface GadRestoreListResponse {
  error?: string;
  message?: string;
  dbRestoreList?: {
    name: string;
    path: string;
  }[];
}

export interface GadConfigResponse {
  config?: { [key: string]: boolean };
  statusCode?: number;
  error?: string;
}

export interface CommandParameters {
  key: string;
  command: string;
  instantExecute?: boolean;
  terminalName?: string;
  additionalParameters?: string;
}

export interface GadCommand {
  key: string;
  func: (...args: any[]) => any;
  prettyName: string;
  category: string;
  askForExecute?: boolean;
  terminalName?: string;
  params?: CommandParameters;
  onlyPasteAndRun?: boolean;
  onlyPaste?: boolean;
  refreshSettings?: boolean;
  instantExecute?: boolean;
  textBoxInput?: {
    prompt: string;
    placeHolder?: string;
    value?: string;
  };
}

export interface GadFeature {
  key: string;
  prettyName?: string;
  description?: string;
  value: boolean;
}

export interface CheckResult {
  success: boolean;
  message: string;
}

export interface GadStatus {
  key: string;
  prettyName?: string;
}

export interface GadSettings {
  key: string;
  defaultValue?: string | boolean;
  func: (...args: any[]) => any;
  prettyName?: string;
  prettyNameAriaLabel?: string;
  category: string;
  type: string;
  invokeCustomActionButton?: {
    name: string;
    icon: string;
    actionName: string;
  };
}

export interface GadScripts {
  key: string;
  script: string;
  prettyName?: string;
}

export interface Map {
  [key: string]: string | undefined | Map | GadCommand | GadCommand[];
}

export interface GadCommandMap {
  [key: string]: GadCommand[];
}

export interface GadSettingsMap {
  [key: string]: GadSettings[];
}

export interface GadFeaturesMap {
  [key: string]: GadFeature[];
}

export interface GadScriptsMap {
  [key: string]: GadScripts[];
}

export interface KeyValuePairs {
  [key: string]: string;
}

export interface NameValuePair {
  name: string;
  value: string;
}

export enum GadCommandsCategory {
  gad = "Gad",
  setup = "Setup",
  project = "Project",
  restoreDb = "Restore DB",
  testing = "Testing",
  mcp = "MCP",
  mics = "Misc",
}

export enum GadSettingsCategory {
  general = "General",
  mics = "Misc",
}

export enum GadSettingsType {
  checkbox = "checkbox",
  input = "input",
  directorySelector = "directorySelector",
}

export enum CommandComposerCategory {
  general = "General",
}

export enum TerminalType {
  CMD = "cmd",
  POWERSHELL = "powershell",
  FISH = "fish",
  BASH = "bash",
  UNKNOWN = "unknown",
}

export interface TerminalCommands {
  clear: TerminalCommandSet;
  setVariable: TerminalCommandSet;
  concatCommands: TerminalCommandSet;
  printAllEnvVariables: TerminalCommandSet;
}

export interface TerminalCommandSet {
  cmd: TerminalCommand;
  powershell: TerminalCommand;
  fish: TerminalCommand;
  bash: TerminalCommand;
  unknown: TerminalCommand;
}

export interface TerminalCommand {
  (...args: string[]): string;
}

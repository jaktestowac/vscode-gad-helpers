import * as vscode from "vscode";
import * as cp from "child_process";
import * as fs from "fs";
import MyExtensionContext from "./my-extension.context";
import { areWorkspaceFoldersSingle } from "./assertions.helpers";
import { showErrorMessage, showWarningMessage } from "./window-messages.helpers";
import path from "path";
import { GadScripts } from "./types";

export function openInBrowser(url: string) {
  vscode.env.openExternal(vscode.Uri.parse(url));
}

export function getNonce() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function getRandomString(length = 16) {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const execCommandInProjectDir = async (cmd: string) => {
  const currentDir = getWorkspaceFolder() ?? [];
  const directory = currentDir[0];
  return execShell(cmd, directory);
};

function getWorkspaceFolder() {
  return vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath);
}

const execShell = async (cmd: string, directory: string) =>
  new Promise((resolve, reject) => {
    cp.exec(cmd, { cwd: directory }, (err, out) => {
      if (err) {
        return reject(err);
      }
      return resolve(out);
    });
  });

export function isDirectoryEmpty(directory: string): boolean {
  const files = fs.readdirSync(directory);
  return files.length === 0;
}

export async function openWorkSpaceDirectory(dir: string) {
  const workspaceFolders = MyExtensionContext.instance.getWorkspaceValue("workspaceFolders");

  const workspacePath = workspaceFolders[0].uri.fsPath;
  const fullPath = path.join(workspacePath, dir);
  const folderUri = vscode.Uri.file(fullPath);
  await vscode.commands.executeCommand("vscode.openFolder", folderUri, true);
}

export async function openDirectory(dir: string) {
  const workspaceFolders = MyExtensionContext.instance.getWorkspaceValue("workspaceFolders");

  const workspacePath = workspaceFolders[0].uri.fsPath;
  const fullPath = path.join(workspacePath, dir);
  const folderUri = vscode.Uri.file(fullPath);

  await vscode.env.openExternal(folderUri);
}

export async function getGadScriptsFromPackageJson(verbose = false): Promise<GadScripts[]> {
  const workspaceFolders = MyExtensionContext.instance.getWorkspaceValue("workspaceFolders");

  const checkResult = areWorkspaceFoldersSingle(workspaceFolders);
  if (!checkResult.success) {
    if (verbose) {
      showWarningMessage(checkResult.message);
    }
    return [];
  }

  const workspacePath = workspaceFolders[0].uri.fsPath;

  if (workspacePath === undefined) {
    if (verbose) {
      showWarningMessage("No workspace folder found");
    }
    return [];
  }

  const packageJsonPath = path.join(workspacePath, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    if (verbose) {
      showWarningMessage("No package.json found in the workspace");
    }
    return [];
  }

  const packageJsonContent = await vscode.workspace.fs.readFile(vscode.Uri.file(packageJsonPath));
  const packageJson = JSON.parse(packageJsonContent.toString());
  const foundKeys = Object.keys(packageJson.scripts);

  if (!foundKeys || foundKeys.length === 0) {
    if (verbose) {
      showErrorMessage("No scripts found in package.json");
    }
    return [];
  }

  const GadScripts: GadScripts[] = foundKeys.map((key) => {
    return { key, script: packageJson.scripts[key] };
  });

  return GadScripts;
}

export function checkIfEveryDirectoryExists(fullPath: string): boolean {
  const directories = fullPath.split(path.sep);
  let currentPath = "";
  for (const dir of directories) {
    if (dir === "") {
      continue;
    }
    if (currentPath === "") {
      currentPath = dir;
    } else {
      currentPath = path.join(currentPath, dir);
    }

    console.error(`Directory: ${currentPath}`);
    if (!fs.existsSync(currentPath)) {
      console.error(`Directory not: ${currentPath}`);
      return false;
    }
  }
  return true;
}

export function createEveryDirectory(fullPath: string): boolean {
  const directories = fullPath.split(path.sep);
  let currentPath = "";
  for (const dir of directories) {
    if (dir === "") {
      continue;
    }
    if (currentPath === "") {
      currentPath = dir;
    } else {
      currentPath = path.join(currentPath, dir);
    }

    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath, { recursive: true });
    }
  }
  return true;
}

export function checkIfDirectoryIsEmpty(dir: string): boolean {
  const files = fs.readdirSync(dir);
  return files.length === 0;
}

export function checkIfGadCanBeInstalled(fullPath: string): boolean {
  createEveryDirectory(fullPath);
  return checkIfDirectoryIsEmpty(fullPath);
}

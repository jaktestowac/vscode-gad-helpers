import * as vscode from "vscode";
import { BASE_MSG_NAME } from "./consts";

export function showErrorMessage(message: string): void {
  vscode.window.showErrorMessage(`${BASE_MSG_NAME}: ${message}`);
}

export function showInformationMessage(message: string): void {
  vscode.window.showInformationMessage(`${BASE_MSG_NAME}: ${message}`);
}

export function showWarningMessage(message: string): void {
  vscode.window.showWarningMessage(`${BASE_MSG_NAME}: ${message}`);
}

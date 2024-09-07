import * as vscode from "vscode";
import { BASE_TERMINAL_NAME } from "./consts";

export function showErrorMessage(message: string): void {
  vscode.window.showErrorMessage(`${BASE_TERMINAL_NAME}: ${message}`);
}

export function showInformationMessage(message: string): void {
  vscode.window.showInformationMessage(`${BASE_TERMINAL_NAME}: ${message}`);
}

export function showWarningMessage(message: string): void {
  vscode.window.showWarningMessage(`${BASE_TERMINAL_NAME}: ${message}`);
}

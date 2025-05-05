<p align="center">
  <img src="https://github.com/jaktestowac/vscode-gad-helpers/blob/main/media/gad-front-banner.png?raw=true" width="200px" alt="GAD application Logo">
</p>

<h1 align="center">VS Code - 🐍 GAD Helpers</h1>

# Description

This VS Code extension adds predefined commands for application **🐍 GAD**, allowing you to easily manage, run, and interact with the GAD testing application directly from VS Code.

## About GAD

Application (called 🦎 GAD) was prepared and developed only for testing purposes. It provides:

- A graphical user interface (GUI)
- REST API
- Integrated Swagger documentation

🦎 GAD includes features such as simple logic, statistics, charts, games, and various resources. It is intentionally designed with deliberately bugs🐛 and challenges to simulate real-world project complexities.

🦎 GAD is ideal for learning test automation, refining QA techniques, and practicing with scenarios encountered in diverse, real-world projects with diverse real-world scenarios.

Application 🦎 GAD is available for free (GPL-3.0 license) in repository [github.com/jaktestowac/gad-gui-api-demo](https://github.com/jaktestowac/gad-gui-api-demo)

# Features

The GAD Helpers extension provides the following features:

- **Commands Panel**: Execute common GAD operations (start, stop, clone, update)
- **Features Management**: Enable/disable GAD features directly from VS Code
- **Settings Configuration**: Easily configure GAD-related settings
- **Terminal Integration**: Run commands in integrated terminal with proper environment setup

<p align="center">
  <img src="https://github.com/jaktestowac/vscode-gad-helpers/blob/main/media/gad-helpers-screen?raw=true" width="200px" alt="GAD Helpers screenshot">
</p>

## Commands List

| Command                              | Description               |
| ------------------------------------ | ------------------------- |
| `gad-helpers.runGad`                 | Run GAD                   |
| `gad-helpers.exitGad`                | Exit GAD                  |
| `gad-helpers.gadInit`                | GAD Init (clone -> run)   |
| `gad-helpers.gadGitPull`             | GAD Git Pull              |
| `gad-helpers.gadGitClone`            | GAD Git Clone             |
| `gad-helpers.gadNpmInstall`          | GAD npm install           |
| `gad-helpers.closeAllTerminals`      | Close All GAD Terminals   |
| `gad-helpers.toggleHideShowCommands` | Toggle Hide/Show Commands |
| `gad-helpers.refreshGadScripts`      | Refresh GAD Scripts View  |
| `gad-helpers.refreshGadFeatures`     | Refresh GAD features      |

# Installation

There are several ways to install the GAD Helpers extension:

## From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "GAD Helpers"
4. Click "Install"

## From VSIX File

1. Download the latest .vsix file from the [releases page](https://github.com/jaktestowac/vscode-gad-helpers/releases)
2. Open VS Code
3. Go to Extensions (Ctrl+Shift+X)
4. Click the "..." menu and choose "Install from VSIX..."
5. Navigate to the downloaded file and install

# Getting Started

1. After installation, you'll see a new GAD Helpers icon in the Activity Bar
2. Click on it to open the GAD Helpers panels
3. Configure your GAD settings in the Settings panel:
   - Set the GAD Base URL (default: http://localhost:3000)
   - Configure the GAD Project Path

## Quick Start Guide

### Setting Up GAD for the First Time

1. Open the Commands panel
2. Run "GAD Init (clone -> run)" to clone and start the GAD application

### Starting/Stopping GAD

- Use "Run GAD" to start the application
- Use "Exit GAD" to stop the application

### Managing Features

1. Open the Features panel
2. Toggle features on/off as needed

# Configuration

The extension provides several configuration options:

- **GAD Base URL**: The URL where GAD is running (default: http://localhost:3000)
- **GAD Project Path**: The local path to the GAD project
- **Reuse Terminal**: Whether to reuse existing terminals for commands
- **Read-Only Mode**: Run GAD in read-only mode

## Support

If you encounter any issues or have questions, please file an issue on the [GitHub repository](https://github.com/jaktestowac/vscode-gad-helpers/issues).

# Contributing

This project is open source and we welcome contributions from the community. If you would like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them to your branch.
4. Push your branch to your forked repository.
5. Open a pull request to merge your changes into the main repository.

Please ensure that your code follows our coding guidelines and includes appropriate tests. We appreciate your contributions and look forward to reviewing your pull requests!

# For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**

Powered by [jaktestowac.pl](https://www.jaktestowac.pl/) team!

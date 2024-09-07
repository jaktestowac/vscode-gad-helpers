import { GadSettingsCategory, GadSettingsType, GadSettings } from "../helpers/types";

export function getSettingsList(): GadSettings[] {
  const commandsList: GadSettings[] = [
    {
      key: "reuseTerminal",
      func: reuseTerminal,
      prettyName: "Reuse Existing Terminal",
      category: GadSettingsCategory.general,
      type: GadSettingsType.checkbox,
    },
    {
      key: "verboseApiLogs",
      func: verboseApiLogs,
      prettyName: "GAD Verbose API logs",
      category: GadSettingsCategory.general,
      type: GadSettingsType.checkbox,
    },
  ];

  return commandsList;
}

function reuseTerminal() {}

function verboseApiLogs() {}

// function instantExecute() {}

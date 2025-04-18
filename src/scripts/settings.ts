import { GAD_BASE_URL, GAD_BASE_URL_KEY, GAD_PROJECT_PATH, GAD_PROJECT_PATH_KEY } from "../helpers/consts";
import { GadSettingsCategory, GadSettingsType, GadSettings } from "../helpers/types";

export function getSettingsList(): GadSettings[] {
  const commandsList: GadSettings[] = [
    {
      key: GAD_BASE_URL_KEY,
      func: dummyFunc,
      prettyName: "GAD Base URL",
      category: GadSettingsCategory.general,
      type: GadSettingsType.input,
      defaultValue: GAD_BASE_URL,
    },
    {
      key: GAD_PROJECT_PATH_KEY,
      defaultValue: GAD_PROJECT_PATH,
      func: dummyFunc,
      prettyName: "GAD Project Path",
      category: GadSettingsCategory.general,
      type: GadSettingsType.directorySelector,
    },
    {
      key: "reuseTerminal",
      func: reuseTerminal,
      prettyName: "Reuse Existing Terminal",
      category: GadSettingsCategory.mics,
      type: GadSettingsType.checkbox,
      defaultValue: true,
    },
    {
      key: "readOnlyMode",
      func: dummyFunc,
      prettyName: "GAD Read-Only Mode",
      category: GadSettingsCategory.mics,
      type: GadSettingsType.checkbox,
    },
  ];

  return commandsList;
}

function reuseTerminal() {}

function readOnlyMode() {}

function dummyFunc() {}

// function instantExecute() {}

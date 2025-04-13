import { GAD_BASE_URL, GAD_BASE_URL_KEY, GAD_PROJECT_PATH } from "../helpers/consts";
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
      key: "readOnlyMode",
      func: dummyFunc,
      prettyName: "GAD Read-Only Mode",
      category: GadSettingsCategory.general,
      type: GadSettingsType.checkbox,
    },
    {
      key: GAD_BASE_URL_KEY,
      func: dummyFunc,
      prettyName: "GAD Base URL",
      category: GadSettingsCategory.general,
      type: GadSettingsType.input,
    },
    {
      key: GAD_PROJECT_PATH,
      func: dummyFunc,
      prettyName: "GAD Project Path",
      category: GadSettingsCategory.general,
      type: GadSettingsType.directorySelector,
    },
  ];

  return commandsList;
}

function reuseTerminal() {}

function readOnlyMode() {}

function dummyFunc() {}

// function instantExecute() {}

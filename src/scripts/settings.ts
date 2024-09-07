import { GAD_BASE_URL, GAD_BASE_URL_KEY } from "../helpers/consts";
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
  ];

  return commandsList;
}

function reuseTerminal() {}

function readOnlyMode() {}

function dummyFunc() {}

// function instantExecute() {}

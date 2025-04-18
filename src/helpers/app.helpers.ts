import { GAD_BASE_URL_KEY } from "./consts";
import MyExtensionContext from "./my-extension.context";
import { GadAboutStatus } from "./types";

export async function checkAboutStatus(): Promise<GadAboutStatus> {
  const appBaseUrl = MyExtensionContext.instance.getWorkspaceValue(GAD_BASE_URL_KEY);
  const myUrl = `${appBaseUrl}/api/about`;

  return fetch(myUrl, {
    method: "GET",
  })
    .then((response) => response.json() as Promise<GadAboutStatus>)
    .catch((error) => {
      return { error } as GadAboutStatus;
    });
}

export async function exitGadSignal(): Promise<GadAboutStatus> {
  const appBaseUrl = MyExtensionContext.instance.getWorkspaceValue(GAD_BASE_URL_KEY);
  const myUrl = `${appBaseUrl}/api/debug/exit`;

  return fetch(myUrl, {
    method: "GET",
  })
    .then((response) => response.json() as Promise<GadAboutStatus>)
    .catch((error) => {
      return { error } as GadAboutStatus;
    });
}

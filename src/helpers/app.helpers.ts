import { GAD_BASE_URL_KEY } from "./consts";
import MyExtensionContext from "./my-extension.context";
import { GadAboutStatus, GadConfigResponse, GadFeature, GadRestoreListResponse } from "./types";

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

export async function isGadRunning(): Promise<boolean> {
  return checkAboutStatus().then((status) => {
    if (status?.version !== undefined) {
      return true;
    }
    return false;
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

export async function getRestoreGadDbListSignal(): Promise<GadRestoreListResponse> {
  const appBaseUrl = MyExtensionContext.instance.getWorkspaceValue(GAD_BASE_URL_KEY);
  const myUrl = `${appBaseUrl}/api/restore/list`;

  return fetch(myUrl, {
    method: "GET",
  })
    .then((response) => response.json() as Promise<GadRestoreListResponse>)
    .catch((error) => {
      return { error } as GadRestoreListResponse;
    });
}

export async function resetGadDbSignal(apiPath: string): Promise<GadAboutStatus> {
  const appBaseUrl = MyExtensionContext.instance.getWorkspaceValue(GAD_BASE_URL_KEY);
  const endpoint = apiPath === undefined ? "/api/restoreDB" : apiPath;

  const myUrl = `${appBaseUrl}${endpoint}`;

  return fetch(myUrl, {
    method: "GET",
  })
    .then((response) => response.json() as Promise<GadAboutStatus>)
    .catch((error) => {
      return { error } as GadAboutStatus;
    });
}

export async function changeFeatureValue(key: string, value: boolean): Promise<GadConfigResponse> {
  const body = JSON.stringify({ [key]: value });
  const appBaseUrl = MyExtensionContext.instance.getWorkspaceValue(GAD_BASE_URL_KEY);

  const myUrl = `${appBaseUrl}/api/config/features`;
  return fetch(myUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  })
    .then((response) => {
      if (response.status !== 200) {
        return {
          error: `Error ${response.status}: ${response.statusText}`,
          statusCode: response.status,
        } as GadConfigResponse;
      }
      return response.json() as Promise<GadConfigResponse>;
    })
    .catch((error) => {
      return { error } as GadConfigResponse;
    });
}

export async function getFeaturesList(): Promise<GadFeature[]> {
  const response = await getFeatureConfig();
  if (response.config === undefined) {
    return [] as GadFeature[];
  }

  const featureKeys = Object.keys(response.config);

  const features: GadFeature[] = featureKeys.map((key) => {
    return {
      key,
      prettyName: key,
      description: key,
      value: response.config ? response.config[key] : undefined,
    } as GadFeature;
  });

  return features;
}

export async function getFeatureConfig(): Promise<GadConfigResponse> {
  const appBaseUrl = MyExtensionContext.instance.getWorkspaceValue(GAD_BASE_URL_KEY);
  const myUrl = `${appBaseUrl}/api/config/features`;

  return fetch(myUrl, {
    method: "GET",
  })
    .then((response) => response.json() as Promise<GadConfigResponse>)
    .catch((error) => {
      return { error } as GadConfigResponse;
    });
}

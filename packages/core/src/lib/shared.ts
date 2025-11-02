import type { Ora } from "ora";
import type { PluginData } from "../plugin-types";
import type { CliOptions, JsonStructure } from "../types";
import { logger } from "./logger";
import { getDeepValue } from "./utils";

export const data: {
    memoryCache: Record<string, string>;
    localCache: Record<string, string>;
} = {
    memoryCache: {},
    localCache: {},
};

export const sharedData: {
    nodeDependencies: NonNullable<JsonStructure["dependencies"]>;
    cliOptions: CliOptions;
    // Done for simple jobs like dependencies done, file done
    jobResults: Record<string, string>; //! remove
    storedData: Record<string, string>; //! remove
    data: typeof data;
    onStartCallbacks: NonNullable<PluginData["onStart"]>[];
    onCompleteCallbacks: NonNullable<PluginData["onComplete"]>[];
    onDoneCallbacks: NonNullable<PluginData["onDone"]>[];
    jobModifierCallbacks: NonNullable<PluginData["jobModifier"]>[];
    spinner: Ora;
} = {
    nodeDependencies: [],
    cliOptions: {},
    jobResults: {},
    storedData: {},
    data,
    onStartCallbacks: [],
    onCompleteCallbacks: [],
    onDoneCallbacks: [],
    jobModifierCallbacks: [],
    spinner: null as unknown as Ora,
};

export function getValueFromSource(
    key: string,
    varType: "store" | "memory",
    defaultValue?: string,
    warn?: boolean,
): string | undefined {
    const value =
        varType === "store"
            ? getDeepValue(sharedData.storedData, key)
            : getDeepValue(sharedData.jobResults, key);

    if (warn && value === undefined) {
        logger.warn(`value not found for variable: '${key}'`);
    }
    return (value as string | undefined) ?? defaultValue;
}

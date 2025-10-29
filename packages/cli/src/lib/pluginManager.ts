import { logger, type Plugin, sharedData } from "@evoo/core";
import { installPlugin, resolvePlugin } from "./handle-plugin";

// biome-ignore lint/suspicious/noExplicitAny: This is a generic plugin manager
const loadedPlugins = new Map<string, Plugin<any, any>>();

export function isPluginLoaded(pluginName: string): boolean {
    return loadedPlugins.has(pluginName);
}

export function registerPlugin(
    pluginName: string,
    // biome-ignore lint/suspicious/noExplicitAny: This is a generic plugin manager
    plugin: Plugin<any, any>,
): void {
    if (loadedPlugins.has(pluginName)) {
        logger.warn(`Plugin '${pluginName}' is already loaded.`);
        return;
    }
    if (plugin.onStart) {
        sharedData.onStartCallbacks.push(plugin.onStart);
    }
    if (plugin.onComplete) {
        sharedData.onCompleteCallbacks.push(plugin.onComplete);
    }
    if (plugin.onDone) {
        sharedData.onDoneCallbacks.push(plugin.onDone);
    }
    loadedPlugins.set(pluginName, plugin);
}

export async function loadPlugin(pluginName: string): Promise<void> {
    if (isPluginLoaded(pluginName)) {
        return;
    }

    let pluginPath = await resolvePlugin(pluginName);

    if (!pluginPath) {
        //!
        // if (
        //     (await prompts.confirm({
        //         message: `Do you want to install plugin '${pluginName}'?`,
        //         initialValue: true,
        //     })) !== true
        // ) {
        //     return;
        // }

        logger.warn(
            `Plugin '${pluginName}' not found. Attempting to install it...`,
        );
        try {
            await installPlugin(pluginName);
            pluginPath = await resolvePlugin(pluginName);

            if (!pluginPath) {
                throw new Error(
                    `Failed to resolve plugin '${pluginName}' after installation.`,
                );
            }
        } catch (installError) {
            logger.error(`Failed to install plugin '${pluginName}'.`);
            throw installError;
        }
    }

    const plugin = await import(pluginPath);
    registerPlugin(pluginName, plugin.default);
}

export function getJobExecutor(
    jobType: string,
    // biome-ignore lint/suspicious/noExplicitAny: This is a generic plugin manager
): ((job: any, sharedContext: any) => Promise<void>) | null {
    for (const plugin of Array.from(loadedPlugins.values())) {
        if (jobType in plugin.jobs) {
            // biome-ignore lint/suspicious/noExplicitAny: This is a generic plugin manager
            return plugin.jobs[jobType] as any;
        }
    }
    return null;
}

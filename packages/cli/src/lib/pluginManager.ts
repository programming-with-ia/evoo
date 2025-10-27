import { Plugin, installDependencies } from "@evoo/core";
import { logger } from "@evoo/core";

const loadedPlugins = new Map<string, Plugin>();

export function isPluginLoaded(pluginName: string): boolean {
    return loadedPlugins.has(pluginName);
}

export function registerPlugin(pluginName: string, plugin: Plugin): void {
    if (loadedPlugins.has(pluginName)) {
        logger.warn(`Plugin '${pluginName}' is already loaded.`);
        return;
    }
    loadedPlugins.set(pluginName, plugin);
}

export async function loadPlugin(pluginName: string): Promise<void> {
    if (isPluginLoaded(pluginName)) {
        return;
    }

    const importAndRegister = async () => {
        const plugin = await import(pluginName);
        registerPlugin(pluginName, plugin.default);
    };

    try {
        await importAndRegister();
    } catch (error) {
        logger.warn(`Failed to load plugin '${pluginName}'. Attempting to install it...`);
        try {
            await installDependencies([pluginName], true);
            await importAndRegister();
        } catch (installError) {
            logger.error(`Failed to install or load plugin '${pluginName}':`, installError);
        }
    }
}

export function getJobExecutor(jobType: string): ((job: any) => Promise<void>) | null {
    for (const plugin of Array.from(loadedPlugins.values())) {
        if (jobType in plugin.jobs) {
            return plugin.jobs[jobType];
        }
    }
    return null;
}

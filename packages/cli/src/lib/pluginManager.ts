import { pathToFileURL } from "node:url";
import {
	Core,
	getLatestVersion,
	isValidUrl,
	logger,
	type Plugin,
	type PluginData,
	sharedData,
} from "@evoo/core";
import {
	cacheDirectPlugin,
	cacheUrlPlugin,
	resolveDirectPlugin,
} from "./handle-direct-plugin";
import { installPlugin, resolvePlugin } from "./handle-plugin";

async function loadUrlPlugin(url: string): Promise<void> {
	const pluginPath = await cacheUrlPlugin(url);
	const plugin = await import(pathToFileURL(pluginPath).href);
	registerPlugin(url, plugin.default);
}

async function loadDirectPlugin(pluginIdentifier: string): Promise<void> {
	let pluginName: string;
	let version: string | undefined;
	const atIndex = pluginIdentifier.lastIndexOf("@");

	if (atIndex > 0) {
		pluginName = pluginIdentifier.substring(0, atIndex);
		version = pluginIdentifier.substring(atIndex + 1);
		if (version.includes("/")) {
			pluginName = pluginIdentifier;
			version = undefined;
		}
	} else {
		pluginName = pluginIdentifier;
		version = undefined;
	}

	if (!version || version === "latest") {
		version = await getLatestVersion(pluginName);
	}

	let pluginPath = await resolveDirectPlugin(pluginName, version);
	if (!pluginPath) {
		pluginPath = await cacheDirectPlugin(pluginName, version);
	}

	const plugin = await import(pathToFileURL(pluginPath).href);
	registerPlugin(pluginIdentifier, plugin.default);
}

// biome-ignore lint/suspicious/noExplicitAny: This is a generic plugin manager
const loadedPlugins = new Map<string, PluginData>();

export function getPluginName(pluginIdentifier: string) {
    if (!pluginIdentifier.startsWith("@")) {
        return pluginIdentifier.split("@")[0];
    }

    const parts = pluginIdentifier.split("@");
    if (parts.length > 2) {
        return `@${parts[1]}`;
    }

    return pluginIdentifier;
}

export function isPluginLoaded(pluginName: string): boolean {
    return loadedPlugins.has(getPluginName(pluginName));
}

export function registerPlugin(
    pluginName: string,
    // biome-ignore lint/suspicious/noExplicitAny: This is a generic plugin manager
    _plugin: Plugin<any, any>,
): void {
    const plugin = _plugin(Core);
    const name = getPluginName(pluginName);
    if (loadedPlugins.has(name)) {
        logger.warn(`Plugin '${name}' is already loaded.`);
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
    if (plugin.jobModifier) {
        sharedData.jobModifierCallbacks.push(plugin.jobModifier);
    }
    loadedPlugins.set(name, plugin);
}

export async function loadPlugin(pluginIdentifier: string): Promise<void> {
	if (isValidUrl(pluginIdentifier)) {
		await loadUrlPlugin(pluginIdentifier);
		return;
	}
	if (pluginIdentifier.startsWith("!")) {
		await loadDirectPlugin(pluginIdentifier.slice(1));
		return;
	}

	if (isPluginLoaded(pluginIdentifier)) {
		return;
	}

	const pluginName = getPluginName(pluginIdentifier);
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
			`Plugin '${pluginIdentifier}' not found. Attempting to install it...`,
		);
		try {
			await installPlugin(pluginIdentifier);
			pluginPath = await resolvePlugin(pluginName);

			if (!pluginPath) {
				throw new Error(
					`Failed to resolve plugin '${pluginIdentifier}' after installation.`,
				);
			}
		} catch (installError) {
			logger.error(`Failed to install plugin '${pluginIdentifier}'.`);
			throw installError;
		}
	}

	const plugin = await import(pathToFileURL(pluginPath).href);
	registerPlugin(pluginIdentifier, plugin.default);
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

import crypto from "node:crypto";
import os from "node:os";
import path from "node:path";
import { Fetch, fs, logger } from "@evoo/core";

const DIRECT_PLUGINS_DIR = path.join(os.homedir(), ".evoo", "direct-plugins");
const LOCAL_PLUGINS_DIR = path.join(DIRECT_PLUGINS_DIR, ".locals");

export async function cacheUrlPlugin(url: string): Promise<string> {
	const hash = crypto.createHash("sha256").update(url).digest("hex");
	const pluginPath = path.join(LOCAL_PLUGINS_DIR, `${hash}.js`);

	const content = await Fetch(url, "text");

	await fs.ensureDir(path.dirname(pluginPath));
	await fs.writeFile(pluginPath, content);

	return pluginPath;
}

export function getDirectPluginPath(
	pluginName: string,
	version: string,
): string {
	return path.join(DIRECT_PLUGINS_DIR, pluginName, `${version}.js`);
}

export async function resolveDirectPlugin(
	pluginName: string,
	version: string,
): Promise<string | null> {
	const pluginPath = getDirectPluginPath(pluginName, version);
	if (await fs.pathExists(pluginPath)) {
		return pluginPath;
	}
	return null;
}

export async function cacheDirectPlugin(
	pluginName: string,
	version: string,
): Promise<string> {
	const url = `https://unpkg.com/${pluginName}@${version}/dist/index.js`;
	logger.info(`Downloading direct plugin from: ${url}`);
	const content = await Fetch(url, "text");

	const pluginPath = getDirectPluginPath(pluginName, version);
	await fs.ensureDir(path.dirname(pluginPath));
	await fs.writeFile(pluginPath, content);

	return pluginPath;
}

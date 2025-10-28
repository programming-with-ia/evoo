import path from "path";
import fs from "fs-extra";
import os from "os";
import { installDependencies } from "@evoo/core";
import { createRequire } from "node:module";
import { findProjectRoot } from "./find-project-root";

const globalPluginDir = path.join(os.homedir(), ".evoo", "plugins");

interface PluginStrategy {
  isGlobal: boolean;
  pluginDir: string;
}
let cachedStrategy: PluginStrategy | undefined = undefined;

async function ensureGlobalPluginDir() {
  fs.ensureDirSync(globalPluginDir);

  const packageJsonPath = path.join(globalPluginDir, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    fs.writeJsonSync(packageJsonPath, {
      name: "evoo-global-plugins",
      version: "1.0.0",
      private: true,
    });
  }
}

export async function getPluginStrategy(): Promise<PluginStrategy> {
  if (cachedStrategy) {
    return cachedStrategy;
  }

  const projectRoot = await findProjectRoot(process.cwd());

  if (projectRoot) {
    cachedStrategy = {
      isGlobal: false,
      pluginDir: projectRoot,
    };
    return cachedStrategy;
  }

  await ensureGlobalPluginDir();
  cachedStrategy = {
    isGlobal: true,
    pluginDir: globalPluginDir,
  };
  return cachedStrategy;
}

export async function installPlugin(pluginName: string) {
  const { isGlobal, pluginDir } = await getPluginStrategy();
  await installDependencies([pluginName], !isGlobal, pluginDir, isGlobal);
}

export async function resolvePlugin(pluginName: string): Promise<string | null> {
    const { pluginDir } = await getPluginStrategy();
    const require = createRequire(path.join(pluginDir, "index.js")); // Hack to get a base path for require
    try {
        return require.resolve(pluginName);
    } catch (e) {
        return null;
    }
}
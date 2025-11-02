import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fs, installDependencies } from "@evoo/core";
import { findProjectRoot } from "./find-project-root";
import { pathToFileURL } from "node:url";

const globalPluginDir = path.join(os.homedir(), ".evoo", "plugins");

interface PluginStrategy {
    isGlobal: boolean;
    pluginDir: string;
}
let cachedStrategy: PluginStrategy | undefined;

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
    await installDependencies(
        [pluginName],
        !isGlobal,
        pluginDir,
        isGlobal,
        true,
    );
}

export async function resolvePlugin(
    pluginName: string,
): Promise<string | null> {
    const { pluginDir } = await getPluginStrategy();
    console.log(pluginDir, pluginName);
    const pluginPackageJsonPath = path.join(
        pluginDir,
        "node_modules",
        pluginName,
        "package.json",
    );

    if (!fs.existsSync(pluginPackageJsonPath)){
        return null;
    }

    const packageJsonContent = fs.readFileSync(pluginPackageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageJsonContent);

    // Get the entry point from "exports" -> "." -> "import"
    const entryPoint = packageJson.exports?.["."]?.import;

    if (!entryPoint) {
        throw new Error(
            "Could not find \"exports.['.'].import\" in package.json",
        );
    }

    const pluginEntryPointPath = path.join(
        path.dirname(pluginPackageJsonPath),
        entryPoint, // The relative path (e.g., ./dist/index.js)
    );

    // 4. Convert the file path to a URL and import it
    // const pluginUrl = pathToFileURL(pluginEntryPointPath);
    // return (await import(pluginUrl.href)).default;
    return pluginEntryPointPath;
}

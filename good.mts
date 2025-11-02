import path from "node:path";
import { pathToFileURL } from "node:url";
import fs from "node:fs";

// 1. Define the exact path to the plugin's package.json
const pluginPackageJsonPath = path.join(
  "C:/Users/immi/.evoo/plugins",
  "node_modules",
  "@evoo/plugin-shadcn",
  "package.json"
);

async function loadEvooPlugin() {
  try {
    // 2. Read the package.json file to find the entry point
    const packageJsonContent = fs.readFileSync(pluginPackageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageJsonContent);

    // Get the entry point from "exports" -> "." -> "import"
    const entryPoint = packageJson.exports?.["."]?.import;

    if (!entryPoint) {
      throw new Error(
        'Could not find "exports.[\'.\'].import" in package.json'
      );
    }

    // 3. Construct the full path to the plugin's entry file
    //    path.dirname(pluginPackageJsonPath) = the plugin's root dir
    const pluginEntryPointPath = path.join(
      path.dirname(pluginPackageJsonPath),
      entryPoint // The relative path (e.g., ./dist/index.js)
    );

    // 4. Convert the file path to a URL and import it
    const pluginUrl = pathToFileURL(pluginEntryPointPath);
    const plugin = await import(pluginUrl.href);

    console.log("Plugin loaded successfully:", plugin);
    return plugin;

  } catch (err) {
    console.error(`Failed to load plugin '@evoo/plugin-shadcn':`, err);
  }
}

loadEvooPlugin();
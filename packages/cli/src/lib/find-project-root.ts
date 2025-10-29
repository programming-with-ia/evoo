import fs from "fs-extra";
import path from "path";

// Use a sentinel value to distinguish between "not yet searched" (undefined)
// and "searched and not found" (null).
let cachedProjectRoot: string | null | undefined;

export async function findProjectRoot(
    startDir: string,
): Promise<string | null> {
    if (cachedProjectRoot !== undefined) {
        return cachedProjectRoot;
    }

    let currentDir = startDir;

    while (currentDir !== path.parse(currentDir).root) {
        const packageJsonPath = path.join(currentDir, "package.json");
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = await fs.readJson(packageJsonPath);
            if (
                packageJson.dependencies?.["@evoo/cli"] ||
                packageJson.devDependencies?.["@evoo/cli"]
            ) {
                cachedProjectRoot = currentDir;
                return currentDir;
            }
        }
        currentDir = path.dirname(currentDir);
    }

    // If we've searched and found nothing, cache the null result.
    cachedProjectRoot = null;
    return null;
}

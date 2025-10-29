import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import type { JsonStructure } from "../types";
import { execWithSpinner } from "./exec";
import { getUserPkgManager } from "./getUserPkgManager";
import { globals as G } from "./globals";
import { logger } from "./logger";
import { prompts } from "./prompts";

// https://github.com/shadcn-ui/ui/blob/c9311f26fab488330e5ab349a347a1119d133be5/packages/shadcn/src/mcp/utils.ts#L9
// https://github.com/shadcn-ui/ui/blob/c9311f26fab488330e5ab349a347a1119d133be5/packages/shadcn/src/mcp/utils.ts#L48

/**
 * Runs the install command with appropriate package manager handling.
 */
export const installDependencies = async (
    packages: NonNullable<JsonStructure["dependencies"]>,
    dev: boolean = false,
    cwd: string = process.cwd(),
    isGlobal: boolean = false,
) => {
    // Convert input into an array of package install strings

    if (packages.length === 0) {
        return;
    }

    logger.warn("This feature is not fully tested for all package managers.");

    const pkgManager = isGlobal ? "npm" : getUserPkgManager();

    const packageJsonPath = path.join(cwd, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
        logger.error(`package.json not found in directory: ${cwd}`);
        return;
    }

    const packageJson = fs.readJsonSync(packageJsonPath, { encoding: "utf-8" });
    // Combine all dependency types into a single object for easy lookup
    const allDependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
        // ...packageJson.peerDependencies,
    };

    const filteredPackages: typeof packages = []; // Packages NOT in package.json
    const ignoredPackages: typeof packages = []; // Packages that ARE in package.json

    packages.forEach((pkg) => {
        // Find the last '@', which separates the name from the version
        const lastAt = pkg.lastIndexOf("@");
        // If '@' is found after the first character, extract the name part.
        // Otherwise, the whole string is the name.
        const pkgName = lastAt > 0 ? pkg.substring(0, lastAt) : pkg;

        if (pkgName in allDependencies) {
            ignoredPackages.push(pkg);
        } else {
            filteredPackages.push(pkg);
        }
    });

    if (ignoredPackages.length) {
        logger.warn(
            `The following packages are already listed in package.json and will be skipped: ${ignoredPackages.join(
                ", ",
            )}`,
        );
    }

    if (filteredPackages.length) {
        if (
            !(await prompts.confirm({
                message: `Are you sure to install pacakges: ${filteredPackages.join(" ")}`,
                initialValue: true,
            }))
        ) {
            return;
        }

        const devFlag = dev ? "-D" : "";
        const execOptions = { cwd, stderr: "inherit" } as const;
        const packagesString = filteredPackages.join(" ");

        switch (pkgManager) {
            case "npm":
                await execa(
                    "npm",
                    ["install", ...filteredPackages, devFlag],
                    execOptions,
                );
                return null;

            case "pnpm":
                return execWithSpinner(
                    `pnpm add ${packagesString} ${devFlag}`,
                    {
                        cwd,
                        onDataHandle: () => (data) => {
                            const text = data.toString();
                            if (text.includes("Progress")) {
                                logger.log(
                                    text.includes("|")
                                        ? (text.split(" | ")[1] ?? "")
                                        : text,
                                );
                            }
                        },
                    },
                );

            case "yarn":
                return execWithSpinner(
                    `yarn add ${packagesString} ${devFlag}`,
                    {
                        cwd,
                        onDataHandle: () => (data) => {
                            logger.log(data.toString());
                        },
                    },
                );

            case "bun":
                return execWithSpinner(`bun add ${packagesString} ${devFlag}`, {
                    cwd,
                    stdout: "ignore",
                });
        }
    }
};

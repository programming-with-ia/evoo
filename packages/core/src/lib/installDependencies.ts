import { execa, type StdinOption } from "execa";
import fs from "fs-extra";
import path from "path";
import { logger } from "./logger";
import { type PackageManager, getUserPkgManager } from "./getUserPkgManager";
import { globals as G } from "./globals";
import { prompts } from "./prompts";
import { JsonStructure } from "../types";

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

        const devFlag = dev ? ["-D"] : [];
        const execOptions = { cwd, stderr: "inherit" };

        switch (pkgManager) {
            case "npm":
                await execa(pkgManager, ["install", ...filteredPackages, ...devFlag], execOptions);
                return null;

            case "pnpm":
                return execWithSpinner(pkgManager, {
                    args: ["add", ...filteredPackages, ...devFlag],
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
                });

            case "yarn":
                return execWithSpinner(pkgManager, {
                    args: ["add", ...filteredPackages, ...devFlag],
                    cwd,
                    onDataHandle: () => (data) => {
                        logger.log(data.toString());
                    },
                });

            case "bun":
                return execWithSpinner(pkgManager, {
                    args: ["add", ...filteredPackages, ...devFlag],
                    cwd,
                    stdout: "ignore",
                });
        }
    }
};

/**
 * Executes command with Ora spinner.
 */
const execWithSpinner = async (
    pkgManager: string,
    options: {
        startMessage?: string;
        successMessage?: string;
        args?: string[];
        cwd?: string;
        stdout?: "pipe" | "ignore" | "inherit";
        onDataHandle?: () => (data: Buffer) => void;
    },
) => {
    const {
        onDataHandle,
        args,
        cwd = process.cwd(),
        stdout = "pipe",
        startMessage,
        successMessage,
    } = options;

    G.spinner.text = startMessage ?? `Running ${pkgManager} install <deps>...`;
    logger.info(G.spinner.text);

    const subprocess = execa(pkgManager, args, { cwd, stdout });

    await new Promise<void>((res, rej) => {
        if (onDataHandle) {
            subprocess.stdout?.on("data", onDataHandle());
        }

        subprocess.on("error", (e) => {
            logger.error(e.message);
            G.spinner.fail(`Error: ${e.message}`);
            rej(e);
        });

        subprocess.on("close", () => {
            logger.success(
                successMessage ?? `✅ complete dependencies installation`,
            );
            res();
        });
    });
};

/**
 * Adds one or more shadcn-ui components, showing a spinner during execution.
 *
 * @param {string[]} components - An array of component names to add.
 */
export const addShadcnComponents = async (components: string[]) => {
    if (components.length === 0) {
        return;
    }

    // 1. Validation checks
    if (!fs.pathExistsSync("components.json")) {
        G.spinner.fail(
            "Error: 'components.json' not found.\n" +
                "Please run 'npx shadcn-ui@latest init' to initialize your project first.",
        );
        return;
    }

    logger.warn(
        `Installing potentially untested shadcn components. Please verify their functionality after installation.`,
    );

    // 2. Determine the correct command and arguments
    const pkgManager = getUserPkgManager();
    let command: string;
    let args: string[];

    const componentArgs = ["add", ...components];

    switch (pkgManager) {
        case "pnpm":
            command = "pnpm";
            args = ["dlx", "shadcn@latest", ...componentArgs];
            break;
        case "yarn":
            command = "yarn";
            args = ["dlx", "shadcn@latest", ...componentArgs];
            break;
        case "bun":
            command = "bunx";
            args = ["--bun", "shadcn@latest", ...componentArgs];
            break;
        case "npm":
        default:
            command = "npx";
            args = ["shadcn@latest", ...componentArgs];
            break;
    }

    await execWithSpinner(command, {
        args,
        stdout: "inherit",
        startMessage: `Adding shadcn components: ${components.join(", ")}`,
        successMessage: `Successfully added component(s)!`,
    });
};

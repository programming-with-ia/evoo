import type { Plugin } from "@evoo/core";

type RegistryDependenciesJob = {
    type: "registryDependencies";
    registryDependencies: string | string[];
};

type ShadcnSharedContext = {
    registryDependencies?: string[];
};

const jobDependencies: string[] = [];

const shadcnPlugin: Plugin<
    { registryDependencies: RegistryDependenciesJob },
    ShadcnSharedContext
> = (core) => {
    return {
        jobs: {
            registryDependencies: async (job) => {
                const deps = Array.isArray(job.registryDependencies)
                    ? job.registryDependencies
                    : [job.registryDependencies];
                jobDependencies.push(...deps);
            },
        },
        onDone: async (context) => {
            const allDependencies = [
                ...jobDependencies,
                ...(context.registryDependencies ?? []),
            ];
            const uniqueDependencies = Array.from(new Set(allDependencies));

            if (uniqueDependencies.length < 1) return;

            if (!core.fs.pathExistsSync("components.json")) {
                core.sharedData.spinner.fail(
                    "Error: 'components.json' not found.\n" +
                        "Please run 'npx shadcn-ui@latest init' to initialize your project first.",
                );
                return;
            }
            core.logger.warn(
                `Installing potentially untested shadcn components. Please verify their functionality after installation.`,
            );

            const pkgManager = core.getUserPkgManager();
            let command: string;

            const componentsString = uniqueDependencies.join(" ");

            switch (pkgManager) {
                case "pnpm":
                    command = `pnpm dlx shadcn-ui@latest add ${componentsString}`;
                    break;
                case "yarn":
                    command = `yarn dlx shadcn-ui@latest add ${componentsString}`;
                    break;
                case "bun":
                    command = `bunx --bun shadcn-ui@latest add ${componentsString}`;
                    break;
                default:
                    command = `npx shadcn-ui@latest add ${componentsString}`;
                    break;
            }

            await core.execWithSpinner(command, {
                stdout: "inherit",
                startMessage: `Adding shadcn components: ${uniqueDependencies.join(", ")}`,
                successMessage: `Successfully added component(s)!`,
            });
        },
    };
};

export default shadcnPlugin;

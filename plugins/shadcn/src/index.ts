import {
    execWithSpinner,
    fs,
    globals as G,
    getUserPkgManager,
    logger,
    type Plugin,
} from "@evoo/core";

type RegistryDependenciesJob = {
    type: "registryDependencies";
    registryDependencies: string | string[];
};

type ShadcnSharedContext = {
    registryDependencies?: string[];
};

const addShadcnComponents = async (components: string[]) => {
    if (components.length === 0) {
        return;
    }

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

    const pkgManager = getUserPkgManager();
    let command: string;

    const componentsString = components.join(" ");

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

    await execWithSpinner(command, {
        stdout: "inherit",
        startMessage: `Adding shadcn components: ${components.join(", ")}`,
        successMessage: `Successfully added component(s)!`,
    });
};

const jobDependencies: string[] = [];

const shadcnPlugin: Plugin<
    { registryDependencies: RegistryDependenciesJob },
    ShadcnSharedContext
> = {
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

        if (uniqueDependencies.length > 0) {
            await addShadcnComponents(uniqueDependencies);
        }
    },
};

export default shadcnPlugin;

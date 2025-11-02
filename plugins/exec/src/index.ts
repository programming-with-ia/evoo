import type { Plugin } from "@evoo/core";

type ExecJob = {
    type: "exec";
    command: string;
    startMessage?: string;
    successMessage?: string;
};

const execPlugin: Plugin<{ exec: ExecJob }> = (core) => {
    return {
        jobs: {
            exec: async ({ command, startMessage, successMessage }) => {
                const shouldExecute = await core.prompts.confirm({
                    message: `Do you want to execute the following command: "${command}"?`,
                    initialValue: true,
                });

                if (shouldExecute) {
                    await core.execWithSpinner(command, {
                        startMessage: startMessage ?? `Executing: ${command}`,
                        successMessage:
                            successMessage ??
                            "✅ Command finished successfully",
                        cwd: process.cwd(),
                        stdout: "inherit",
                    });
                }
            },
        },
    };
};

export default execPlugin;

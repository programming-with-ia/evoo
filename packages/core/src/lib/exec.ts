import { execaCommand } from "execa";
import { logger } from "./logger";
import { globals as G } from "./globals";

/**
 * Executes command with Ora spinner.
 */
export const execWithSpinner = async (
    command: string,
    options: {
        startMessage?: string;
        successMessage?: string;
        cwd?: string;
        stdout?: "pipe" | "ignore" | "inherit";
        onDataHandle?: () => (data: Buffer) => void;
    },
) => {
    const {
        onDataHandle,
        cwd = process.cwd(),
        stdout = "pipe",
        startMessage,
        successMessage,
    } = options;

    G.spinner.text = startMessage ?? `Running ${command}...`;
    logger.info(G.spinner.text);

    const subprocess = execaCommand(command, { cwd, stdout });

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
                successMessage ?? `✅ Command executed successfully`,
            );
            res();
        });
    });
};

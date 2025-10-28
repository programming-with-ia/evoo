#!/usr/bin/env node
import {
    addShadcnComponents,
    type CliOptions,
    config,
    globals as G,
    installDependencies,
    type JsonStructure,
    logger,
    type Settings,
    sharedData,
} from "@evoo/core";
import chalk from "chalk";
import { Command } from "commander";
import fs from "fs-extra";
import ora from "ora";
import path from "path";
import { processJson } from "./processJson";

const storeFile = ".evoo.json";
const program = new Command();

program
    .version("1.0.0")
    .argument("<jsonPath>", "URL or local path of the JSON file")
    .option("-d, --dir <directory>", "Set working directory")
    .option("-f, --force", "Force overwrite files if they already exist")
    .option(
        "-e, --extend-path <extendPath>",
        "extend files path from current working dir",
    )
    .action(async (jsonPath: string, options: CliOptions) => {
        G.spinner = ora("Fetching JSON...").start();

        try {
            if (options.dir) {
                process.chdir(options.dir);
                logger.info(`Working directory: ${process.cwd()}`);
            }

            sharedData.cliOptions = options;

            if (fs.pathExistsSync(storeFile)) {
                sharedData.storedData = fs.readJsonSync(
                    path.join(process.cwd(), storeFile),
                );
            }

            await processJson(jsonPath);

            for (const callback of sharedData.onCompleteCallbacks) {
                await callback();
            }

            if (Object.keys(sharedData.storedData).length > 0) {
                fs.writeJsonSync(
                    path.join(process.cwd(), storeFile),
                    sharedData.storedData,
                );
            }

            //! this feature is not fully tested for all package managers tested
            await installDependencies(sharedData.nodeDependencies);
            await addShadcnComponents(sharedData.registryDependencies);

            G.spinner.succeed("Files added successfully!");
        } catch (error) {
            G.spinner.fail(chalk.red(`Error: ${(error as Error).message}`));
            throw error;
        }
    });

program
    .command("get <key>")
    .description("Retrieve the value associated with a given key")
    .action((key: keyof Settings) => {
        const value = config.get(key);
        if (value !== undefined) {
            console.log(`Value for "${key}": ${value}`);
        } else {
            console.log(`Key "${key}" not found.`);
        }
    });

program
    .command("set <key> <value>")
    .description(
        "Assign a value to a specific key (creates or updates the key-value pair)",
    )
    .action((key: keyof Settings, value: Settings[typeof key]) => {
        config.set(key, value, true);
        console.log(`Successfully set "${key}" to "${value}".`);
    });

program.parse();

export type { JsonStructure };

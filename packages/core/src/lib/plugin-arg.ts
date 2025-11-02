import chalk from "chalk";
import { execa, execaCommand } from "execa";
import fs from "fs-extra";
import { execWithSpinner } from "./exec";
import { Fetch } from "./fetch";
import { getUserPkgManager } from "./getUserPkgManager";
import { isValidUrl } from "./helpers";
import { logger } from "./logger";
import { parseVar } from "./match-vars";
import { prompts } from "./prompts";
import { sharedData } from "./shared";
import { getDeepValue, setDeepValue } from "./utils";

export const Core = {
    prompts,
    chalk,
    fs,
    logger,
    sharedData,
    getDeepValue,
    setDeepValue,
    getUserPkgManager,
    Fetch,
    execWithSpinner,
    execaCommand,
    execa,
    isValidUrl,
    parseVar,
} as const;

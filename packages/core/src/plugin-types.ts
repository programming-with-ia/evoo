import type { Job } from "./types";

/**
 * Defines the structure for a plugin.
 * A plugin allows extending the functionality of the CLI tool
 * by adding new job types.
 */
export type Plugin = {
    /**
     * A map of job definitions provided by the plugin.
     * The key is the job type, and the value is a function
     * that executes the job.
     */
    jobs: Record<string, (job: Job) => Promise<void>>;
};

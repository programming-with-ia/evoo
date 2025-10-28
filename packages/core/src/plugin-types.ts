import type { Job } from "./types";

// Every custom job type should at least have a `type` property.
type CustomJobType = { type: string } & Record<string, unknown>;

type JobExecutor<T> = (job: T) => Promise<void>;

type JobMap<T extends Record<string, CustomJobType>> = {
    [K in keyof T]: JobExecutor<T[K]>;
};

/**
 * Defines the structure for a plugin.
 * A plugin allows extending the functionality of the CLI tool
 * by adding new job types.
 */
export type Plugin<T extends Record<string, CustomJobType> = Record<string, any>> = {
    /**
     * A map of job definitions provided by the plugin.
     * The key is the job type, and the value is a function
     * that executes the job.
     */
    jobs: JobMap<T>;
};

export type PluginJobs<T extends Plugin<Record<string, any>>> =
    T extends Plugin<infer R> ? Values<R> : never;

type Values<T> = T[keyof T];

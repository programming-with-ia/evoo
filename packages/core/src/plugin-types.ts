import type { BaseJob } from "./types";

/**
 * Every custom job type should at least have a `type` property.
 */
export type CustomJobType = BaseJob & Record<string, unknown>;

type JobExecutor<T, C> = (job: T, sharedContext: C) => Promise<void>;

type JobMap<T extends Record<string, CustomJobType>, C> = {
    [K in keyof T]: JobExecutor<T[K], C>;
};

/**
 * Defines the structure for a plugin.
 * A plugin allows extending the functionality of the CLI tool
 * by adding new job types.
 */
export type Plugin<
    T extends Record<string, CustomJobType>,
    C extends Record<string, unknown> = Record<string, unknown>,
> = {
    /**
     * A map of job definitions provided by the plugin.
     * The key is the job type, and the value is a function
     * that executes the job.
     */
    jobs: JobMap<T, C>;
    /**
     * An optional callback function that is executed before the main
     * JSON processing begins.
     */
    onStart?: (sharedContext: C) => Promise<void>;
    /**
     * An optional callback function that is executed after the main
     * JSON processing is complete.
     */
    onComplete?: (sharedContext: C) => Promise<void>;
    /**
     * An optional callback function that is executed after dependency
     * installation is complete.
     */
    onDone?: (sharedContext: C) => Promise<void>;
};

export type PluginJobs<T> = T extends Plugin<infer R> ? R[keyof R] : never;

export type PluginSharedContext<T> = T extends Plugin<
    // biome-ignore lint/suspicious/noExplicitAny: This is a generic type utility
    any,
    infer C
>
    ? C
    : Record<string, unknown>;

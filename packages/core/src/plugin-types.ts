import type { Except, Simplify, ValueOf } from "type-fest";
import type { Core } from "./lib/plugin-arg";
import type { BaseJob } from "./types";

/**
 * Every custom job type should at least have a `type` property.
 */
export type CustomJobType = BaseJob & Record<string, unknown>;

type JobExecutor<T, C> = (job: T, sharedContext: C) => Promise<void>;

/**
 * Defines the structure for a plugin.
 * A plugin allows extending the functionality of the CLI tool
 * by adding new job types.
 */
export type Plugin<
    T extends Except<CustomJobType, "type">,
    C extends Record<string, unknown> = Record<string, unknown>,
> = (core: typeof Core) => {
    /**
     * A map of job definitions provided by the plugin.
     * The key is the job type, and the value is a function
     * that executes the job.
     */
    jobs?: {
        [K in keyof T]: JobExecutor<
            Simplify<T[K] & Except<BaseJob, "type"> & { type: K }>,
            C
        >;
    };
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

    /**
     * An optional function that can modify a job before it is processed.
     * This can be used to inject default values, transform properties,
     * or add/remove conditions based on global state.
     */
    jobModifier?: <T extends BaseJob>(jobs: T, sharedContext: C) => Promise<T>;
};

export type PluginData = ReturnType<Plugin<any, any>>;

export type PluginJobTypes<P extends Plugin<any, any>> = Parameters<
    ValueOf<NonNullable<ReturnType<P>["jobs"]>>
>[0];

//! remove this
export type PluginJobs<T> = T extends Plugin<infer R> ? R[keyof R] : never;

export type PluginSharedContext<T> = T extends Plugin<
    // biome-ignore lint/suspicious/noExplicitAny: This is a generic type utility
    any,
    infer C
>
    ? C
    : Record<string, unknown>;

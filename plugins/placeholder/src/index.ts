import type { Plugin } from "@evoo/core";

type GreetJob = {
    type: "greet";
    message?: string;
};

type PlaceholderSharedContext = {
    greetings: string;
};

const placeholderPlugin: Plugin<
    { greet: GreetJob },
    PlaceholderSharedContext
> = (core) => ({
    jobs: {
        greet: async (job, context) => {
            core.logger.info(context.greetings);

            if (job.message) {
                core.logger.log(`Your message is: ${job.message}`);
            }
        },
    },
    onStart: async (context) => {
        core.logger.info("Placeholder plugin started!");
        core.logger.info(`Greetings from shared context: ${context.greetings}`);
    },
    onComplete: async (context) => {
        core.logger.info("Placeholder plugin completed!");
        core.logger.info(`Greetings from shared context: ${context.greetings}`);
    },
    onDone: async (context) => {
        core.logger.info("Placeholder plugin done!");
        core.logger.info(`Greetings from shared context: ${context.greetings}`);
    },
});

export default placeholderPlugin;

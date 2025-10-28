import { logger, type Plugin } from "@evoo/core";

type GreetJob = {
    type: "greet";
    message?: string;
};

type PlaceholderSharedContext = {
    greetings: string;
};

const placeholderPlugin: Plugin<{ greet: GreetJob }, PlaceholderSharedContext> =
    {
        jobs: {
            greet: async (job, context) => {
                logger.info(context.greetings);

                if (job.message) {
                    logger.log(`Your message is: ${job.message}`);
                }
            },
        },
        onStart: async (context) => {
            logger.info("Placeholder plugin started!");
            logger.info(`Greetings from shared context: ${context.greetings}`);
        },
        onComplete: async (context) => {
            logger.info("Placeholder plugin completed!");
            logger.info(`Greetings from shared context: ${context.greetings}`);
        },
        onDone: async (context) => {
            logger.info("Placeholder plugin done!");
            logger.info(`Greetings from shared context: ${context.greetings}`);
        },
    };

export default placeholderPlugin;

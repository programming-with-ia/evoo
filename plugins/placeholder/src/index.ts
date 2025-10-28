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
    };

export default placeholderPlugin;

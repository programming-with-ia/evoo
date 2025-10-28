import { logger, type Plugin } from "@evoo/core";

type GoodbyeJob = {
    type: "goodbye";
    message?: string;
};

const goodbyePlugin: Plugin<{ goodbye: GoodbyeJob }> = {
    jobs: {
        goodbye: async (job) => {
            logger.info("Goodbye from the goodbye plugin!");

            if (job.message) {
                logger.log(`Your message is: ${job.message}`);
            }
        },
    },
};

export default goodbyePlugin;

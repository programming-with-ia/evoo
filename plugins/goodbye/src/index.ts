import type { Plugin } from "@evoo/core";

type GoodbyeJob = {
    type: "goodbye";
    message?: string;
};

const goodbyePlugin: Plugin<{ goodbye: GoodbyeJob }> = (core) => ({
    jobs: {
        goodbye: async (job) => {
            core.logger.info("Goodbye from the goodbye plugin!");

            if (job.message) {
                core.logger.log(`Your message is: ${job.message}`);
            }
        },
    },
});

export default goodbyePlugin;

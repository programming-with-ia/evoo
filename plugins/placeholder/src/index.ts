import { Plugin, logger } from "@evoo/core";

type GreetJob = {
  type: "greet";
  message?: string;
};

const placeholderPlugin: Plugin<{ greet: GreetJob }> = {
  jobs: {
    greet: async (job) => {
      logger.info("Hello from the placeholder plugin!");

      if (job.message) {
        logger.log(`Your message is: ${job.message}`);
      }
    },
  },
};

export default placeholderPlugin;

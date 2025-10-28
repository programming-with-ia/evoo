import { Plugin, logger, Job } from "@evoo/core";

const placeholderPlugin: Plugin = {
  jobs: {
    greet: async (job: Job) => {
      logger.info("Hello from the placeholder plugin!");

      // The `job` object comes directly from the user's JSON configuration.
      // We can safely cast it to access custom properties for our job type.
      const customJob = job as any;

      if (customJob.message && typeof customJob.message === 'string') {
        logger.log(`Your message is: ${customJob.message}`);
      }
    },
  },
};

export default placeholderPlugin;

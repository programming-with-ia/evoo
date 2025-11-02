import type { Plugin } from "@evoo/core";

type fileOpsJobs = {
    fsMove: {
        src: string;
        dest: string;
    };
    fsCopy: {
        src: string;
        dest: string;
    };
    fsRemove: {
        path: string;
    };
    fsMkdir: {
        path: string;
    };
    fsRename: {
        oldPath: string;
        newPath: string;
    };
};

const fileOpsPlugin: Plugin<fileOpsJobs, {}> = ({ logger, fs, prompts }) => {
    return {
        jobs: {
            fsMove: async (job) => {
                let letExec = !!job.confirm;
                if (!letExec) {
                    letExec = (await prompts.confirm({
                        message: `Are you sure you want to move ${job.src} to ${job.dest}?`,
                    })) as boolean;
                }

                logger.info(`Moving ${job.src} to ${job.dest}`);

                if (!fs.existsSync(job.src)) {
                    throw new Error(`Source ${job.src} does not exist.`); //! confirmContinue
                }

                if (letExec) {
                    await fs.move(job.src, job.dest);
                }
            },
            fsCopy: async (job) => {
                logger.info(`Copying ${job.src} to ${job.dest}`);

                if (!fs.existsSync(job.src)) {
                    throw new Error(`Source ${job.src} does not exist.`); //! confirmContinue
                }

                let letExec = true;
                if (fs.existsSync(job.dest)) {
                    letExec = (await prompts.confirm({
                        message: `The destination ${job.dest} already exists. Do you want to overwrite it?`,
                    })) as boolean;
                }

                if (letExec) {
                    await fs.copy(job.src, job.dest);
                }
            },
            fsRemove: async (job) => {
                logger.info(`Removing '${job.path}'...`);

                if (!fs.existsSync(job.path)) {
                    throw new Error(`Path ${job.path} does not exist.`); //! confirmContinue
                }

                let letExec = !!job.confirm;
                if (!letExec) {
                    letExec = (await prompts.confirm({
                        message: `Are you sure you want to remove ${job.path}?`,
                    })) as boolean;
                }
                if (letExec) {
                    await fs.remove(job.path);
                }
            },
            fsMkdir: async (job) => {
                logger.info(`Creating directory '${job.path}'...`);
                await fs.mkdir(job.path);
            },
            fsRename: async (job) => {
                let letExec = !!job.confirm;
                if (!letExec) {
                    letExec = (await prompts.confirm({
                        message: `Are you sure you want to rename ${job.oldPath} to ${job.newPath}?`,
                    })) as boolean;
                }

                logger.info(`Renaming ${job.oldPath} to ${job.newPath}`);
                if (!fs.existsSync(job.oldPath)) {
                    throw new Error(`Source ${job.oldPath} does not exist.`); //! confirmContinue
                }

                if (letExec) {
                    await fs.rename(job.oldPath, job.newPath);
                }
            },
        },
    };
};

export default fileOpsPlugin;

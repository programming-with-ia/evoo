import type { BaseJob, FileType, Plugin } from "@evoo/core";

type FileTemplatesSharedContext = {
    templates?: Record<string, string>;
};

const fileTemplates: Plugin<{}, FileTemplatesSharedContext> = (core) => {
    return {
        jobModifier: async (_job, sharedContext) => {
            const job = _job as unknown as FileType & BaseJob;

            if (
                job.type !== "file" ||
                job.method === "replace" ||
                typeof job.content !== "string" ||
                !job.content.startsWith("@@") ||
                job.content.includes("\n")
            ) {
                return _job;
            }

            job.content =
                sharedContext.templates?.[job.content.slice(2)] ?? job.content;

            return _job;
        },
    };
};

export default fileTemplates;

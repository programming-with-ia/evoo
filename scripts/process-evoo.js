// ESM imports for file system and path manipulation.
import fs from 'fs/promises';
import path from 'path';

// Defines which properties to process for file content embedding.
const targets = [
  'job.file.content', // Process 'content' property for jobs of type 'file'.
  'sharedContext.schema', // Process 'schema' property inside the 'sharedContext' object.
];

/**
 * Displays the usage information for the script and exits.
 */
function showUsageAndExit() {
  console.error('Usage: node scripts/process-evoo.js <source-file.json> <destination-file.json>');
  process.exit(1);
}

/**
 * Processes root-level properties of the data object for file content embedding.
 * @param {Object} data - The root data object from the JSON file.
 * @param {string} baseDir - The directory to resolve relative file paths from.
 */
async function processRootProperties(data, baseDir) {
  // Filter for targets that are not job-specific.
  const rootTargets = targets.filter(t => !t.startsWith('job.'));

  for (const target of rootTargets) {
    const keys = target.split('.');
    let current = data;

    // Traverse the object to the second-to-last key to get the parent object.
    const parentObject = keys.slice(0, -1).reduce((obj, key) => {
      if (obj && typeof obj === 'object' && key in obj) {
        return obj[key];
      }
      return undefined;
    }, current);

    const lastKey = keys.length > 0 ? keys[keys.length - 1] : undefined;

    // Check if the parent object and the final key are valid.
    if (parentObject && typeof parentObject === 'object' && lastKey && lastKey in parentObject) {
      const propertyValue = parentObject[lastKey];

      // If the target property exists and is a string starting with '.', process it.
      if (typeof propertyValue === 'string' && propertyValue.startsWith('.')) {
        const filePath = path.resolve(baseDir, propertyValue);
        try {
          // Read the file content and replace the path with the actual content.
          parentObject[lastKey] = await fs.readFile(filePath, 'utf-8');
        } catch (error) {
          if (error.code === 'ENOENT') {
            // If the file doesn't exist, throw a user-friendly error.
            throw new Error(`File not found for property "${target}": ${filePath}`);
          }
          // Re-throw any other errors.
          throw error;
        }
      }
    }
  }
}


/**
 * Recursively processes an array of jobs to replace file paths with content.
 * @param {Array<Object>} jobs - The array of job objects to process.
 * @param {string} baseDir - The directory to resolve relative file paths from.
 */
async function processJob(job, baseDir, jobTargets) {
  const jobType = job.type || 'file';

  for (const target of jobTargets) {
    const [prefix, type, key] = target.split('.');

    if (jobType === type) {
      if (typeof job[key] === 'string' && job[key].startsWith('.')) {
        const filePath = path.resolve(baseDir, job[key]);
        try {
          job[key] = await fs.readFile(filePath, 'utf-8');
        } catch (error) {
          if (error.code === 'ENOENT') {
            throw new Error(`File not found for job "${job.name}" property "${key}": ${filePath}`);
          }
          throw error;
        }
      }
    }
  }

  if (jobType === 'group' && Array.isArray(job.jobs)) {
    await processJobs(job.jobs, baseDir);
  }
}

async function processJobs(jobs, baseDir) {
  const jobTargets = targets.filter(t => t.startsWith('job.'));
  for (const job of jobs) {
    await processJob(job, baseDir, jobTargets);
  }
}

async function processDefinitions(definitions, baseDir) {
  if (!definitions || typeof definitions !== 'object') {
    return;
  }
  const jobTargets = targets.filter(t => t.startsWith('job.'));
  for (const defKey in definitions) {
    const job = definitions[defKey];
    if (job && typeof job === 'object') {
      await processJob(job, baseDir, jobTargets);
    }
  }
}

/**
 * Main function to orchestrate the file processing.
 */
async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    showUsageAndExit();
  }

  const [sourcePath, destinationPath] = args;
  
  // Resolve the absolute path for the source file to get its directory.
  const absoluteSourcePath = path.resolve(sourcePath);
  const sourceDir = path.dirname(absoluteSourcePath);

  // Read the source JSON file.
  const sourceContent = await fs.readFile(absoluteSourcePath, 'utf-8');
  const data = JSON.parse(sourceContent);

  // Process root-level properties.
  await processRootProperties(data, sourceDir);

  // Process the definitions if they exist.
  if (data.definitions) {
    await processDefinitions(data.definitions, sourceDir);
  }

  // Process the jobs if the 'jobs' property is an array.
  if (Array.isArray(data.jobs)) {
    await processJobs(data.jobs, sourceDir);
  }

  // Convert the processed data object back to a JSON string with indentation.
  const outputContent = JSON.stringify(data, null, 2);

  // Write the new content to the destination file.
  await fs.writeFile(destinationPath, outputContent, 'utf-8');

  console.log(`Successfully wrote processed data to ${destinationPath}`);
}

// Execute the main function and handle any potential errors.
main().catch(error => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});

// ESM imports for file system and path manipulation.
import fs from 'fs/promises';
import path from 'path';

/**
 * Displays the usage information for the script and exits.
 */
function showUsageAndExit() {
  console.error('Usage: node scripts/process-evoo.js <source-file.json> <destination-file.json>');
  process.exit(1);
}

/**
 * Recursively processes an array of jobs to replace file paths with content.
 * @param {Array<Object>} jobs - The array of job objects to process.
 * @param {string} baseDir - The directory to resolve relative file paths from.
 */
async function processJobs(jobs, baseDir) {
  // Iterate through each job in the array.
  for (const job of jobs) {
    // If the job type is not defined, default it to 'file'.
    const jobType = job.type || 'file';

    if (jobType === 'file') {
      // Process jobs of type 'file'.
      // Check if the content is a string and represents a relative path.
      if (typeof job.content === 'string' && job.content.startsWith('.')) {
        const filePath = path.resolve(baseDir, job.content);
        try {
          // Read the file content and replace the path with the actual content.
          job.content = await fs.readFile(filePath, 'utf-8');
        } catch (error) {
          if (error.code === 'ENOENT') {
            // If the file doesn't exist, throw a user-friendly error.
            throw new Error(`File not found for job "${job.name}": ${filePath}`);
          }
          // Re-throw any other errors.
          throw error;
        }
      }
    } else if (jobType === 'group' && Array.isArray(job.jobs)) {
      // If the job is a 'group' with a 'jobs' array, process it recursively.
      await processJobs(job.jobs, baseDir);
    }
    // Any other job types or conditions are left as they are.
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

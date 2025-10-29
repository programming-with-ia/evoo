# @evoo/core

This package provides the core functionality for the evoo CLI, including the plugin system, shared utilities, and type definitions. It's designed to be used by the `@evoo/cli` package and by plugin developers who want to extend the CLI's capabilities.

## Plugin Development Guide

The evoo CLI is designed to be modular and extensible through a powerful plugin system. This guide will walk you through the process of creating your own plugins to automate your workflows.

### The `Plugin` Interface

The core of the plugin system is the `Plugin` interface, which is defined in `packages/core/src/plugin-types.ts`. Here's a basic overview of its structure:

```typescript
export interface Plugin<T extends JobMap, C = object> {
  name: string;
  jobs: T;
  onStart?: (sharedContext: C) => Promise<void>;
  onComplete?: (sharedContext: C) => Promise<void>;
  onDone?: (sharedContext: C) => Promise<void>;
}
```

- `name`: A unique name for your plugin.
- `jobs`: A map of job names to their corresponding `Job` definitions.
- `onStart`: An optional async function that runs after the plugins are loaded, but before any jobs are processed.
- `onComplete`: An optional async function that runs after all jobs have been processed, but before dependencies are installed.
- `onDone`: An optional async function that runs after all dependencies have been installed.

### `sharedContext`

The `sharedContext` is a powerful feature that allows plugins to share data with each other. It's a generic object that's passed to all lifecycle hooks and job executors. You can use it to store data that needs to be accessed by other plugins or by your plugin's lifecycle hooks.

### Advanced Topics

The `@evoo/core` package also provides a set of utilities to help you with common tasks in your plugins.

- **Logging**: The `logger` utility provides a set of functions for logging messages to the console. You can use it to provide feedback to the user about what your plugin is doing.

- **Prompts**: The `prompts` utility provides a set of functions for prompting the user for input. You can use it to ask the user for information that your plugin needs to run.

- **Running Commands**: The `execWithSpinner` utility allows you to run shell commands with a loading spinner. This is useful for long-running tasks like installing dependencies or running build scripts.

For more detailed examples, you can refer to the `placeholder` plugin in the `plugins/placeholder` directory.

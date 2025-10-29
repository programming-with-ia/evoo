# @evoo/core

The `@evoo/core` package provides the foundational architecture for creating and managing plugins within the Evoo CLI ecosystem. It offers a robust set of tools and conventions to ensure that plugins are powerful, scalable, and easy to maintain.

## Philosophy

The design of `@evoo/core` is guided by a few core principles:

- **Extensibility**: The plugin system is designed to be highly extensible, allowing developers to add new functionalities and integrations with minimal effort.
- **Developer Experience**: We prioritize a smooth developer experience by providing clear and consistent APIs, comprehensive documentation, and helpful utilities.
- **Type Safety**: TypeScript is used to ensure type safety across the entire system, from the core architecture to individual plugins.

## Plugin Development

Developing a plugin for the Evoo CLI involves leveraging the tools and structures provided by `@evoo/core`. This section will walk you through the key concepts and practical steps to build your own plugin.

### Key Concepts

- **Plugin Interface**: Every plugin must implement the `Plugin` interface, which defines the contract for how plugins interact with the core system.
- **Jobs**: Plugins can define custom jobs, which are individual tasks that can be executed during the CLI's lifecycle.
- **Shared Context**: A shared context is available to all plugins, allowing them to communicate and share data in a type-safe manner.
- **Lifecycle Hooks**: Plugins can tap into various lifecycle hooks, such as `onStart`, `onComplete`, and `onDone`, to execute code at specific points in the CLI's execution flow.

### Getting Started

To get started with plugin development, it is highly recommended to check out the [`placeholder` plugin](../../plugins/placeholder/README.md), which serves as a simple and well-documented example.

### Advanced Concepts

#### Logging

Effective logging is crucial for debugging and providing feedback to users. The `@evoo/core` package includes a logging utility that you can use in your plugins.

#### Prompts

For interactive plugins, you can use the built-in prompt utilities to ask for user input.

#### Running Commands

If your plugin needs to execute shell commands, you can use the `execWithSpinner` utility, which provides a consistent and user-friendly way to run commands with visual feedback.

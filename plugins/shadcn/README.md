# Shadcn Plugin for Evoo CLI

The Shadcn plugin for the Evoo CLI is a powerful tool designed to streamline the integration of [Shadcn UI](https://ui.shadcn.com/) components into your projects. It automates the process of adding and installing components, making it easier to manage your design system.

## Features

- **Automated Component Installation**: The plugin automatically installs the specified Shadcn components, handling the necessary CLI commands for you.
- **Dependency Management**: It intelligently manages and deduplicates component dependencies, ensuring that each component is installed only once.
- **Seamless Integration**: The plugin is designed to work seamlessly with the Evoo CLI's plugin architecture, providing a smooth and consistent developer experience.

## Usage

To use the Shadcn plugin, you will need to add a `registryDependencies` job to your `evoo.json` configuration file. This job allows you to specify the Shadcn components you want to install.

### `registryDependencies`

The `registryDependencies` job accepts either a single component name or an array of component names.

#### Example

```json
{
  "plugins": ["shadcn"],
  "jobs": [
    {
      "type": "registryDependencies",
      "registryDependencies": ["button", "card", "dialog"]
    }
  ]
}
```

When you run the Evoo CLI with this configuration, the Shadcn plugin will automatically install the `button`, `card`, and `dialog` components using the appropriate command for your package manager.

### Using `sharedContext`

In addition to the `registryDependencies` job, the Shadcn plugin also supports a `sharedContext.registryDependencies` property in your `evoo.json` file. This allows you to define a list of components to be installed from the shared context, which can be useful for more complex configurations where dependencies are determined dynamically.

#### Example

```json
{
  "plugins": ["shadcn"],
  "sharedContext": {
    "registryDependencies": ["alert-dialog", "accordion"]
  },
  "jobs": []
}
```

In this example, the `alert-dialog` and `accordion` components will be installed, even though there are no `registryDependencies` jobs defined. The plugin will automatically pick up the dependencies from the shared context.

## Prerequisites

Before using the Shadcn plugin, you must have `components.json` present in your project's root directory. If this file is missing, the plugin will display an error message prompting you to run `npx shadcn-ui@latest init` to initialize your project.

## How It Works

The plugin collects all the component dependencies from the `registryDependencies` jobs and any shared context data. It then removes any duplicates and installs the unique components using the `shadcn-ui` CLI. The plugin automatically detects your package manager and uses the appropriate command (`pnpm`, `yarn`, `bun`, or `npm`) to install the components.

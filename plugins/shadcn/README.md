# Shadcn Plugin for Evoo CLI

The Shadcn plugin for the Evoo CLI is a powerful tool designed to streamline the integration of [Shadcn UI](https://ui.shadcn.com/) components into your projects. It automates the process of adding and installing components, making it easier to manage your design system.

## Features

-   **Automated Component Installation**: The plugin automatically installs the specified Shadcn components, handling the necessary CLI commands for you.
-   **Conditional Installation**: Use the `when` property on `registryDependencies` jobs to install components only when specific conditions are met.
-   **Dynamic Dependency Resolution**: Leverage the `sharedContext` to allow other jobs or plugins to dynamically add components to the installation queue.

## Usage

There are two primary ways to specify which Shadcn components to install: the `registryDependencies` job and the `sharedContext.registryDependencies` property.

### 1. The `registryDependencies` Job

This is the most common method for installing components. It allows you to define a list of components to install and, crucially, allows you to use a `when` clause for conditional logic.

| Property | Type | Required | Description |
| --- | --- | :---: | --- |
| `type` | `"registryDependencies"` | ✔️ | Specifies the job type. |
| `registryDependencies` | `string[]` or `string`| ✔️ | The name of the component(s) to install. |
| `when` | `string` | | A conditional expression to control whether the components are installed. |

**Example:**

```json
{
  "plugins": ["shadcn"],
  "jobs": [
    {
      "type": "question",
      "id": "#use-dialog",
      "questionType": "confirm",
      "question": "Do you need a dialog component?"
    },
    {
      "type": "registryDependencies",
      "when": "#use-dialog == true",
      "registryDependencies": ["dialog", "button"]
    }
  ]
}
```

In this example, the `dialog` and `button` components will only be installed if the user answers "yes" to the prompt.

### 2. Using `sharedContext.registryDependencies`

This is a more advanced mechanism that allows other plugins or complex job chains to dynamically add dependencies to the installation queue. The `shadcn` plugin will automatically detect and process any components listed in the `sharedContext.registryDependencies` array at the end of its lifecycle.

**Example:**

Imagine another plugin has a job that determines which UI components are needed based on user input, and it adds them to the shared context.

```json
{
  "plugins": ["some-other-plugin", "shadcn"],
  "sharedContext": {
    "registryDependencies": []
  },
  "jobs": [
    {
      "type": "some-other-plugin-job"
    }
  ]
}
```

If `some-other-plugin-job` populates `sharedContext.registryDependencies` with `["card", "avatar"]`, the `shadcn` plugin will automatically install them, even without a dedicated `registryDependencies` job.

## Prerequisites

Before using the Shadcn plugin, you must have `components.json` present in your project's root directory. If this file is missing, the plugin will display an error message prompting you to run `npx shadcn-ui@latest init` to initialize your project.

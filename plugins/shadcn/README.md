# Shadcn Plugin for Evoo CLI

The Shadcn plugin for the Evoo CLI is a powerful tool designed to streamline the integration of [Shadcn UI](https://ui.shadcn.com/) components into your projects. It automates the process of adding and installing components, making it easier to manage your design system.

## Features

-   **Automated Component Installation**: The plugin automatically installs the specified Shadcn components, handling the necessary CLI commands for you.
-   **Conditional Installation**: Use the `when` property on `registryDependencies` jobs to install components only when specific conditions are met.
-   **Static, Unconditional Installation**: Use the `sharedContext` to specify components that are a core part of a scaffold.

## Usage

There are two primary ways to specify which Shadcn components to install within a scaffold file.

### 1. Static Installation with `sharedContext.registryDependencies`

This method is ideal for components that are a **static, unconditional part of a scaffold recipe**. The plugin will automatically detect and process any components listed in the `sharedContext.registryDependencies` array.

**Example:**

```json
{
  "plugins": ["shadcn"],
  "sharedContext": {
    "registryDependencies": ["button", "card"]
  },
  "jobs": []
}
```

When a user runs a scaffold with this configuration, the `button` and `card` components will be installed as a core part of the process.

### 2. Conditional Installation with the `registryDependencies` Job

This method is used for components that are an **optional, conditional part of a scaffold**. It allows you to use a `when` clause, typically based on user input, to control whether the components are installed.

See the [Job's common properties](https://github.com/programming-with-ia/evoo?tab=readme-ov-file#the-job-object).

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
      "question": "Do you need a dialog component for this feature?"
    },
    {
      "type": "registryDependencies",
      "when": "#use-dialog == true",
      "registryDependencies": ["dialog"]
    }
  ]
}
```

In this example, the `dialog` component will only be installed if the user answers "yes" to the prompt for this specific scaffold.

## Prerequisites

Before using the Shadcn plugin, you must have `components.json` present in your project's root directory. If this file is missing, the plugin will display an error message prompting you to run `npx shadcn-ui@latest init` to initialize your project.

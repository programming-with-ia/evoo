# Placeholder Plugin for Evoo CLI

The Placeholder plugin is a template designed to serve as a starting point for creating new plugins for the Evoo CLI. It demonstrates various features of the plugin architecture, including jobs, lifecycle hooks, and shared context, making it an excellent educational resource for plugin developers.

## Features

-   **Job Implementation**: Showcases a basic `greet` job that logs a message to the console.
-   **Lifecycle Hooks**: Provides examples of how to use the `onStart`, `onComplete`, and `onDone` lifecycle hooks to execute code at different stages of the CLI's execution.
-   **Shared Context**: Demonstrates how to define and use a shared context to maintain state and share data across different parts of a plugin.

## Usage

This plugin is not intended for direct use in production but rather as a template to be copied and modified. By examining its source code, you can gain a deeper understanding of the Evoo plugin architecture and learn how to build your own custom plugins.

### The `greet` Job

The `greet` job logs a message from the shared context and an optional message provided in the job configuration.

| Property | Type | Required | Description |
| --- | --- | :---: | --- |
| `type` | `"greet"` | ✔️ | Specifies the job type. |
| `message` | `string` | | A custom message that will be logged to the console. |

#### Example

```json
{
  "plugins": ["placeholder"],
  "sharedContext": {
    "greetings": "Hello from the shared context!"
  },
  "jobs": [
    {
      "type": "greet",
      "message": "This is a custom message from the greet job!"
    }
  ]
}
```

When you run the Evoo CLI with this configuration, the Placeholder plugin will log messages at each lifecycle stage, demonstrating how the shared context is accessed and used.

## As a Template

To create your own plugin, you can copy the contents of this plugin's directory and use it as a foundation. The code is well-commented and structured to make it easy to understand and adapt for your own purposes.

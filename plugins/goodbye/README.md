# Goodbye Plugin for Evoo CLI

The Goodbye plugin is a simple, illustrative plugin for the Evoo CLI, designed to demonstrate the basic structure and functionality of a plugin. It serves as a clear and concise example for developers who are new to the Evoo plugin ecosystem.

## Features

-   **Logs a Goodbye Message**: When executed, the plugin logs a friendly "Goodbye" message to the console.
-   **Customizable Message**: It accepts an optional `message` property, which it will also log to the console.
-   **Educational**: The primary purpose of this plugin is to provide a straightforward example of how to create a new plugin.

## Usage

To use the Goodbye plugin, you will need to add a `goodbye` job to your `evoo.json` configuration file.

### The `goodbye` Job

| Property | Type | Required | Description |
| --- | --- | :---: | --- |
| `type` | `"goodbye"` | ✔️ | Specifies the job type. |
| `message` | `string` | | A custom message that will be logged to the console. |

#### Example

```json
{
  "plugins": ["goodbye"],
  "jobs": [
    {
      "type": "goodbye",
      "message": "This is a custom message from the goodbye plugin!"
    }
  ]
}
```

When you run the Evoo CLI with this configuration, the Goodbye plugin will log its standard goodbye message, followed by the custom message you provided.

## Learning Resource

The source code for this plugin is intentionally simple, making it an excellent resource for learning the fundamentals of plugin development. By examining its structure, you can quickly grasp the key concepts of the Evoo plugin architecture.

# Executor Plugin for Evoo CLI

The Executor plugin for the Evoo CLI allows you to run shell commands as part of your automated workflows. It provides a simple and secure way to execute commands, with built-in user confirmation to prevent unintended side effects.

## Features

-   **Command Execution**: Execute any shell command from within your `evoo.json` configuration.
-   **User Confirmation**: Prompts the user for confirmation before executing a command, ensuring that no command is run without explicit approval.
-   **Customizable Messages**: Allows you to set custom start and success messages for each command, providing clear feedback to the user.

## Usage

To use the Executor plugin, you will need to add an `exec` job to your `evoo.json` configuration file.

See the [Job's common properties](https://github.com/programming-with-ia/evoo?tab=readme-ov-file#the-job-object).

### The `exec` Job

| Property | Type | Required | Description |
| --- | --- | :---: | --- |
| `type` | `"exec"` | ✔️ | Specifies the job type. |
| `command` | `string` | ✔️ | The shell command to be executed. |
| `startMessage` | `string` | | A message to display when the command starts. |
| `successMessage` | `string` | | A message to display when the command completes successfully. |

#### Example

```json
{
  "plugins": ["exec"],
  "jobs": [
    {
      "type": "exec",
      "command": "npm install",
      "startMessage": "Installing dependencies...",
      "successMessage": "Dependencies installed successfully!"
    }
  ]
}
```

When you run the Evoo CLI with this configuration, the Executor plugin will first ask for your confirmation. If you approve, it will execute the `npm install` command and display the custom messages at the start and end of the process.

## Security

For security reasons, the Executor plugin will always prompt for user confirmation before executing any command. This is to ensure that you are aware of the commands being run and to prevent malicious or unintended actions.

# Placeholder Plugin

This plugin is a simple example of how to create a plugin for the evoo CLI. It provides a single job, `greet`, that logs a message to the console.

## Installation

To use this plugin, you'll need to install it as a dev dependency in your project:

```bash
pnpm add -D @evoo/placeholder-plugin
```

## Usage

Once the plugin is installed, you can use it in your `.evoo.json` file like this:

```json
{
  "plugins": ["@evoo/placeholder-plugin"],
  "jobs": {
    "greet": {
      "message": "This is a custom message from the placeholder plugin!"
    }
  }
}
```

When you run the evoo CLI, the `greet` job will be executed, and you'll see the following output in your console:

```
Hello from the placeholder plugin!
Your message is: This is a custom message from the placeholder plugin!
```

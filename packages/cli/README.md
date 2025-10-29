# @evoo/cli 🏗️

Welcome to the Evoo CLI, a powerful, job-based tool for automating project scaffolding. Define a series of tasks in a single JSON file—creating files, asking questions, installing dependencies, and more. Evoo executes them sequentially with support for **conditional logic**, **user prompts**, and **persistent state** to create highly adaptable templates.

It works seamlessly with both local and remote JSON configurations, and its plugin-first architecture makes it perfect for personal boilerplates and enforcing team-wide standards.

## ✨ Core Features

- **Job-Based System**: Every action is a "job"—create a file, ask a question, install a package, or group other jobs.
- **Conditional Logic**: Use powerful `when` clauses to run jobs only when specific conditions are met.
- **Interactive Prompts**: Engage with the user through text inputs, confirmations (`y/n`), or a list of options.
- **State Management**: Save user answers in-memory for the current session (`#id`) or persistently across runs (`@id`).
- **Dynamic Content**: Use stored answers as variables in file paths, file content, and conditional checks.
- **Plugin-Driven**: The CLI's functionality is extended through plugins, making it highly modular and adaptable.

## 🚀 Usage

### **Basic Command**

```bash
evoo <source> [options]
```

- `<source>`: The path to a local `.json` file or a URL to a remote one.

### **CLI Options**

| Option | Short | Description |
| --- | --- | --- |
| `--dir` | `-d` | Set the working directory for the scaffold. |
| `--force` | `-f` | Overwrite existing files without prompting. |
| `--extend-path` | `-e` | Adds a prefix to the `name` property of all file jobs. |

## 📄 The `evoo.json` Structure

The power of Evoo comes from its JSON structure. At its core, it's a list of **jobs** to be executed in order.

### **Root Properties**

| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | The name of the scaffold. |
| `description` | `string` | A brief description of what the scaffold does. |
| `dependencies` | `string[]` | A list of npm packages to install at the start. |
| `jobs` | `Job[]` | The array of jobs to execute sequentially. |
| `definitions` | `Record<string, Except<Job, "when">>` | A collection of reusable job definitions. |
| `plugins` | `string[]` | A list of plugins to load. |
| `sharedContext` | `Record<string, unknown>` | A shared data object for plugins. |

### **The Job Object**

Every object in the `jobs` array is a **Job**. All jobs share these common properties:

| Property | Type | Description |
| --- | --- | --- |
| `type` | `string` | The type of job. |
| `id` | `string` | A unique identifier for the job, used in `when` conditions. |
| `when` | `string` | A conditional expression. The job only runs if this condition is met. |
| `confirm` | `string` | A yes/no question to ask before running the job. |

## ⚙️ Built-in Job Types

### **`file`**

The `file` job creates, appends to, or modifies files.

```json
{
  "name": "src/components/<#componentName>.tsx",
  "content": "export const Button = () => <button>Click Me</button>;",
  "method": "w"
}
```

- `name`: The path to the file.
- `content`: The content for the file.
- `method`:
  - `"w"` (default): **Write** to the file.
  - `"a"`: **Append** content.
  - `"replace"`: **Replace** content.

### **`question`**

Prompts the user for input and stores the answer.

```json
{
  "type": "question",
  "id": "@project.linter",
  "questionType": "confirm",
  "question": "Do you want to use ESLint?",
  "defaultValue": true
}
```

- `id`: The key used to store the answer (`#` for session, `@` for persistent).
- `questionType`:
  - `"ask"`: Simple text input.
  - `"confirm"`: A `true`/`false` (yes/no) question.
  - `"options"`: Presents a list of choices.

### **`log`**

Displays a message to the console.

```json
{
  "type": "log",
  "logLevel": "info",
  "message": "Starting setup..."
}
```

- `message`: The string to display.
- `logLevel`: (Optional) `info`, `warn`, `error`, `success`, or `log`.

### **`dependencies`**

Installs npm packages.

```json
{
  "type": "dependencies",
  "when": "@project.linter == true",
  "dependencies": ["eslint", "prettier"]
}
```

### **`group`**

A container for a nested `jobs` array.

```json
{
  "type": "group",
  "when": "#useTypescript == true",
  "base": "src/",
  "jobs": [
    { "name": "../tsconfig.json", "content": "{}" },
    { "name": "index.ts", "content": "// TS entry file" }
  ]
}
```

### **`run`**

Executes a reusable job from the `definitions` map.

```json
{
  "definitions": {
    "createHook": {
      "type": "file",
      "name": "src/hooks/useMouse.ts",
      "content": "..."
    }
  },
  "jobs": [
    {
      "type": "run",
      "target": "createHook"
    }
  ]
}
```

## 🔌 Plugin Development

The true power of the Evoo CLI lies in its plugin system. If you are interested in creating your own plugins, please refer to the [Plugin Development Guide](../core/README.md) in the `@evoo/core` package for detailed documentation and best practices.

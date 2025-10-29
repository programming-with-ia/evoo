# @evoo/cli 🏗️

Welcome to the Evoo CLI, a powerful, job-based tool for automating project tasks. It can be used for both **one-off scaffolding** (like initializing a new project with `create-react-app.json`) and **stateful, incremental updates** (like adding a themed component with `add-material-ui-button.json`).

Define a series of tasks in a single JSON file—creating files, asking questions, installing dependencies, and more. Evoo executes them sequentially with support for **conditional logic**, **user prompts**, and **persistent state** (`evoo.store.json`) to create highly adaptable and context-aware automations.

## ✨ Core Features

- **Job-Based System**: Every action is a "job"—create a file, ask a question, install a package, or group other jobs.
- **Conditional Logic**: Use powerful `when` clauses to run jobs only when specific conditions are met.
- **Interactive Prompts**: Engage with the user through text inputs, confirmations (`y/n`), or a list of options.
- **State Management**: Save user answers in-memory for the current session (`#id`) or persistently across runs (`@id`).
- **Dynamic Paths & Content**: Use stored answers as variables in file paths, file content, and conditional checks.
- **Plugin-Driven**: The CLI's functionality is extended through plugins, making it highly modular and adaptable.

## 💻 Installation

Install Evoo globally to use the `evoo` command anywhere:

```bash
npm install -g evoo
```

Or run it directly without a global installation using `npx`:

```bash
npx evoo@latest <jsonPath>
```

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

| Property | Type | Required | Description |
| --- | --- | :---: | --- |
| `name` | `string` | | The internal name of the scaffold. |
| `title` | `string` | | A user-friendly title for the scaffold. |
| `version` | `string` | | The semantic version of the scaffold. |
| `description` | `string` | | A brief summary of what the scaffold does. |
| `dependencies` | `string[]` | | A list of npm packages to install at the very beginning of the process. |
| `jobs` | `Job[]` | | The primary array of jobs to be executed sequentially. |
| `definitions` | `Record<string, Job>` | | A map of reusable job definitions that can be executed by a `run` job. |
| `plugins` | `string[]` | | A list of plugins to load, which can provide custom job types. |
| `sharedContext` | `object` | | A shared data object that is passed to all plugin job executors. |

### **The Job Object**

Every object in the `jobs` array is a **Job**. All jobs share these common properties:

| Property | Type | Required | Description |
| --- | --- | :---: | --- |
| `type` | `string` | ✔️ | The type of job to run. |
| `id` | `string` | | A unique identifier, used to reference the job's result in `when` conditions. **Required for `question` jobs.** |
| `when` | `string` | | A conditional expression. The job only runs if the expression evaluates to true. |
| `confirm` | `string` | | A yes/no question to ask before running the job. |

---

## ⚙️ Built-in Job Types

### **`file`**

Performs a file operation (write, append, or replace). This is the **default job type** if `type` is omitted.

| Property | Type | Required | Description |
| --- | --- | :---: | --- |
| `name` | `string` | ✔️ | The path of the file, relative to the project or a `base` directory from a `group` job. |
| `method` | `"w"`, `"a"`, or `"replace"` | | The file operation method. Defaults to `"w"`. |
| `content` | `string` or `Record<string, string>` | ✔️ | The content for the operation. If `method` is `"replace"`, this must be an object of search/replace pairs. |

**Example:**

```json
{
  "jobs": [
    {
      "name": "src/components/<#componentName>.tsx",
      "content": "export const Button = () => <button>Click Me</button>;"
    }
  ]
}
```

### **`question`**

Prompts the user for input and stores the answer.

| Property | Type | Required | Description |
| --- | --- | :---: | --- |
| `id` | `string` | ✔️ | The key used to store the answer. Use `#id` for session storage and `@id` for persistent storage. |
| `question` | `string` | ✔️ | The question text displayed to the user. |
| `questionType` | `"ask"`, `"confirm"`, or `"options"` | ✔️ | The type of prompt to display. |
| `defaultValue` | `string` | | An optional default value for the prompt. |
| `options` | `Record<string, string>` | | A map of options for the `options` `questionType`. |

**Example:**

```json
{
  "type": "question",
  "id": "@project.linter",
  "questionType": "confirm",
  "question": "Do you want to use ESLint?",
  "defaultValue": true
}
```

### **`log`**

Displays a custom message in the terminal.

| Property | Type | Required | Description |
| --- | --- | :---: | --- |
| `message` | `string` | ✔️ | The message to display. |
| `logLevel` | `"error"`, `"warn"`, `"info"`, `"success"`, `"log"` | | The style of the log message. Defaults to `"log"`. |

**Example:**

```json
{
  "type": "log",
  "logLevel": "success",
  "message": "✅ Project has been successfully created!"
}
```

### **`dependencies`**

Installs npm packages.

| Property | Type | Required | Description |
| --- | --- | :---: | --- |
| `dependencies` | `string[]` or `string` | ✔️ | The package(s) to install. |
| `when` | `string` | ✔️ | This job **must** be conditional to prevent accidental installations. |

**Example:**

```json
{
  "type": "dependencies",
  "when": "@project.linter == true",
  "dependencies": ["eslint", "prettier"]
}
```

### **`group`**

A container for a nested sequence of jobs.

| Property | Type | Required | Description |
| --- | --- | :---: | --- |
| `jobs` | `Job[]` | ✔️ | An array of `Job` objects to be executed sequentially. |
| `base` | `string` | | An optional base path that prefixes all file paths within this group. |

**Example:**

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

Executes a reusable job from the top-level `definitions` map.

| Property | Type | Required | Description |
| --- | --- | :---: | --- |
| `target` | `string` | ✔️ | The key of the job to execute from the `definitions` object. |

**Example:**

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

## 🧠 Advanced Concepts

### **Conditional Logic (`when`)**

A `when` expression determines if a job should run. It can access any stored variable, including **nested values** using dot notation (e.g., `#project.linter`).

1. **Existence Check**: Checks if a job has run (i.e., its result is `defined`), **not** whether the value is "truthy".

    - `"#useAuth"`: Runs if the `useAuth` job was executed.
    - `"!#useAuth"`: Runs if the `useAuth` job was **skipped**.

2. **Value Comparison**: Compares a job's result to a specific value.

    - **Note**: Use loose equality operators (`==`, `!=`) in the JSON. Evoo's engine will execute them as **strict** (`===`, `!==`) comparisons at runtime.
    - `"#framework == 'react'"`: Runs if the `framework` result is strictly `'react'`.
    - `"@project.linter == true"`: Runs if the nested `linter` value is the boolean `true`.

### **Dynamic File Paths**

The `name` property of a `file` job is highly dynamic. You can construct paths using a combination of:

- **Variables**: Inject answers from questions.
  - `"name": "src/components/<#componentName>/index.tsx"`
- **Ask Placeholders**: Prompt the user directly for a path segment.
  - `<-ask->`: Prompts the user (e.g., `src/<-ask->/index.js`).
  - `<-ask|defaultName->`: Prompts with a default value.
- **Directory Shortcuts**: Use special keywords that resolve to common paths.
  - `%SRC%`, `%COMPONENTS%` (e.g., `src`, `src/components`).

## 💡 Examples

### **1. Conditional File Creation**

Ask if they want TypeScript and only create `tsconfig.json` if they say yes.

```json
{
  "jobs": [
    {
      "type": "question",
      "questionType": "confirm",
      "id": "@project.useTypescript",
      "question": "Use TypeScript?",
      "defaultValue": true
    },
    {
      "name": "tsconfig.json",
      "content": "{\n  \"compilerOptions\": {}\n}",
      "when": "@project.useTypescript == true"
    }
  ]
}
```

### **2. Dynamic Component Scaffolding**

Ask for a component name and use it to generate a file with the correct name and content.

```json
{
  "jobs": [
    {
      "type": "question",
      "questionType": "ask",
      "id": "#componentName",
      "question": "What is the name of your component?",
      "defaultValue": "Button"
    },
    {
      "name": "src/components/<#componentName>.tsx",
      "content": "export const %%COMPONENT_NAME%% = () => <></>;"
    },
    {
      "name": "src/components/<#componentName>.tsx",
      "method": "replace",
      "content": {
        "%%COMPONENT_NAME%%": "<#componentName>"
      }
    }
  ]
}
```

## 🔌 Plugin Development

The true power of the Evoo CLI lies in its plugin system. If you are interested in creating your own plugins, please refer to the [Plugin Development Guide](../core/README.md) in the `@evoo/core` package for detailed documentation and best practices.

## 🔒 Configuration & Authentication

Evoo can store a GitHub personal access token to fetch configurations from private repositories.

### **Set a Value**

```bash
# Set your GitHub token
evoo set githubToken ghp_abcdef123456
```

### **Get a Value**

```bash
# View the currently stored token
evoo get githubToken
```

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request on [GitHub](https://github.com/programming-with-ia/evoo).

## 📄 License

This project is licensed under the MIT License.

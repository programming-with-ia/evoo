# File Templates Plugin for Evoo CLI

The File Templates plugin for the Evoo CLI offers a powerful way to reuse content across your scaffolds. It extends the functionality of the existing `file` job, allowing you to define a set of templates in your `evoo.json` and then reference them, keeping your configurations clean and maintainable.

## Features

-   **Content Templating**: Define reusable content snippets and use them across multiple `file` jobs.
-   **Centralized Management**: Manage all your templates in a single `templates` object within the `sharedContext`.
-   **Seamless Integration**: The plugin automatically modifies `file` jobs without requiring a new job type.

## Usage

To use the File Templates plugin, you need to define your templates in the `sharedContext` and then reference them in your `file` jobs.

See the [Job's common properties](https://github.com/programming-with-ia/evoo?tab=readme-ov-file#the-job-object).

### 1. Define Templates in `sharedContext`

In your `evoo.json`, add a `templates` object to the `sharedContext`. Each key in this object is a template name, and its value is the content you want to reuse.

### 2. Reference Templates in File Jobs

In a `file` job, set the `content` property to a string starting with `@@` followed by the template name (e.g., `@@myTemplate`). The plugin will replace this string with the corresponding content from your `templates` object.

#### Example

```json
{
  "plugins": ["file-templates"],
  "sharedContext": {
    "templates": {
      "reactComponent": "import React from 'react';\n\nconst MyComponent = () => {\n  return <div>Hello, World!</div>;\n};\n\nexport default MyComponent;",
      "packageJson": "{\n  \"name\": \"my-cool-project\",\n  \"version\": \"1.0.0\"\n}"
    }
  },
  "jobs": [
    {
      "type": "file",
      "name": "src/components/MyComponent.tsx",
      "content": "@@reactComponent"
    },
    {
      "type": "file",
      "name": "package.json",
      "content": "@@packageJson"
    }
  ]
}
```

When this scaffold is run, `src/components/MyComponent.tsx` will be created with the content of the `reactComponent` template, and `package.json` will be created with the content of the `packageJson` template.

# File Ops Plugin for Evoo CLI

The File Ops plugin for the Evoo CLI provides a set of powerful and convenient jobs for performing common file system operations. It allows you to move, copy, remove, create, and rename files and directories directly from your `evoo.json` configuration.

## Features

-   **File System Operations**: A comprehensive suite of jobs for managing files and directories.
-   **User Confirmation**: Built-in confirmation prompts for destructive operations like `fsMove`, `fsRemove`, and `fsRename`, ensuring that you don't make unintended changes.
-   **Error Handling**: The plugin includes robust error handling to gracefully manage issues like missing source files.

## Usage

To use the File Ops plugin, you will need to add jobs of the appropriate type to your `evoo.json` configuration file.

See the [Job's common properties](https://github.com/programming-with-ia/evoo?tab=readme-ov-file#the-job-object).

### The `fsMove` Job

Moves a file or directory from a source to a destination.

| Property | Type     | Required | Description                              |
| -------- | -------- | :------: | ---------------------------------------- |
| `type`   | `"fsMove"` |    ✔️     | Specifies the job type.                  |
| `src`    | `string` |    ✔️     | The path of the file or directory to move. |
| `dest`   | `string` |    ✔️     | The destination path.                    |

#### Example

```json
{
  "plugins": ["file-ops"],
  "jobs": [
    {
      "type": "fsMove",
      "src": "./old/path/to/file.txt",
      "dest": "./new/path/to/file.txt"
    }
  ]
}
```

### The `fsCopy` Job

Copies a file or directory from a source to a destination.

| Property | Type     | Required | Description                              |
| -------- | -------- | :------: | ---------------------------------------- |
| `type`   | `"fsCopy"` |    ✔️     | Specifies the job type.                  |
| `src`    | `string` |    ✔️     | The path of the file or directory to copy. |
| `dest`   | `string` |    ✔️     | The destination path.                    |

#### Example

```json
{
  "plugins": ["file-ops"],
  "jobs": [
    {
      "type": "fsCopy",
      "src": "./source/file.txt",
      "dest": "./destination/file.txt"
    }
  ]
}
```

### The `fsRemove` Job

Removes a file or directory.

| Property | Type       | Required | Description                        |
| -------- | ---------- | :------: | ---------------------------------- |
| `type`   | `"fsRemove"` |    ✔️     | Specifies the job type.            |
| `path`   | `string`   |    ✔️     | The path of the file to be removed. |

#### Example

```json
{
  "plugins": ["file-ops"],
  "jobs": [
    {
      "type": "fsRemove",
      "path": "./path/to/file.txt"
    }
  ]
}
```

### The `fsMkdir` Job

Creates a new directory.

| Property | Type      | Required | Description                          |
| -------- | --------- | :------: | ------------------------------------ |
| `type`   | `"fsMkdir"` |    ✔️     | Specifies the job type.              |
| `path`   | `string`  |    ✔️     | The path of the directory to create. |

#### Example

```json
{
  "plugins": ["file-ops"],
  "jobs": [
    {
      "type": "fsMkdir",
      "path": "./new/directory"
    }
  ]
}
```

### The `fsRename` Job

Renames a file or directory.

| Property  | Type       | Required | Description                           |
| --------- | ---------- | :------: | ------------------------------------- |
| `type`    | `"fsRename"` |    ✔️     | Specifies the job type.               |
| `oldPath` | `string`   |    ✔️     | The original path of the file.        |
| `newPath` | `string`   |    ✔️     | The new path for the file.            |

#### Example

```json
{
  "plugins": ["file-ops"],
  "jobs": [
    {
      "type": "fsRename",
      "oldPath": "./path/to/old-name.txt",
      "newPath": "./path/to/new-name.txt"
    }
  ]
}
```

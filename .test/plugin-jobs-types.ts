//! not tested
import { JsonStructure, PluginJobs } from "@evoo/core";
import placeholderPlugin from "@evoo/plugin-placeholder";
import goodbyePlugin from "@evoo/plugin-goodbye";

// 1. Extract the job types from each plugin.
type PlaceholderJobs = PluginJobs<typeof placeholderPlugin>;
type GoodbyeJobs = PluginJobs<typeof goodbyePlugin>;

// 2. Create a union of all your custom job types.
type CustomJobs = PlaceholderJobs | GoodbyeJobs;

// 3. Use this union type as a generic for your JsonStructure.
const myStructure: JsonStructure<CustomJobs> = {
  name: "type-safe-example",
  version: "1.0.0",
  jobs: [
    // This is now type-safe! TypeScript will autocomplete and validate this.
    {
      type: "greet",
      message: "Hello from the type-safe example!",
    },
    // This is also type-safe.
    {
      type: "goodbye",
      message: "Goodbye from the type-safe example!",
    },
    // Built-in types still work as expected.
    {
      type: "log",
      message: "This is a standard log job.",
    },
    {
        type: "question",
        id: "name",
        question: "What is your name?",
        questionType: "ask",
    }
  ],
};

// You can then use this typed structure to generate your JSON file.
console.log(JSON.stringify(myStructure, null, 2));

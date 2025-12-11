# Gemini AI

This file outlines the guidelines and best practices for using Gemini AI in this project.

## Getting Started

To get started with Gemini AI, you need to have a configured `.env.local` file with the necessary API keys.

## Configuration

Your `.env.local` file should contain the following:

```
GOOGLE_API_KEY="your-google-api-key"
```

## Usage

Here's an example of how to use the Gemini AI in a React component:

```javascript
import { useGoogleGenerativeAI } from 'react-google-generative-ai';

const MyComponent = () => {
  const { generateContent, content, loading, error } = useGoogleGenerativeAI();

  const handleClick = () => {
    generateContent('Tell me a story about a horse race.');
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        Generate Story
      </button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {content && <p>{content}</p>}
    </div>
  );
};
```

## Best Practices

*   **Be specific in your prompts:** The more specific you are, the better the results will be.
*   **Handle loading and error states:** Always provide feedback to the user while the AI is generating content and handle any potential errors.
*   **Cache results:** To avoid unnecessary API calls, cache the results of your prompts.

## Tooling

This project uses a set of custom tools to interact with the file system, run shell commands, and more. These tools are available to the Gemini AI and can be used to perform a variety of tasks.

### Available Tools

*   `list_directory`: Lists the contents of a directory.
*   `read_file`: Reads the contents of a file.
*   `search_file_content`: Searches for a pattern in a file.
*   `glob`: Finds files matching a pattern.
*   `replace`: Replaces text in a file.
*   `write_file`: Writes content to a file.
*   `run_shell_command`: Executes a shell command.
*   `save_memory`: Saves a fact to long-term memory.
*   `google_web_search`: Performs a web search.
*   `write_todos`: Creates or updates a todo list.
*   `codebase_investigator`: Investigates the codebase.

### Tool Usage

Here are some examples of how to use the tools:

#### `run_shell_command`

To run a shell command, use the `run_shell_command` tool. For example, to list the files in the current directory, you would do the following:

```
agent.run_shell_command('ls -l')
```

#### `write_file`

To write to a file, use the `write_file` tool. For example, to write "Hello, World!" to a file named `hello.txt`, you would do the following:

```
agent.write_file('hello.txt', 'Hello, World!')
```

#### `replace`

To replace text in a file, use the `replace` tool. For example, to replace "Hello" with "Hi" in `hello.txt`, you would do the following:

```
agent.replace('hello.txt', 'Hello', 'Hi')
```

#### `search_file_content`

To search for a pattern in a file, use the `search_file_content` tool. For example, to search for "Hi" in `hello.txt`, you would do the following:

```
agent.search_file_content('hello.txt', 'Hi')
```

## Development

This section outlines how to add new tools and customize the AI's behavior.

### Adding New Tools

To add a new tool, you need to:

1.  Create a new Python file in the `tools` directory.
2.  Define a function that takes the necessary arguments and returns a string.
3.  Add a docstring to the function that describes what it does, what arguments it takes, and what it returns.
4.  Import the function in `tools/__init__.py` and add it to the `__all__` list.

### Customizing Behavior

You can customize the AI's behavior by modifying the prompt in `src/app/api/generate/route.ts`. The prompt is a string that tells the AI what to do. You can change the prompt to make the AI more or less creative, to give it a different personality, or to make it focus on different aspects of the task.

## Conclusion

This document provides a brief overview of how to use Gemini AI in this project. For more information, please refer to the official Gemini documentation.

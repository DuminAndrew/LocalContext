# Example project

A tiny sample tree used to demonstrate and test LocalContext.

Try it from the repository root:

```bash
node src/cli.js examples -f md
node src/cli.js examples -f xml --include "**/*.js"
```

It contains a couple of source files, a nested module, a build artifact that is
ignored via `.gitignore`, and a fake `.env` file that LocalContext flags as a
secret and excludes from the generated context.

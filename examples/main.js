// Example entry point used by the LocalContext demo scan.
const { greet } = require('./lib/greeter');

function main() {
  const names = ['World', 'LocalContext'];
  for (const name of names) {
    console.log(greet(name));
  }
}

main();

import { App } from "./modules/App.js";

async function main() {
  const app = new App();
  await app.start();
}

main();

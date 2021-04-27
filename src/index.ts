#!/usr/bin/env node

import CorpusBuilder from "./CorpusBuilder";

async function main() {
  let cb = new CorpusBuilder();
  await cb.downloadCSVs(["sports"]);
  //cb.login();
}

main();

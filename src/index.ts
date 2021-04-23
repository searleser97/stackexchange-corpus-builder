#!/usr/bin/env node

import CorpusBuilder from "./CorpusBuilder";

async function main() {
  let cb = new CorpusBuilder();
  await cb.init();
  await cb.downloadCSVs();
  //cb.login();
}

main();

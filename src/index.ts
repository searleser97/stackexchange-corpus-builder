#!/usr/bin/env node

import CorpusBuilder from "./CorpusBuilder";
import axios from "axios";
import fs from "fs";

async function getSiteNames(forceRequest?: boolean) {
  const siteNamesFile = "siteNames.txt";
  let siteNames: string[] = [];
  if (!forceRequest && fs.existsSync(siteNamesFile)) {
    let rawSiteNames = fs.readFileSync(siteNamesFile).toString();
    siteNames = rawSiteNames.split("\n");
    return siteNames;
  } else {
    const url = "https://api.stackexchange.com/2.2/sites?pagesize=500";
    const response = await axios.get(url);
    let items: any[] = response.data["items"];
    for (let item of items) {
      if (item["site_type"] == "main_site") {
        siteNames.push(item["api_site_parameter"]);
      }
    }
    let rawSiteNames = "";
    for (let siteName of siteNames) {
      rawSiteNames += siteName + "\n";
    }
    fs.writeFileSync(siteNamesFile, rawSiteNames);
    return siteNames;
  }
}

async function main() {
  let cb = new CorpusBuilder();
  await cb.downloadAllCSVs(await getSiteNames());
}

main();

#!/usr/bin/env node

import CorpusBuilder from "./CorpusBuilder";
import axios from "axios";
import fs from "fs";
//import lineReader from "line-reader";
import path from "path";
import nReadlines from "n-readlines";

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

function getProcessedLine(line: string, fileName: string) {
  let delimiterIndex = line.lastIndexOf(",");
  let col1 = line.substring(0, delimiterIndex);
  let col2 = line.substring(delimiterIndex + 1);
  let tagsArray = col2.match(/[a-zA-Z0-9_\-]+/g);
  let output = "";
  if (tagsArray) {
    output += "__label__" + fileName + " ";
    //output += "__label__" + tagsArray[0] + " ";
    //for (let tag of tagsArray) {
    //output += "__label__" + tag + " ";
    //}
    output += col1 + "\n";
  }
  return output;
}

async function CSVsToFasttextFormat(csvsDir: string, rowsCountPerCSV: number = 5000) {
  let listOfCSVs: string[] = fs.readdirSync(csvsDir);
  for (let i = 0; i < listOfCSVs.length; i++) {
    listOfCSVs[i] = path.join(csvsDir, listOfCSVs[i]);
  }

  for (let csvFile of listOfCSVs) {
    console.log(csvFile);
    let lineIndex = 0;
    let lines = "";
    const liner = new nReadlines(csvFile);
    let line: false | Buffer;
    while ((line = liner.next())) {
      if (lineIndex > 0) {
        const fileName = path.basename(csvFile, ".csv");
        const thisLine = getProcessedLine(line.toString(), fileName);
        if (thisLine.length > 0) {
          lines += thisLine;
        }
      }
      if (lineIndex === rowsCountPerCSV) {
        break;
      }
      lineIndex++;
    }
    console.log(lineIndex, rowsCountPerCSV);
    if (lines.length > 0) {
      fs.appendFileSync("fasttext_formatted_corpus.txt", lines);
    }
  }
}

async function main() {
  //let cb = new CorpusBuilder();
  //await cb.downloadAllCSVs(await getSiteNames());
  CSVsToFasttextFormat("corpus_CSVs");
}

main();

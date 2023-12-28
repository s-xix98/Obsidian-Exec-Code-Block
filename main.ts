import { Plugin } from "obsidian";

export default class ExecCodeBlock extends Plugin {
  async onload() {
    console.log("onload");

    this.registerMarkdownPostProcessor((element, context) => {
      const codeblocks = element.findAll("code");
      for (const codeblock of codeblocks) {
        const langClassPrefix = "language-";
        const lang = codeblock.className.substring(
          codeblock.className.indexOf(langClassPrefix) + langClassPrefix.length
        );
        console.log("--- --- ---");
        console.log("lang is", lang);
        console.log(codeblock.innerText);
      }
    });
  }
}

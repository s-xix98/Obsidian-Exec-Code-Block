import { Plugin } from "obsidian";

export default class ExecCodeBlock extends Plugin {
  async onload() {
    console.log("onload");
  }
}

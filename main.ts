import { App, Plugin, PluginSettingTab, Setting } from "obsidian";

interface MyPluginSettings {
  execdir: string | undefined;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  execdir: undefined,
};

export default class ExecCodeBlock extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    console.log("onload");
    await this.loadSettings();

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

    this.addSettingTab(new ExecCodeBlockSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class ExecCodeBlockSettingTab extends PluginSettingTab {
  plugin: ExecCodeBlock;

  constructor(app: App, plugin: ExecCodeBlock) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl).setName("Exec Dir Full Path").addText((text) => {
      text
        .setPlaceholder("")
        .setValue(this.plugin.settings.execdir ?? "")
        .onChange(async (value) => {
          this.plugin.settings.execdir = value;
          await this.plugin.saveSettings();
        });
    });
  }
}

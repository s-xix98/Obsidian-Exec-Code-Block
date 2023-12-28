import { exec } from "child_process";
import { writeFile } from "fs";
import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";

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

        this.addExecCodeBlockArea(lang, codeblock);
      }
    });

    this.addSettingTab(new ExecCodeBlockSettingTab(this.app, this));
  }

  addExecCodeBlockArea(lang: string, codeblock: HTMLElement) {
    const execDir = this.settings.execdir;
    const execCmd = `python3 tmp.py`;

    if (lang !== "python") {
      return;
    }

    codeblock.parentNode?.appendChild(
      createEl("div", { cls: "exec_code_block" }, (execCodeBlockRootDiv) => {
        const outputEl = createEl("p");

        const onClickExecBtnHandler = () => {
          if (!execDir) {
            new Notice("exec dir is not set");
            return;
          }
          writeFile(`${execDir}/tmp.py`, codeblock.innerText, () => {});
          exec(execCmd, { cwd: execDir }, (err, stdout, stderr) => {
            outputEl.textContent =
              "--- stdout ---\n" + stdout + "\n--- stderr ---\n" + stderr;
          });
        };

        execCodeBlockRootDiv.appendChild(createEl("br"));
        execCodeBlockRootDiv.appendChild(createEl("hr"));
        execCodeBlockRootDiv.appendChild(
          createEl("div", { cls: "exec_code_block_top_line" }, (el) => {
            el.appendChild(createEl("p", { text: "Exec Code Block" }));
            el.appendChild(
              createEl(
                "div",
                { cls: "exec_code_block_top_line_left" },
                (el) => {
                  el.appendChild(
                    createEl("button", { text: "exec" }, (btnEl) => {
                      btnEl.addEventListener("click", onClickExecBtnHandler);
                    })
                  );
                }
              )
            );
          })
        );
        execCodeBlockRootDiv.appendChild(
          createEl("p", { text: `cwd : ${execDir}` })
        );
        execCodeBlockRootDiv.appendChild(
          createEl("p", { text: `cmd : ${execCmd}` })
        );
        execCodeBlockRootDiv.appendChild(createEl("br"));
        execCodeBlockRootDiv.appendChild(outputEl);
      })
    );
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

import { exec } from "child_process";
import { writeFile } from "fs";
import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import { z } from "zod";

const ExecLangSettingSchema = z.object({
  lang: z.string(),
  filename: z.string(),
  execCmd: z.string(),
});
type ExecLangSetting = z.infer<typeof ExecLangSettingSchema>;

const ExecSettingsSchema = z.object({
  execDir: z.string(),
  codeCmd: z.string().optional(),
  execLangs: ExecLangSettingSchema.array(),
});
type ExecSettings = z.infer<typeof ExecSettingsSchema>;

interface MyPluginSettings {
  execSettings: string | undefined;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  execSettings: undefined,
};

export default class ExecCodeBlock extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    console.log("onload");
    await this.loadSettings();

    this.registerMarkdownPostProcessor((element, context) => {
      try {
        const execSettings = ExecSettingsSchema.parse(
          JSON.parse(this.settings.execSettings ?? "")
        );
        const codeblocks = element.findAll("code");
        for (const codeblock of codeblocks) {
          const langClassPrefix = "language-";
          // language-python -> python
          // language-python:tmp.py -> python
          const lang = codeblock.className.substring(
            codeblock.className.indexOf(langClassPrefix) +
              langClassPrefix.length,
            codeblock.className.indexOf(":") !== -1
              ? codeblock.className.indexOf(":")
              : undefined
          );

          console.log("--- --- ---");
          console.log("lang is", lang);
          console.log(codeblock.innerText);

          const execLangSetting = execSettings.execLangs.find(
            (e) => e.lang === lang
          );
          if (execLangSetting) {
            this.addExecCodeBlockArea(
              codeblock,
              execSettings.execDir,
              execSettings.codeCmd,
              execLangSetting
            );
          }
        }
      } catch (e) {
        console.error(e);
      }
    });

    this.addSettingTab(new ExecCodeBlockSettingTab(this.app, this));
  }

  addExecCodeBlockArea(
    codeblock: HTMLElement,
    execDir: string,
    codeCmd: string | undefined,
    execLangSetting: ExecLangSetting
  ) {
    codeblock.parentNode?.appendChild(
      createEl("div", { cls: "exec_code_block" }, (execCodeBlockRootDiv) => {
        const outputEl = createEl("p");

        const createExecTargetFile = () => {
          writeFile(
            `${execDir}/${execLangSetting.filename}`,
            codeblock.innerText,
            () => {}
          );
        };

        const onClickCodeBtnHandler = () => {
          if (!codeCmd) {
            return;
          }
          createExecTargetFile();
          exec(`${codeCmd} ${execDir}`, { cwd: execDir });
        };

        const onClickExecBtnHandler = () => {
          createExecTargetFile();
          outputEl.textContent = "Executing...";
          exec(
            execLangSetting.execCmd,
            { cwd: execDir },
            (err, stdout, stderr) => {
              outputEl.textContent =
                "--- stdout ---\n" + stdout + "\n--- stderr ---\n" + stderr;
            }
          );
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
                  if (codeCmd) {
                    el.appendChild(
                      createEl("button", { text: "code" }, (btnEl) => {
                        btnEl.addEventListener("click", onClickCodeBtnHandler);
                      })
                    );
                  }
                }
              )
            );
          })
        );
        execCodeBlockRootDiv.appendChild(
          createEl("p", { text: `cwd : ${execDir}` })
        );
        execCodeBlockRootDiv.appendChild(
          createEl("p", { text: `cmd : ${execLangSetting.execCmd}` })
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

    new Setting(containerEl)
      .setName("Exec Dir Full Path")
      .addTextArea((text) => {
        text
          .setPlaceholder("")
          .setValue(this.plugin.settings.execSettings ?? "")
          .onChange(async (value) => {
            this.plugin.settings.execSettings = value;
            await this.plugin.saveSettings();
          });
      });
  }
}

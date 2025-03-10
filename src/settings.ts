import { PluginSettingTab, Setting } from "obsidian";
import WheelTabSwitcher from "./main";
import { reloadPlugin } from "./utils/debug";
import { PLUGIN_ID } from "./constants";

export class WheelTabSwitcherSettingTab extends PluginSettingTab {
	constructor(public plugin: WheelTabSwitcher) {
		super(plugin.app, plugin);
	}

	display(): void {
		new Setting(this.containerEl).setName("debug").addToggle((toggle) => {
			toggle.setValue(this.plugin.settings.debug).onChange(async (val) => {
				this.plugin.settings.debug = val;
				await this.plugin.saveSettings();
				await reloadPlugin(this.app, PLUGIN_ID);
			});
		});
	}
}

export interface Settings {
	debug: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
	debug: false,
};

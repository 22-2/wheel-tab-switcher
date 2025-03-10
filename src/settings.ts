import { PluginSettingTab, Setting } from "obsidian";
import type WheelTabSwitcher from "./main";

export class WheelTabSwitcherSettingTab extends PluginSettingTab {
	constructor(public plugin: WheelTabSwitcher) {
		super(plugin.app, plugin);
	}

	display(): void {
		this.containerEl.empty();
		new Setting(this.containerEl).setName("debug").addToggle((toggle) => {
			toggle.setValue(this.plugin.settings.debug).onChange(async (val) => {
				this.plugin.settings.debug = val;
				await this.plugin.saveSettings();
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

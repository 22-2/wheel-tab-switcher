import { PluginSettingTab, Setting } from "obsidian";
import type WheelTabSwitcher from "./main";

export class WheelTabSwitcherSettingTab extends PluginSettingTab {
	constructor(public plugin: WheelTabSwitcher) {
		super(plugin.app, plugin);
	}

	display(): void {
		this.containerEl.empty();

		new Setting(this.containerEl).setName("⚙️ Wheel Tab Switcher Settings").setHeading();

		new Setting(this.containerEl)
			.setName("Top Bar Scroll Wheel Tab Switching")
			.setDesc("Allows you to switch tabs by scrolling the mouse wheel over the top bar (non-tab area) of the file pane.") // setDesc を追加
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.topBarScrollWheelTabSwitch).onChange(async (val) => {
					this.plugin.settings.topBarScrollWheelTabSwitch = val;
					await this.plugin.saveSettings();
				});
			});

		new Setting(this.containerEl).setName("🐞 Dev").setHeading();

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
	topBarScrollWheelTabSwitch: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
	debug: false,
	topBarScrollWheelTabSwitch: false,
};

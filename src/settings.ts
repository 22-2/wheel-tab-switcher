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
			.setName("Top Bar Wheel Tab Switching (🚧 experimental)")
			.setDesc("Allows you to switch tabs by scrolling the mouse wheel over the top bar (non-tab area) of the file pane. **⚠ Turning this on disable window dragging on the top bar.**")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.topBarWheelTabSwitch).onChange(async (val) => {
					this.plugin.settings.topBarWheelTabSwitch = val;
					await this.plugin.saveSettings();
					this.plugin.initTopBarWheelTabSwitch();
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
	topBarWheelTabSwitch: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
	debug: false,
	topBarWheelTabSwitch: false,
};

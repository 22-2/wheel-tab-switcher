import { PluginSettingTab, Setting } from "obsidian";
import type WheelTabSwitcher from "./main";

export class WheelTabSwitcherSettingTab extends PluginSettingTab {
	constructor(public plugin: WheelTabSwitcher) {
		super(plugin.app, plugin);
	}

	display(): void {
		this.containerEl.empty();

		new Setting(this.containerEl).setName("Enhancements");

		new Setting(this.containerEl)
			.setName("Scroll on Empty Tab Area to Switch (Experimental)")
			.setDesc(
				`Allows you to switch tabs by scrolling on the **empty space of the tab bar** (the area next to your tabs). **Warning:** This prevents dragging the window from that area when the "Hidden" frame style is enabled.`
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.topBarWheelTabSwitch)
					.onChange(async (val) => {
						this.plugin.settings.topBarWheelTabSwitch = val;
						await this.plugin.saveSettings();
						this.plugin.setTtleBarWheelTabSwitch();
					});
			});

		new Setting(this.containerEl).setName("Advanced");

		new Setting(this.containerEl)
			.setName("Skip tabs to switch")
			.setHeading();

		new Setting(this.containerEl)
			.setName("CSS-hidden tabs")
			.setDesc(
				"Skip tab headers that are hidden via CSS (display: none)."
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.skipCssHiddenTabs)
					.onChange(async (val) => {
						this.plugin.settings.skipCssHiddenTabs = val;
						await this.plugin.saveSettings();
					});
			});

		new Setting(this.containerEl)
			.setName("Unloaded plugin tabs")
			.setDesc(
				"Skip tabs whose plugin has not been loaded (data-type is undefined)."
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.skipUnloadedPluginTabs)
					.onChange(async (val) => {
						this.plugin.settings.skipUnloadedPluginTabs = val;
						await this.plugin.saveSettings();
					});
			});

		new Setting(this.containerEl).setName("Dev");

		new Setting(this.containerEl).setName("debug").addToggle((toggle) => {
			toggle
				.setValue(this.plugin.settings.debug)
				.onChange(async (val) => {
					this.plugin.settings.debug = val;
					await this.plugin.saveSettings();
				});
		});
	}
}

export interface Settings {
	debug: boolean;
	topBarWheelTabSwitch: boolean;
	skipCssHiddenTabs: boolean;
	skipUnloadedPluginTabs: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
	debug: false,
	topBarWheelTabSwitch: false,
	skipCssHiddenTabs: false,
	skipUnloadedPluginTabs: false,
};

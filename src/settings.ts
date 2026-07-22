import { PluginSettingTab, Setting } from "obsidian";
import type WheelTabSwitcher from "./main";

const EMPTY_TAB_AREA_NAME =
	"Scroll on empty tab area to switch (experimental)";
const EMPTY_TAB_AREA_DESC =
	'Allows you to switch tabs by scrolling on the **empty space of the tab bar** (the area next to your tabs). **Warning:** this prevents dragging the window from that area when the "hidden" frame style is enabled.';

type ToggleSettingGroup = {
	type: "group";
	heading: string;
	items: {
		name: string;
		desc?: string;
		control: {
			type: "toggle";
			key: keyof Settings;
		};
	}[];
};

export class WheelTabSwitcherSettingTab extends PluginSettingTab {
	constructor(public plugin: WheelTabSwitcher) {
		super(plugin.app, plugin);
	}

	getSettingDefinitions(): ToggleSettingGroup[] {
		return [
			{
				type: "group",
				heading: "Enhancements",
				items: [
					{
						name: EMPTY_TAB_AREA_NAME,
						desc: EMPTY_TAB_AREA_DESC,
						control: {
							type: "toggle",
							key: "topBarWheelTabSwitch",
						},
					},
				],
			},
			{
				type: "group",
				heading: "Advanced",
				items: [
					{
						name: "Css-hidden tabs",
						desc: "Skip tab headers that are hidden via CSS (display: none).",
						control: {
							type: "toggle",
							key: "skipCssHiddenTabs",
						},
					},
					{
						name: "Unloaded plugin tabs",
						desc: "Skip tabs whose plugin has not been loaded.",
						control: {
							type: "toggle",
							key: "skipUnloadedPluginTabs",
						},
					},
				],
			},
			{
				type: "group",
				heading: "Dev",
				items: [
					{
						name: "Debug",
						control: { type: "toggle", key: "debug" },
					},
				],
			},
		];
	}

	getControlValue(key: string): unknown {
		return isSettingKey(key) ? this.plugin.settings[key] : undefined;
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		if (!isSettingKey(key) || typeof value !== "boolean") return;

		this.plugin.settings[key] = value;
		await this.plugin.saveSettings();

		if (key === "topBarWheelTabSwitch") {
			this.plugin.setTtleBarWheelTabSwitch();
		}
	}

	display(): void {
		this.containerEl.empty();

		new Setting(this.containerEl).setName("Enhancements");

		new Setting(this.containerEl)
			.setName(EMPTY_TAB_AREA_NAME)
			.setDesc(EMPTY_TAB_AREA_DESC)
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
			.setName("Css-hidden tabs")
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
				"Skip tabs whose plugin has not been loaded."
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

		new Setting(this.containerEl).setName("Debug").addToggle((toggle) => {
			toggle
				.setValue(this.plugin.settings.debug)
				.onChange(async (val) => {
					this.plugin.settings.debug = val;
					await this.plugin.saveSettings();
				});
		});
	}
}

function isSettingKey(key: string): key is keyof Settings {
	return Object.hasOwn(DEFAULT_SETTINGS, key);
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

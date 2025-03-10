import { Plugin } from "obsidian";
import { findLeafByWheelEvent } from "src/helpers";
import {
	DEFAULT_SETTINGS,
	Settings,
	WheelTabSwitcherSettingTab,
} from "./settings";
import { getElectronMainWindow } from "./utils/electron";
import {
	getAllWorkspaceWindows,
	gotoLeftSiblingTab,
	gotoRightSiblingTab,
	notify,
} from "./utils/obsidian";
import { Logger, } from "tslog";
import { LogLevel } from "./constants";


/**
 * Obsidian plugin that allows switching between tabs using the mouse wheel
 * when hovering over tab headers
 */
export default class WheelTabSwitcher extends Plugin {
	settings: Settings = DEFAULT_SETTINGS;
	logger: Logger<unknown>;
	/**
	 * Creates a wheel event handler for a specific window
	 * @param win - The browser window object
	 * @returns A wheel event handler function
	 */
	private createWheelHandler(win: Window) {
		return (evt: WheelEvent) => {
			// Ensure window is focused
			getElectronMainWindow(win).focus();

			// Find the leaf (pane) associated with the wheel event
			const leaf = findLeafByWheelEvent(this.app, this, evt);

			if (!leaf) return; // console.warn("failed to get leaf");

			const isUp = evt.deltaY <= 0;
			if (isUp) {
				gotoLeftSiblingTab(this.app, leaf);
			} else {
				gotoRightSiblingTab(this.app, leaf);
			}
		};
	}

	/**
	 * Plugin initialization
	 */
	async onload() {
		this.logger = new Logger({ minLevel: this.settings.debug ? LogLevel.Error : LogLevel.Debug });

		if (window.Capacitor.getPlatform() !== "web") {
			return void notify("Mobile is not supported");
		}

		await this.loadSettings();
		this.addSettingTab(new WheelTabSwitcherSettingTab(this));

		// Register handler for new windows
		this.registerEvent(
			this.app.workspace.on("window-open", (wsWin) => {
				this.registerDomEvent(
					wsWin.win,
					"wheel",
					this.createWheelHandler(wsWin.win),
				);
			}),
		);

		// Register handler for the all windows
		getAllWorkspaceWindows(this.app).forEach((wsWin) => {
			this.registerDomEvent(
				wsWin.win,
				"wheel",
				this.createWheelHandler(wsWin.win),
			);
		});

		this.logger.debug("init: wheel tab switcher");
	}

	async loadSettings() {
		this.settings = Object.assign({}, await this.loadData(), DEFAULT_SETTINGS);
	}

	saveSettings() {
		return this.saveData(this.settings);
	}
}

import { Plugin } from "obsidian";
import { findLeafByWheelEvent } from "src/helpers";
import {
	DEFAULT_SETTINGS,
	Settings,
	WheelTabSwitcherSettingTab,
} from "./settings";
import { getElectronMainWindow } from "./utils/electron";
import { LoggerService } from "./utils/logger";
import {
	getAllWorkspaceWindows,
	gotoLeftSiblingTab,
	gotoRightSiblingTab,
	notify,
} from "./utils/obsidian";

/**
 * Obsidian plugin that allows switching between tabs using the mouse wheel
 * when hovering over tab headers
 */
export default class WheelTabSwitcher extends Plugin {
	settings: Settings = DEFAULT_SETTINGS;

	logger: LoggerService;

	/**
	 * Creates a wheel event handler for a specific window
	 * @param win - The browser window object
	 * @returns A wheel event handler function
	 */
	private createWheelHandler(win: Window) {
		return (evt: WheelEvent) => {
			this.logger.debug("called createWheelHandler");

			// Ensure window is focused
			getElectronMainWindow(win).focus();

			// Find the leaf (pane) associated with the wheel event
			const leaf = findLeafByWheelEvent(this, evt);

			if (!leaf) return;
			this.logger.debug("failed to get leaf");

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
		await this.loadSettings();
		this.logger = new LoggerService(this.settings);
		this.logger.debug("WheelTabSwitcher init");
		this.addSettingTab(new WheelTabSwitcherSettingTab(this));
		this.app.workspace.onLayoutReady(() => {
			if (window.Capacitor.getPlatform() !== "web") {
				return void notify("Mobile is not supported");
			}

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

			this.initTopBarWheelTabSwitch();
			this.logger.debug("init: wheel tab switcher");
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	saveSettings(settings: Settings = this.settings) {
		return this.saveData(settings);
	}

	initTopBarWheelTabSwitch() {
		document.body.classList.toggle("topbar-wheel-switch", this.settings.topBarWheelTabSwitch);
	}
}

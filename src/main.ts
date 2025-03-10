import { App, Plugin, WorkspaceWindow } from "obsidian";
import { findLeafByWheelEvent } from "src/helpers";
import { dev } from "./utils/debug";
import {
	getAllWorkspaceWindows,
	gotoLeftSiblingTab,
	gotoRightSiblingTab,
	notify,
} from "./utils/obsidian";
import { getElectronMainWindow } from "./utils/electron";
import { Settings, WheelTabSwitcherSettingTab } from "./settings";

/**
 * Obsidian plugin that allows switching between tabs using the mouse wheel
 * when hovering over tab headers
 */
export default class WheelTabSwitcher extends Plugin {
	settings: Settings;
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
			const leaf = findLeafByWheelEvent(this.app, evt);

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
	onload() {
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

		this.addSettingTab(new WheelTabSwitcherSettingTab(this));

		dev("init: wheel tab switcher");
	}
	saveSettings() {
		this.saveData(this.settings);
	}
}

import { Plugin } from "obsidian";
import { findLeafByWheelEvent } from "src/helpers";
import { dev } from "./utils/logger";
import {
	getAllWorkspaceWindows,
	gotoLeftTab,
	gotoRightTab,
	notify,
} from "./utils/obsidian";

/**
 * Obsidian plugin that allows switching between tabs using the mouse wheel
 * when hovering over tab headers
 */
export default class WheelTabSwitcher extends Plugin {
	/**
	 * Creates a wheel event handler for a specific window
	 * @param win - The browser window object
	 * @returns A wheel event handler function
	 */
	private createWheelHandler(win: Window) {
		return (evt: WheelEvent) => {
			// Ensure window is focused
			win.focus();

			// Find the leaf (pane) associated with the wheel event
			const leaf = findLeafByWheelEvent(evt, this.app);

			if (!leaf) return; // console.warn("failed to get leaf");

			const isUp = evt.deltaY <= 0;
			if (isUp) {
				gotoLeftTab(this.app, leaf);
			} else {
				gotoRightTab(this.app, leaf);
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

		dev("init: wheel tab switcher");
	}
}

import { Plugin, WorkspaceWindow } from "obsidian";
import { findLeafByWheelEvent } from "src/helper";
import { getElectronMainWindow, restoreMainWinIfMinimized } from "./utils/electron";
import { dev } from "./utils/logger";
import { gotoLeftTab, gotoRightTab, notify } from "./utils/obsidian";

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
			const currentMainWin = getElectronMainWindow(win);

			if (!currentMainWin) {
				return void notify("failed to find app window");
			}

			// Restore window if background
			currentMainWin.focus();

			// Find the leaf (pane) associated with the wheel event
			const leaf = findLeafByWheelEvent(evt);

			if (!leaf) return console.warn("failed to get leaf");

			// Slight delay to ensure UI is ready for tab switching
			setTimeout(() => {
				const isUp = evt.deltaY <= 0;
				if (isUp) {
					gotoLeftTab(leaf);
				} else {
					gotoRightTab(leaf);
				}
			});
		};
	}

	/**
	 * Plugin initialization
	 */
	onload() {
		// Register handler for new windows
		this.registerEvent(
			this.app.workspace.on("window-open", (win) => {
				win.win.addEventListener(
					"wheel",
					this.createWheelHandler(win.win, win)
				);
			})
		);

		// Clean up handlers when windows close
		this.registerEvent(
			this.app.workspace.on("window-close", (win) => {
				win.win.removeEventListener(
					"wheel",
					this.createWheelHandler(win.win, win)
				);
			})
		);

		// Register handler for the main window
		this.registerDomEvent(
			window,
			"wheel",
			this.createWheelHandler(window, this.app.workspace.rootSplit)
		);

		dev("init: wheel tab switcher");
	}
}

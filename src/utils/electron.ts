import { ElectronWindow } from "obsidian-typings";

/**
 * Gets the main Electron window associated with a renderer window
 * @param rendererWin - The renderer window object
 * @returns The corresponding Electron main window
 */
export function getMainWindow(rendererWin: Window): ElectronWindow {
	// @ts-expect-error
	return rendererWin.electronWindow;
}

/**
 * Restores a minimized window and brings it to focus
 * @param win - The Electron main window to restore
 */
export function restoreMainWinIfMinimized(win: ElectronWindow): void {
	if (win.isMinimized()) {
		win.restore();
	}
	win.focus();
}

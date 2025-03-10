import { ElectronWindow } from "obsidian-typings";

/**
 * Gets the main Electron window associated with a renderer window
 * @param rendererWin - The renderer window object
 * @returns The corresponding Electron main window
 */
export function getElectronMainWindow(rendererWin: Window): ElectronWindow {
	// @ts-expect-error
	return rendererWin.electronWindow;
}

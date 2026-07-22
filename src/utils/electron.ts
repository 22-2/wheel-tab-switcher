interface ElectronWindow {
	focus(): void;
}

type RendererWindow = Window & {
	electronWindow: ElectronWindow;
};

/**
 * Gets the main Electron window associated with a renderer window
 * @param rendererWin - The renderer window object
 * @returns The corresponding Electron main window
 */
export function getElectronMainWindow(rendererWin: Window): ElectronWindow {
	return (rendererWin as RendererWindow).electronWindow;
}

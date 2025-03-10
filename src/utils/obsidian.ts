import {
	WorkspaceWindow,
	WorkspaceParent,
	WorkspaceLeaf,
	Notice,
	App,
} from "obsidian";

/**
 * Retrieves workspace items of a specific type from all workspace leaves.
 *
 * @param app The application instance.
 * @param getItem A function that takes a workspace leaf and returns the workspace item or null/undefined if not found.
 * @returns An array of workspace items of type T.
 * @template T - The type of workspace item, must be either WorkspaceWindow or WorkspaceParent.
 */
function getWorkspaceItems<T extends WorkspaceWindow | WorkspaceParent>(
	app: App,
	getItem: (leaf: WorkspaceLeaf) => T | null | undefined,
): T[] {
	const itemMap = new Map<string, T>();
	getAllLeaves(app).forEach((leaf) => {
		const item = getItem(leaf);
		if (item && item.id) {
			itemMap.set(item.id, item);
		}
	});
	return Array.from(itemMap.values()) as T[];
}

/**
 * Gets all active workspace leaves (panes)
 * @param app - Obsidian app
 * @returns An array of all workspace leaves
 */
export function getAllLeaves(app: App): WorkspaceLeaf[] {
	const leaves: WorkspaceLeaf[] = [];
	app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
		leaves.push(leaf);
	});
	return leaves;
}

/**
 * Gets all workspace windows
 * @param app - Obsidian app
 * @returns An array of all workspace windows
 */
export function getAllWorkspaceWindows(app: App): WorkspaceWindow[] {
	return getWorkspaceItems<WorkspaceWindow>(app, (leaf) => leaf.getContainer());
}

/**
 * Focuses a specific leaf and handles special views
 * @param app - Obsidian app
 * @param leaf - The leaf to focus
 */
function focusLeaf(app: App, leaf: WorkspaceLeaf) {
	if (!leaf) return;

	app.workspace.setActiveLeaf(leaf, { focus: true });

	// Special handling for search view
	if (leaf.getViewState().type == "search") {
		const search = leaf.view.containerEl.find(".search-input-container input");
		search.focus();
	}
}

/**
 * Navigates to the sibling tab in the specified direction.
 * @param app - The Obsidian app instance
 * @param argLeaf - The reference leaf
 * @param direction - 1 for right, -1 for left
 */
function gotoSiblingTab(app: App, argLeaf: WorkspaceLeaf, direction: 1 | -1) {
	const siblingLeaves = argLeaf.parentSplit?.children;
	if (!siblingLeaves) return;

	const index = siblingLeaves.findIndex((leaf) => leaf.id === argLeaf.id);

	if (index === -1) {
		throw new Error(`Active leaf not found in sibling leaves. leafId: ${argLeaf.id}`);
	}

	const nextIndex = index + direction;
	let targetIndex = nextIndex;

	if (nextIndex < 0) {
		// Wrap around to the last tab if at the beginning (for left)
		targetIndex = siblingLeaves.length - 1;
	} else if (nextIndex >= siblingLeaves.length) {
		// Wrap around to the first tab if at the end (for right)
		targetIndex = 0;
	}

	focusLeaf(app, siblingLeaves[targetIndex]);
}

/**
 * Navigates to the tab to the right of the current tab
 * @param app - The Obsidian app instance
 * @param argLeaf - The reference leaf
 */
export function gotoRightSiblingTab(app: App, argLeaf: WorkspaceLeaf) {
	gotoSiblingTab(app, argLeaf, 1);
}

/**
 * Navigates to the tab to the left of the current tab
 * @param app - The Obsidian app instance
 * @param leaf - The reference leaf
 */
export function gotoLeftSiblingTab(app: App, argLeaf: WorkspaceLeaf) {
	gotoSiblingTab(app, argLeaf, -1);
}

/**
 * Shows a notification with the given text
 * @param text - The text or document fragment to display
 * @param timeoutMs - Optional timeout in milliseconds (undefined for no timeout)
 * @returns The created Notice object
 */
export function notify(
	text: string | DocumentFragment,
	timeoutMs?: number,
): Notice {
	return new Notice(text, timeoutMs ?? undefined);
}

/**
 * Gets the currently active leaf
 * @param app - Obsidian app
 * @returns The active workspace leaf
 */
export function getActiveLeaf(app: App) {
	return app.workspace.activeLeaf;
}

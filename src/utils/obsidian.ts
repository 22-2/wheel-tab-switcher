import {
	WorkspaceWindow,
	WorkspaceParent,
	WorkspaceLeaf,
	Notice,
} from "obsidian";

/**
 * Gets all active workspace leaves (panes)
 * @returns An array of all workspace leaves
 */
export function getAllLeaves(): WorkspaceLeaf[] {
	const leaves: WorkspaceLeaf[] = [];
	app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
		leaves.push(leaf);
	});
	return leaves;
}

/**
 * Gets all workspace windows
 * @returns An array of all workspace windows
 */
export function getAllWorkspaceWindows(): WorkspaceWindow[] {
	const windowMap = new Map();
	getAllLeaves().forEach((leaf) => {
		const container = leaf.getContainer();
		// Overwrite if ID already exists
		windowMap.set(container.id, container);
	});
	return Array.from(windowMap.values()) as WorkspaceWindow[];
}

/**
 * Gets all workspace parent splits
 * @returns An array of all workspace parent containers
 */
export function getAllWorkspaceParents(): WorkspaceParent[] {
	const windowMap = new Map();
	getAllLeaves().forEach((leaf) => {
		const container = leaf.parentSplit!;
		// Overwrite if ID already exists
		windowMap.set(container.id, container);
	});
	return Array.from(windowMap.values()) as WorkspaceParent[];
}

/**
 * Focuses a specific leaf and handles special views
 * @param leaf - The leaf to focus
 */
function focusLeaf(leaf: WorkspaceLeaf) {
	if (!leaf) return;

	app.workspace.setActiveLeaf(leaf, { focus: true });

	// Special handling for search view
	if (leaf.getViewState().type == "search") {
		const search = leaf.view.containerEl.find(".search-input-container input");
		search.focus();
	}
}

/**
 * Navigates to the tab to the right of the current tab
 * @param app - The Obsidian app instance
 * @param leaf - The reference leaf
 */
export function gotoRightTab(leaf: WorkspaceLeaf) {
	if (!leaf) return;

	const leaves = getAllLeaves().filter(
		(l) => l.parentSplit === leaf.parentSplit
	);
	const index = leaves.indexOf(leaf);

	if (index === -1) {
		console.error("failed to find tab. leaf:", leaf);
		return;
	}

	// Wrap around to the first tab if at the end
	if (index === leaves.length - 1) {
		focusLeaf(leaves[0]);
	} else {
		focusLeaf(leaves[index + 1]);
	}
}

/**
 * Navigates to the tab to the left of the current tab
 * @param app - The Obsidian app instance
 * @param leaf - The reference leaf
 */
export function gotoLeftTab(leaf: WorkspaceLeaf) {
	if (!leaf) return;

	const leaves = getAllLeaves().filter(
		(l) => l.parentSplit === leaf.parentSplit
	);
	const index = leaves.indexOf(leaf);

	if (index === -1) {
		console.error("failed to find tab. leaf:", leaf);
		return;
	}

	// Wrap around to the last tab if at the beginning
	if (index === 0) {
		focusLeaf(leaves[leaves.length - 1]);
	} else {
		focusLeaf(leaves[index - 1]);
	}
}

/**
 * Shows a notification with the given text
 * @param text - The text or document fragment to display
 * @param timeoutMs - Optional timeout in milliseconds (undefined for no timeout)
 * @returns The created Notice object
 */
export function notify(
	text: string | DocumentFragment,
	timeoutMs?: number
): Notice {
	return new Notice(text, timeoutMs ?? undefined);
}

/**
 * Gets the currently active leaf
 * @returns The active workspace leaf
 */
export function getActiveLeaf() {
	return app.workspace.activeLeaf;
}

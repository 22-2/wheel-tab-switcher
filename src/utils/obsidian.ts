import {
	WorkspaceWindow,
	WorkspaceParent,
	WorkspaceLeaf,
	Notice,
	App,
    WorkspaceContainer,
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
export function getAllWorkspaceWindows(app: App): WorkspaceContainer[] {
	return getWorkspaceItems<WorkspaceContainer>(app, (leaf) => leaf.getContainer());
}

/**
 * Gets all workspace parent splits
 * @returns An array of all workspace parent containers
 */
export function getAllWorkspaceParents(app: App): WorkspaceParent[] {
	return getWorkspaceItems<WorkspaceParent>(app, (leaf) => leaf.parentSplit);
}

/**
 * Checks if a tab header element is hidden via CSS (display: none on itself or an ancestor).
 * @param el - The tab header element to check
 * @returns true if the element is effectively hidden
 */
function isTabHeaderHidden(el: HTMLElement): boolean {
	if (!el) return true;
	return !el.isShown();
}

/**
 * Checks if a leaf's plugin has not been loaded.
 * Detects via the ghost icon which is used by Obsidian's internal unknown view (BD).
 * @param leaf - The workspace leaf to check
 * @returns true if the leaf's plugin appears unloaded
 */
function isUnloadedPluginLeaf(leaf: WorkspaceLeaf): boolean {
	// BD (unknown view) uses lucide-ghost icon when plugin is not loaded
	return leaf.tabHeaderEl.find("svg")?.classList.contains("lucide-ghost");
}

export type SkipOptions = {
	skipCssHiddenTabs?: boolean;
	skipUnloadedPluginTabs?: boolean;
};

function shouldSkipLeaf(leaf: WorkspaceLeaf, options: SkipOptions): boolean {
	if (options.skipCssHiddenTabs && isTabHeaderHidden(leaf.tabHeaderEl)) return true;
	if (options.skipUnloadedPluginTabs && isUnloadedPluginLeaf(leaf)) return true;
	return false;
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
 * @param skipOptions - Options controlling which tabs to skip
 */
function gotoSiblingTab(
	app: App,
	argLeaf: WorkspaceLeaf,
	direction: 1 | -1,
	skipOptions: SkipOptions = {},
) {
	const siblingLeaves = argLeaf.parentSplit?.children;
	if (!siblingLeaves) return;

	const index = siblingLeaves.findIndex((leaf) => leaf.id === argLeaf.id);

	if (index === -1) {
		throw new Error(
			`Active leaf not found in sibling leaves. leafId: ${argLeaf.id}`,
		);
	}

	let targetIndex = index;
	let steps = 0;
	const maxSteps = siblingLeaves.length;

	while (steps < maxSteps) {
		targetIndex += direction;

		if (targetIndex < 0) {
			targetIndex = siblingLeaves.length - 1;
		} else if (targetIndex >= siblingLeaves.length) {
			targetIndex = 0;
		}

		steps++;

		if (!skipOptions.skipCssHiddenTabs && !skipOptions.skipUnloadedPluginTabs) break;

		const candidateLeaf = siblingLeaves[targetIndex];
		if (!shouldSkipLeaf(candidateLeaf, skipOptions)) break;
	}

	focusLeaf(app, siblingLeaves[targetIndex]);
}

/**
 * Navigates to the tab to the right of the current tab
 * @param app - The Obsidian app instance
 * @param argLeaf - The reference leaf
 * @param skipOptions - Options controlling which tabs to skip
 */
export function gotoRightSiblingTab(
	app: App,
	argLeaf: WorkspaceLeaf,
	skipOptions: SkipOptions = {},
) {
	gotoSiblingTab(app, argLeaf, 1, skipOptions);
}

/**
 * Navigates to the tab to the left of the current tab
 * @param app - The Obsidian app instance
 * @param argLeaf - The reference leaf
 * @param skipOptions - Options controlling which tabs to skip
 */
export function gotoLeftSiblingTab(
	app: App,
	argLeaf: WorkspaceLeaf,
	skipOptions: SkipOptions = {},
) {
	gotoSiblingTab(app, argLeaf, -1, skipOptions);
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

export function highlightLeaf(leaf: WorkspaceLeaf) {
	leaf.highlight();
	setTimeout(() => leaf.unhighlight(), 300);
}

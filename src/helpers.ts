import { App } from "obsidian";
import { getAllLeaves, getAllWorkspaceParents } from "./utils/obsidian";

/**
 * Determines if the wheel event occurred within a tab container
 * @param evt - The wheel event to check
 * @returns Boolean indicating if the event occurred in a tab container
 */
export function checkIsWheelInTabContainer(evt: WheelEvent): boolean {
	const el = evt.target as HTMLElement | null;
	if (!el) return false;

	return Boolean(
		el.closest(".workspace-tab-header") || el.find(".workspace-tab-header"),
	);
}

/**
 * Finds the leaf (pane) associated with a wheel event on tab headers
 * @param evt - The wheel event to process
 * @returns The leaf object if found, otherwise null or undefined
 */
export function findLeafByWheelEvent(evt: WheelEvent, app: App) {
	// Early return if the wheel event is not in a tab container
	if (!checkIsWheelInTabContainer(evt)) {
		return;
	}

	// First, search from the tab container
	const wheeledTabHeader = (evt.target as HTMLElement)
		.closest(".workspace-tab-header-container")
		?.find(".workspace-tab-header.is-active");

	if (!wheeledTabHeader) return;

	// Get all workspace parents
	const wsParents = getAllWorkspaceParents(app);

	// Find the leaf that matches the active tab header
	const wheeledLeaf = getAllLeaves(app).find((leaf) =>
		leaf.tabHeaderEl.isEqualNode(wheeledTabHeader),
	);

	if (!wheeledLeaf) return;

	// Find the parent container that contains the active tab header
	const wheeledParent = wsParents.find((split) =>
		split.containerEl.contains(wheeledTabHeader),
	);

	if (!wheeledParent) return;

	// Find the leaf in the parent container that matches the wheeled leaf
	return wheeledParent.children.find((leaf) => leaf.id === wheeledLeaf.id);
}

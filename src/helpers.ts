import { App } from "obsidian";
import { getAllLeaves } from "./utils/obsidian";

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
 * @param app - Obsidian app
 * @returns The leaf object if found, otherwise null or undefined
 */
export function findLeafByWheelEvent(app: App, evt: WheelEvent) {
	// Early return if the wheel event is not in a tab container
	if (!checkIsWheelInTabContainer(evt)) {
		return;
	}

	// First, search from the tab container
	const wheeledTabHeaderContainer = (evt.target as HTMLElement).closest(".workspace-tab-header-container");
	if (!wheeledTabHeaderContainer) return;

	const wheeledTabHeader = wheeledTabHeaderContainer.find(".workspace-tab-header.is-active");
	if (!wheeledTabHeader) return;

	// Find the leaf that matches the active tab header
	const wheeledLeaf = getAllLeaves(app).find((leaf) =>
		leaf.tabHeaderEl.isEqualNode(wheeledTabHeader),
	);
	if (!wheeledLeaf) return;

	return wheeledLeaf;
}

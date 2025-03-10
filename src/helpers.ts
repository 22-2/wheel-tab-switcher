import { App } from "obsidian";
import { dev, unsafeCheckIsDebug } from "./utils/debug";
import {
	getAllLeaves,
	getAllWorkspaceParents,
	highlight,
} from "./utils/obsidian";

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
 *
 * **This meticulous approach is essential to prevent unexpected tab focus jumps.**
 * **Without this careful method to identify the correct leaf associated with the wheel event on tab headers,**
 * **the focus might suddenly shift to a different, unintended tab, causing a jarring user experience.**
 *
 * This function carefully navigates the DOM structure to accurately pinpoint the target leaf by:
 * 1. Verifying the wheel event originates within a tab container.
 * 2. Locating the active tab header element that was wheeled on.
 * 3. Traversing the workspace hierarchy to find relevant parent containers.
 * 4. Matching the active tab header to its corresponding leaf element.
 * 5. Ensuring the found leaf belongs to the correct workspace container.
 *
 * By performing these checks, the function avoids ambiguity and ensures the correct leaf is identified,
 * thus preventing erratic focus behavior and providing a smooth and predictable user interaction when using the mouse wheel on tab headers.
 */
export function findLeafByWheelEvent(app: App, evt: WheelEvent) {
	dev("findLeafByWheelEvent started", evt);

	// Early return if the wheel event is not in a tab container
	if (!checkIsWheelInTabContainer(evt)) {
		return dev("Wheel event is not in a tab container, early return.");
	}
	dev("Wheel event is in a tab container.");

	// First, search from the tab container
	const wheeledTabContainer = (evt.target as HTMLElement).closest(
		".workspace-tab-header-container",
	);
	dev("wheeledTabContainer:", wheeledTabContainer);

	if (!wheeledTabContainer) {
		return dev("wheeledTabContainer is null, return.");
	}

	const wheeledTabHeader =
		wheeledTabContainer.querySelector(".workspace-tab-header.is-active") ||
		wheeledTabContainer.querySelector(".workspace-tab-header");
	dev("wheeledTabHeader:", wheeledTabHeader);

	if (!wheeledTabHeader) {
		return dev("wheeledTabHeader is null, return.");
	}

	// Get all workspace parents
	const wsParents = getAllWorkspaceParents(app);
	dev("wsParents:", wsParents);

	// Find the leaf that matches the active tab header
	const wheeledLeaf = getAllLeaves(app).find((leaf) =>
		leaf.tabHeaderEl.isEqualNode(wheeledTabHeader),
	);
	dev("wheeledLeaf:", wheeledLeaf);

	if (!wheeledLeaf) {
		return dev("wheeledLeaf is null, return.");
	}

	if (unsafeCheckIsDebug()) {
		highlight(wheeledLeaf);
	}

	// Find the parent container that contains the active tab header
	const wheeledParent = wsParents.find((split) =>
		split.containerEl.contains(wheeledTabHeader),
	);
	dev("wheeledParent:", wheeledParent);

	if (!wheeledParent) {
		return dev("wheeledParent is null, return.");
	}

	// Find the leaf in the parent container that matches the wheeled leaf
	const foundLeaf = wheeledParent.children.find(
		(leaf) => leaf.id === wheeledLeaf.id,
	);
	dev("foundLeaf:", foundLeaf);
	return foundLeaf;
}

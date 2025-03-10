import { App } from "obsidian";
import {
	getAllLeaves,
	getAllWorkspaceParents,
	highlight,
} from "./utils/obsidian";
import type WheelTabSwitcher from "./main";

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
export function findLeafByWheelEvent(
	plugin: WheelTabSwitcher,
	evt: WheelEvent,
) {
	const logger = plugin.logger;
	logger.debug("findLeafByWheelEvent started", evt);

	// Early return if the wheel event is not in a tab container
	if (!checkIsWheelInTabContainer(evt)) {
		return void logger.debug(
			"Wheel event is not in a tab container, early return.",
		);
	}
	logger.debug("Wheel event is in a tab container.");

	// First, search from the tab container
	const wheeledTabContainer = (evt.target as HTMLElement).closest(
		".workspace-tab-header-container",
	);

	if (!wheeledTabContainer) {
		return void logger.debug("wheeledTabContainer is null, return.");
	}

	if (plugin.settings.debug) highlightElement(wheeledTabContainer as HTMLElement);

	const wheeledTabHeader =
		wheeledTabContainer.querySelector(".workspace-tab-header.is-active") ||
		wheeledTabContainer.querySelector(".workspace-tab-header");

	if (!wheeledTabHeader) {
		return void logger.debug("wheeledTabHeader is null, return.");
	}

	if (plugin.settings.debug) highlightElement(wheeledTabHeader as HTMLElement, "red");

	// Get all workspace parents
	const wsParents = getAllWorkspaceParents(plugin.app);
	// logger.debug("wsParents:", wsParents);

	// Find the leaf that matches the active tab header
	const wheeledLeaf = getAllLeaves(plugin.app).find((leaf) =>
		leaf.tabHeaderEl.isEqualNode(wheeledTabHeader),
	);
	// logger.debug("wheeledLeaf:", wheeledLeaf);

	if (!wheeledLeaf) {
		return void logger.warn("wheeledLeaf is null, return.");
	}

	if (plugin.settings.debug) {
		highlight(wheeledLeaf);
	}

	// Find the parent container that contains the active tab header
	const wheeledParent = wsParents.find((split) =>
		split.containerEl.contains(wheeledTabHeader),
	);
	// logger.debug("wheeledParent:", wheeledParent);

	if (!wheeledParent) {
		return void logger.warn("wheeledParent is null, return.");
	}

	// Find the leaf in the parent container that matches the wheeled leaf
	const foundLeaf = wheeledParent.children.find(
		(leaf) => leaf.id === wheeledLeaf.id,
	);
	logger.debug("foundLeaf:", foundLeaf);
	return foundLeaf;
}

function highlightElement(element: HTMLElement, color = 'yellow') {
	element.style.backgroundColor = color; // ハイライト色に変更

	setTimeout(() => {
		element.style.backgroundColor = "initial"; // 元の背景色に戻す
	}, 300); // 300ミリ秒後に戻す（durationはお好みで調整してください）
}

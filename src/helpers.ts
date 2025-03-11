import { App } from "obsidian";
import {
	getAllLeaves,
	getAllWorkspaceParents,
	highlightLeaf,
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
 * Finds the leaf (pane) associated with a wheel event on tab headers.
 * Prevents unexpected tab focus jumps when scrolling on tabs.
 * @param evt - The wheel event
 * @returns The leaf object or null if not found
 */
export function findLeafByWheelEvent(
	plugin: WheelTabSwitcher,
	evt: WheelEvent,
) {
	const logger = plugin.logger;
	logger.debug("findLeafByWheelEvent started", evt);

	// Return early if wheel event is not in a tab container
	if (!checkIsWheelInTabContainer(evt)) {
		return void logger.debug(
			"Wheel event is not in a tab container, early return.",
		);
	}
	logger.debug("Wheel event is in a tab container.");

	// Get the tab container element
	const wheeledTabContainer = (evt.target as HTMLElement).closest(
		".workspace-tab-header-container",
	);

	if (!wheeledTabContainer) {
		return void logger.debug("wheeledTabContainer is null, return.");
	}

	if (plugin.settings.debug)
		highlightElement(wheeledTabContainer as HTMLElement);

	// Get the active or any tab header element
	const wheeledTabHeader =
		wheeledTabContainer.find(".workspace-tab-header.is-active") ||
		wheeledTabContainer.find(".workspace-tab-header");

	if (!wheeledTabHeader) {
		return void logger.debug("wheeledTabHeader is null, return.");
	}

	if (plugin.settings.debug)
		highlightElement(wheeledTabHeader as HTMLElement, "red");

	// Get all workspace parents
	const wsParents = getAllWorkspaceParents(plugin.app);

	// Find the leaf matching the wheeled tab header
	const wheeledLeaf = getAllLeaves(plugin.app).find((leaf) =>
		leaf.tabHeaderEl.isEqualNode(wheeledTabHeader),
	);

	if (!wheeledLeaf) {
		return void logger.warn("wheeledLeaf is null, return.");
	}

	if (plugin.settings.debug) {
		highlightLeaf(wheeledLeaf);
	}

	// Find parent workspace containing the wheeled tab header
	const wheeledParent = wsParents.find((split) =>
		split.containerEl.contains(wheeledTabHeader),
	);

	if (!wheeledParent) {
		return void logger.warn("wheeledParent is null, return.");
	}

	// Find the wheeled leaf within the parent workspace

	const foundLeaf = wheeledParent.children.find(
		(leaf) => leaf.id === wheeledLeaf.id,
	);

	logger.debug("foundLeaf:", foundLeaf);

	return foundLeaf;
}

function highlightElement(el: HTMLElement, color = "yellow") {
	const prefix = "wts-highlight";
	el.addClass(prefix, color);
	setTimeout(() => {
		el.removeClass(prefix, color);
	}, 300);
}

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
 * Finds the leaf associated with a wheel event on tab headers to prevent focus jumps.
 * Without this detailed approach, whell on tab headers could cause unexpected tab focus changes.
 * @param evt - The wheel event
 * @returns The leaf object or null if not found
 */
export function findLeafByWheelEvent(
	plugin: WheelTabSwitcher,
	evt: WheelEvent,
) {
	const logger = plugin.logger;
	logger.debug("findLeafByWheelEvent started", evt);

	// Check if the wheel event is within a tab container.
	if (!checkIsWheelInTabContainer(evt)) {
		return void logger.debug(
			"Wheel event is not in a tab container, early return.",
		);
	}
	logger.debug("Wheel event is in a tab container.");

	// Get the tab container element that received the wheel event.
	const wheeledTabContainer = (evt.target as HTMLElement).closest(
		".workspace-tab-header-container",
	);

	// If no tab container is found, return.
	if (!wheeledTabContainer) {
		return void logger.debug("wheeledTabContainer is null, return.");
	}

	if (plugin.settings.debug)
		highlightElement(wheeledTabContainer as HTMLElement);

	// Get the active tab header, or any tab header if none is active within the container.
	const wheeledTabHeader =
		wheeledTabContainer.find(".workspace-tab-header.is-active") ||
		wheeledTabContainer.find(".workspace-tab-header");

	// If no tab header is found, return.
	if (!wheeledTabHeader) {
		return void logger.debug("wheeledTabHeader is null, return.");
	}

	if (plugin.settings.debug)
		highlightElement(wheeledTabHeader as HTMLElement, "red");

	// Find the leaf (pane) that corresponds to the wheeled tab header.
	const wheeledLeaf = getAllLeaves(plugin.app).find((leaf) =>
		leaf.tabHeaderEl.isEqualNode(wheeledTabHeader),
	);

	// If no matching leaf is found, return.
	if (!wheeledLeaf) {
		return void logger.warn("wheeledLeaf is null, return.");
	}

	if (plugin.settings.debug) {
		highlightLeaf(wheeledLeaf);
	}

	// Get all workspace parents (splits).
	const wsParents = getAllWorkspaceParents(plugin.app);

	// Find the workspace parent that contains the wheeled tab header.
	const wheeledParent = wsParents.find((split) =>
		split.containerEl.contains(wheeledTabHeader),
	);

	// If no parent workspace is found, return.
	if (!wheeledParent) {
		return void logger.warn("wheeledParent is null, return.");
	}

	// Find the specific leaf within the parent workspace that matches the wheeled leaf.
	const foundLeaf = wheeledParent.children.find(
		(leaf) => leaf.id === wheeledLeaf.id,
	);

	logger.debug("foundLeaf:", foundLeaf);

	// Return the found leaf.
	return foundLeaf;
}

function highlightElement(el: HTMLElement, color = "yellow") {
	const prefix = "wts-highlight";
	el.addClass(prefix, color);
	setTimeout(() => {
		el.removeClass(prefix, color);
	}, 300);
}

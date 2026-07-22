import type { WorkspaceItem as ObsidianWorkspaceItem } from "obsidian";
import "obsidian";

declare module "obsidian" {
	interface WorkspaceItem {
		id: string;
		children: ObsidianWorkspaceItem[];
	}
}

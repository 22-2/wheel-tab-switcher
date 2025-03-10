import "obsidian-typings";
import "obsidian";

declare module "obsidian" {
	interface WorkspaceItem {
		id: string;
		children: WorkspaceLeaf[];
	}
}

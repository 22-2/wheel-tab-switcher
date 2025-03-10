import { App } from "obsidian";
import { notify } from "./obsidian";
import { PLUGIN_ID } from "src/constants";

export class logger {
	get dev() {
		if (unsafeCheckIsDebug()) {
			return () => { };
		}
		return global.console.log.bind(console);
	}
}

export const dev = new logger().dev;

export function unsafeCheckIsDebug() {
	/* @ts-expect-error */
	return app.plugins.plugins[PLUGIN_ID].settings.debug;
}

export async function reloadPlugin(app: App, pluginId: string) {
	try {
		await app.plugins.disablePlugin(pluginId);
		await app.plugins.enablePlugin(pluginId);
		notify(`reloaded`);
	} catch (error) {
		notify(`Failed to reload plugin`);
	}
}

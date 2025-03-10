import { App } from "obsidian";
import type WheelTabSwitcher from "src/main";
import { Settings } from "src/settings";

export class LoggerService {
	constructor(private plugin: WheelTabSwitcher) { }

	info(...args: any) {
		global.console.info(...args);
	}

	warn(...args: any) {
		if (this.plugin.settings.debug) {
			global.console.warn(...args);
		}
	}

	debug(...args: any) {
		if (this.plugin.settings.debug) {
			global.console.debug(...args);
		}
	}
}

import { Settings } from "src/settings";

export class LoggerService {
	constructor(private settings: Settings) {}

	info(...args: any) {
		console.info(...args);
	}

	warn(...args: any) {
		if (this.settings.debug) {
			console.warn(...args);
		}
	}

	debug(...args: any) {
		if (this.settings.debug) {
			console.debug(...args);
		}
	}
}

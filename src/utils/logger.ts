import { type Settings } from "src/settings";

export class LoggerService {
	constructor(private settings: Settings) {}

	warn(...args: unknown[]) {
		if (this.settings.debug) {
			console.warn(...args);
		}
	}

	debug(...args: unknown[]) {
		if (this.settings.debug) {
			console.debug(...args);
		}
	}
}

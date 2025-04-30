#!/usr/bin/env node

/**
 * A modular Node.js script to automate version updates in package.json, manifest.json, and versions.json files,
 * create Git tags, and push them to origin.
 *
 * Usage:
 * npm run version:update - Update version in files only
 * npm run version:commit - Update version and commit changes
 * npm run version:tag - Update version, commit changes, and create a tag
 * npm run version:push - Update version, commit changes, create a tag, and push to origin
 * npm run version:all - Execute all steps
 */

import readline from "readline";
import fs from "fs";
import semver from "semver";
import { execSync } from "child_process";

// =========== Configuration ===========

const CONFIG = {
	files: {
		package: {
			path: "package.json",
			space: "\t",
		},
		manifest: {
			path: "manifest.json",
			space: "\t",
		},
		versions: {
			path: "versions.json",
			space: "\t",
		},
	},
	git: {
		tagPrefix: "",
	},
};

// =========== File Operations ===========

class FileManager {
	/**
	 * Reads and parses a JSON file.
	 * @param {string} filePath - The path to the JSON file
	 * @returns {object} The parsed JSON object
	 * @throws {Error} If the file cannot be read or parsed
	 */
	static readJsonFile(filePath) {
		try {
			const fileContent = fs.readFileSync(filePath, "utf8");
			return JSON.parse(fileContent);
		} catch (error) {
			console.error(`Error reading or parsing ${filePath}:`, error);
			throw new Error(`Failed to read or parse ${filePath}`);
		}
	}

	/**
	 * Writes a JSON object to a file.
	 * @param {string} filePath - The path to the JSON file
	 * @param {object} jsonData - The JSON object to write
	 * @param {string|number} space - Optional spacing for formatting
	 * @throws {Error} If the file cannot be written
	 */
	static writeJsonFile(filePath, jsonData, space) {
		try {
			const formattedJson = JSON.stringify(jsonData, null, space) + "\n"; // Add newline at the end
			fs.writeFileSync(filePath, formattedJson);
		} catch (error) {
			console.error(`Error writing to ${filePath}:`, error);
			throw new Error(`Failed to write to ${filePath}`);
		}
	}
}

// =========== Version Management ===========

class VersionManager {
	/**
	 * Gets the current version from package.json.
	 * @returns {string} The current version
	 */
	static getCurrentVersion() {
		return FileManager.readJsonFile(CONFIG.files.package.path).version;
	}

	/**
	 * Updates the version in a JSON file.
	 * @param {string} filePath - The path to the JSON file
	 * @param {string} newVersion - The new version to set
	 * @param {string|number} space - Optional spacing for formatting
	 * @returns {boolean} True if updated successfully, false otherwise
	 */
	static updateVersionInFile(filePath, newVersion, space) {
		try {
			const jsonData = FileManager.readJsonFile(filePath);
			jsonData.version = newVersion;
			FileManager.writeJsonFile(filePath, jsonData, space);
			console.log(`${filePath} updated to version ${newVersion}.`);
			return true;
		} catch (error) {
			console.error(`Error updating ${filePath}:`, error);
			return false;
		}
	}

	/**
	 * Updates the versions.json file with a new version entry.
	 * @param {string} newVersion - The new version to add
	 * @returns {boolean} True if updated successfully, false otherwise
	 */
	static updateVersionsJson(newVersion) {
		try {
			const versionsFile = CONFIG.files.versions.path;
			const manifestFile = CONFIG.files.manifest.path;

			const versions = FileManager.readJsonFile(versionsFile);
			const manifest = FileManager.readJsonFile(manifestFile);

			versions[newVersion] = manifest.minAppVersion;

			FileManager.writeJsonFile(
				versionsFile,
				versions,
				CONFIG.files.versions.space
			);
			console.log(`${versionsFile} updated with version ${newVersion}.`);
			return true;
		} catch (error) {
			console.error(`Error updating versions.json:`, error);
			return false;
		}
	}

	/**
	 * Updates all version files with the new version.
	 * @param {string} newVersion - The new version to set
	 * @returns {boolean} True if all files were updated successfully
	 */
	static updateAllVersionFiles(newVersion) {
		const packageUpdated = this.updateVersionInFile(
			CONFIG.files.package.path,
			newVersion,
			CONFIG.files.package.space
		);

		const manifestUpdated = this.updateVersionInFile(
			CONFIG.files.manifest.path,
			newVersion,
			CONFIG.files.manifest.space
		);

		const versionsUpdated = this.updateVersionsJson(newVersion);

		return packageUpdated && manifestUpdated && versionsUpdated;
	}
}

// =========== Git Operations ===========

class GitManager {
	/**
	 * Executes a Git command.
	 * @param {string} command - The Git command to execute
	 * @param {string} successMessage - Message to log on success
	 * @param {string} errorMessage - Message to log on error
	 * @returns {boolean} True if command execution is successful
	 */
	static executeCommand(command, successMessage, errorMessage) {
		try {
			execSync(command);
			console.log(successMessage);
			return true;
		} catch (error) {
			console.error(errorMessage, error);
			return false;
		}
	}

	/**
	 * Stages specified files.
	 * @param {string[]} files - Array of file paths to stage
	 * @returns {boolean} True if staging is successful
	 */
	static stageFiles(files) {
		const fileList = files.join(" ");
		return this.executeCommand(
			`git add ${fileList}`,
			`Staged files: ${fileList}`,
			"Error staging files:"
		);
	}

	/**
	 * Commits staged changes.
	 * @param {string} message - Commit message
	 * @returns {boolean} True if commit is successful
	 */
	static commit(message) {
		return this.executeCommand(
			`git commit -m "${message}"`,
			`Committed: ${message}`,
			"Error committing changes:"
		);
	}

	/**
	 * Creates a Git tag.
	 * @param {string} version - The version to tag
	 * @returns {boolean} True if tag creation is successful
	 */
	static createTag(version) {
		const tagName = `${CONFIG.git.tagPrefix}${version}`;
		return this.executeCommand(
			`git tag ${tagName}`,
			`Git tag ${tagName} created locally.`,
			"Error creating Git tag:"
		);
	}

	/**
	 * Pushes a Git tag to the remote origin.
	 * @param {string} version - The version of the tag to push
	 * @returns {boolean} True if push is successful
	 */
	static pushTag(version) {
		const tagName = `${CONFIG.git.tagPrefix}${version}`;
		return this.executeCommand(
			`git push origin ${tagName}`,
			`Git tag ${tagName} pushed to origin.`,
			"Error pushing Git tag:"
		);
	}
}

// =========== User Interaction ===========

class UserInteraction {
	constructor() {
		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
	}

	/**
	 * Closes the readline interface.
	 */
	close() {
		this.rl.close();
	}

	/**
	 * Asks the user for the type of version update.
	 * @param {string} currentVersion - The current version
	 * @returns {Promise<string|null>} A promise that resolves with the update type or null
	 */
	async askUpdateType(currentVersion) {
		return new Promise((resolve) => {
			this.rl.question(
				`Current version is ${currentVersion}. What type of update? (major, minor, patch, ma, mi, pa): `,
				(updateTypeInput) => {
					const updateType = updateTypeInput.trim().toLowerCase();
					let normalizedUpdateType;

					switch (updateType) {
						case "ma":
						case "major":
							normalizedUpdateType = "major";
							break;
						case "mi":
						case "minor":
							normalizedUpdateType = "minor";
							break;
						case "pa":
						case "patch":
							normalizedUpdateType = "patch";
							break;
						default:
							console.log(
								"Invalid update type. Please choose major, minor, patch, ma, mi, or pa."
							);
							resolve(null);
							return;
					}

					resolve(normalizedUpdateType);
				}
			);
		});
	}

	/**
	 * Asks a yes/no question to the user.
	 * @param {string} question - The question to ask
	 * @returns {Promise<boolean>} A promise that resolves to true for "yes"
	 */
	async askYesNo(question) {
		return new Promise((resolve) => {
			this.rl.question(`${question} (yes/no): `, (answer) => {
				const normalizedAnswer = answer.trim().toLowerCase();
				resolve(normalizedAnswer.startsWith("y"));
			});
		});
	}
}

// =========== Command Modules ===========

class VersionCommands {
	/**
	 * Updates version in all files.
	 * @param {string} updateType - The type of update (major, minor, patch)
	 * @returns {Promise<string|null>} The new version or null if failed
	 */
	static async updateVersion(updateType) {
		const currentVersion = VersionManager.getCurrentVersion();
		const newVersion = semver.inc(currentVersion, updateType);

		if (!newVersion) {
			console.error(
				"Failed to increment version. Please check semver input."
			);
			return null;
		}

		if (!VersionManager.updateAllVersionFiles(newVersion)) {
			console.error("Failed to update one or more version files.");
			return null;
		}

		console.log(
			`Version successfully updated from ${currentVersion} to ${newVersion}.`
		);
		return newVersion;
	}

	/**
	 * Commits version changes.
	 * @param {string} version - The version to commit
	 * @returns {Promise<boolean>} True if successful
	 */
	static async commitVersion(version) {
		const filesToStage = [
			CONFIG.files.package.path,
			CONFIG.files.manifest.path,
			CONFIG.files.versions.path,
		];

		if (!GitManager.stageFiles(filesToStage)) {
			console.error("Failed to stage JSON files.");
			return false;
		}

		const commitMessage = `bump version to ${version}`;
		if (!GitManager.commit(commitMessage)) {
			console.error("Failed to commit version bump.");
			return false;
		}

		console.log(`Version ${version} committed successfully.`);
		return true;
	}

	/**
	 * Creates a tag for the version.
	 * @param {string} version - The version to tag
	 * @returns {Promise<boolean>} True if successful
	 */
	static async createVersionTag(version) {
		if (!GitManager.createTag(version)) {
			console.error("Failed to create Git tag.");
			return false;
		}

		console.log(
			`Tag ${CONFIG.git.tagPrefix}${version} created successfully.`
		);
		return true;
	}

	/**
	 * Pushes the version tag to remote.
	 * @param {string} version - The version to push
	 * @returns {Promise<boolean>} True if successful
	 */
	static async pushVersionTag(version) {
		if (!GitManager.pushTag(version)) {
			console.error("Failed to push Git tag to origin.");
			return false;
		}

		console.log(
			`Tag ${CONFIG.git.tagPrefix}${version} pushed to origin successfully.`
		);
		return true;
	}
}

// =========== Main Command Handlers ===========

class CommandHandler {
	constructor() {
		this.userInteraction = new UserInteraction();
	}

	/**
	 * Cleanup and exit.
	 */
	finish() {
		this.userInteraction.close();
	}

	/**
	 * Gets the version update type from the user.
	 * @returns {Promise<string|null>} The update type or null
	 */
	async getUpdateType() {
		const currentVersion = VersionManager.getCurrentVersion();
		return await this.userInteraction.askUpdateType(currentVersion);
	}

	/**
	 * Command: update version only.
	 */
	async updateCommand() {
		try {
			const updateType = await this.getUpdateType();
			if (!updateType) return;

			await VersionCommands.updateVersion(updateType);
		} catch (error) {
			console.error("Error in update command:", error);
		} finally {
			this.finish();
		}
	}

	/**
	 * Command: update version and commit.
	 */
	async commitCommand() {
		try {
			const updateType = await this.getUpdateType();
			if (!updateType) return;

			const newVersion = await VersionCommands.updateVersion(updateType);
			if (!newVersion) return;

			await VersionCommands.commitVersion(newVersion);
		} catch (error) {
			console.error("Error in commit command:", error);
		} finally {
			this.finish();
		}
	}

	/**
	 * Command: update version, commit, and create tag.
	 */
	async tagCommand() {
		try {
			const updateType = await this.getUpdateType();
			if (!updateType) return;

			const newVersion = await VersionCommands.updateVersion(updateType);
			if (!newVersion) return;

			const isCommitted = await VersionCommands.commitVersion(newVersion);
			if (!isCommitted) return;

			await VersionCommands.createVersionTag(newVersion);
		} catch (error) {
			console.error("Error in tag command:", error);
		} finally {
			this.finish();
		}
	}

	/**
	 * Command: update version, commit, create tag, and push to origin.
	 */
	async pushCommand() {
		try {
			const updateType = await this.getUpdateType();
			if (!updateType) return;

			const newVersion = await VersionCommands.updateVersion(updateType);
			if (!newVersion) return;

			const isCommitted = await VersionCommands.commitVersion(newVersion);
			if (!isCommitted) return;

			const isTagged = await VersionCommands.createVersionTag(newVersion);
			if (!isTagged) return;

			await VersionCommands.pushVersionTag(newVersion);
		} catch (error) {
			console.error("Error in push command:", error);
		} finally {
			this.finish();
		}
	}

	/**
	 * Command: Ask for each step and execute all steps based on user input.
	 */
	async interactiveCommand() {
		try {
			const updateType = await this.getUpdateType();
			if (!updateType) return;

			const newVersion = await VersionCommands.updateVersion(updateType);
			if (!newVersion) return;

			// Ask for commit
			const shouldCommit = await this.userInteraction.askYesNo(
				"Do you want to commit the version changes?"
			);
			if (!shouldCommit) return;

			const isCommitted = await VersionCommands.commitVersion(newVersion);
			if (!isCommitted) return;

			// Ask for tag
			const shouldTag = await this.userInteraction.askYesNo(
				`Do you want to create a tag ${CONFIG.git.tagPrefix}${newVersion}?`
			);
			if (!shouldTag) return;

			const isTagged = await VersionCommands.createVersionTag(newVersion);
			if (!isTagged) return;

			// Ask for push
			const shouldPush = await this.userInteraction.askYesNo(
				"Do you want to push the tag to origin?"
			);
			if (!shouldPush) return;

			await VersionCommands.pushVersionTag(newVersion);

			console.log("All operations completed successfully.");
		} catch (error) {
			console.error("Error in interactive command:", error);
		} finally {
			this.finish();
		}
	}
}

// =========== Command Execution ===========

/**
 * Determines which command to run based on arguments.
 */
async function main() {
	const commandHandler = new CommandHandler();
	const command = process.argv[2] || "interactive";

	switch (command) {
		case "update":
			await commandHandler.updateCommand();
			break;
		case "commit":
			await commandHandler.commitCommand();
			break;
		case "tag":
			await commandHandler.tagCommand();
			break;
		case "push":
			await commandHandler.pushCommand();
			break;
		case "all":
			await commandHandler.updateCommand();
			await commandHandler.commitCommand();
			await commandHandler.tagCommand();
			await commandHandler.pushCommand();
			break;
		case "interactive":
		default:
			await commandHandler.interactiveCommand();
			break;
	}
}

// Execute the script
main();

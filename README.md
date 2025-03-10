# Obsidian Wheel Tab Switcher

A plugin for [Obsidian](https://obsidian.md) that allows you to switch between tabs using your mouse wheel when hovering over tab headers.

## Features

- Switch between tabs by scrolling your mouse wheel when the cursor is over a tab header
- Scroll up to move to the tab on the left
- Scroll down to move to the tab on the right
- Automatically wraps around from the last tab to the first and vice versa
- Works across all Obsidian windows, including popout windows
- Automatically restores minimized windows when switching tabs

## How to Use

1. Install the plugin
2. Hover your mouse over any tab header
3. Scroll up to switch to the tab on the left
4. Scroll down to switch to the tab on the right

No additional configuration is required!

## Installation

### From Obsidian Community Plugins

1. Open Obsidian Settings
2. Go to Community Plugins
3. Browse and search for "Wheel Tab Switcher"
4. Click Install, then Enable

### Manual Installation

1. Create a folder named `wheel-tab-switcher` in your vault's `.obsidian/plugins/` directory
2. Download the latest release from the GitHub repository
3. Extract `main.js` and `manifest.json` to the folder you created
4. Reload Obsidian
5. Go to Settings > Community Plugins and enable "Wheel Tab Switcher"

## Development

This plugin is built using TypeScript and the Obsidian API.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 16 or higher)
- npm or yarn

### Setup for Development

1. Clone this repository to your local machine
2. Run `npm install` (or `yarn`) to install dependencies
3. Run `npm run dev` to start compilation in watch mode
4. Create a symbolic link from the repository to your vault's plugins folder for testing

### Building

- `npm run build` - Builds the plugin
- `npm run dev` - Builds the plugin and watches for changes

## Support

If you encounter any issues or have feature requests, please file them on the GitHub issues page.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

22-2

## Acknowledgements

- The Obsidian team for their amazing app and plugin API
- The Obsidian community for their support and feedback

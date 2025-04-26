# Xtense Web Extension

A browser extension for OGame that collects game data and sends it to OGSpy servers.

## New Directory Structure

The extension has been restructured to follow modern JavaScript practices with a modular approach:

```
extension/
├── assets/                  # Static assets
│   ├── images/              # Images and icons
│   └── styles/              # CSS stylesheets
├── src/                     # Source code
│   ├── background/          # Background scripts
│   ├── content/             # Content scripts
│   │   ├── parsers/         # Game data parsers
│   │   ├── ui/              # UI components
│   │   └── index.js         # Main content script entry point
│   ├── services/            # Service modules
│   │   ├── ogspy/           # OGSpy communication
│   │   └── storage/         # Storage handling
│   └── utils/               # Utility functions
│       ├── logger.js        # Logging functionality
│       ├── locales.js       # Internationalization
│       └── status.js        # Status management
├── _locales/                # Localization files
├── contribs/                # Third-party libraries
└── manifest.json            # Extension manifest
```

## Key Improvements

1. **Modular Architecture**: Code is now organized into logical modules with clear responsibilities.
2. **ES Modules**: Using modern JavaScript module system for better code organization.
3. **Separation of Concerns**:
   - UI components are separated from business logic
   - Data parsing is separated from data sending
   - Storage operations are centralized
4. **Improved Maintainability**: Each module has a single responsibility, making it easier to maintain and extend.

## Development Workflow

1. Make changes to the source files in the `src` directory
2. Test the extension in your browser
3. Use the build system to create production-ready files

## Building the Extension

To build the extension for production:

```bash
npm run build
```

This will create optimized files in the `dist` directory.

## Browser Compatibility

The extension is compatible with:
- Google Chrome
- Mozilla Firefox
- Opera

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the terms of the GNU General Public License v3.0.

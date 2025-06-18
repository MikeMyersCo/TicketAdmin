# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Development Commands
- Start local server: `python -m http.server` or `npx serve`
- View site locally: Open browser to http://localhost:8000 (or port shown in terminal)
- Deploy: Push to main branch for automatic Netlify deployment
- Debug: Open browser console (F12) to check for JS errors and API responses
- Lint HTML: `npx html-validate index.html`
- Validate JS: `npx eslint app.js`
- Test login: Use identity widget via browser console - `netlifyIdentity.open('login')`

## Code Style Guidelines
- **Formatting**: Use consistent 4-space indentation
- **Naming**: camelCase for variables/functions, descriptive names
- **JS Organization**: Group related functions, maintain clean separation of concerns
- **Error Handling**: Use try/catch blocks with fallback to sample data
- **UI Components**: Follow Card/Container patterns with consistent styling
- **CSS**: Use color scheme variables (--primary-color, --accent-color, etc.)
- **Imports**: Load scripts in proper order (env vars → libs → app.js)
- **Auth Flow**: Maintain proper Netlify Identity authentication checks

## Data Handling
- Process data safely with null checks (use ?. operator for optional chaining)
- Format currency with Intl.NumberFormat(USD) and parseCurrency helper
- Format percentages with toFixed(1) for 1 decimal place
- Show loading states during async operations with .loading-spinner class
- Handle local development mode with appropriate fallbacks
- Follow Google Sheets API best practices and credential security
- Check for mobile devices and apply responsive styling
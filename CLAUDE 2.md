# CLAUDE.md - Guidelines for Working with TicketAdmin

## Build/Development Commands
- Start local server: `python -m http.server` or `npx serve`
- View site locally: Open browser to http://localhost:8000 (or port shown in terminal)
- Debug: Open browser console (F12) to check for JS errors and API responses
- Validate HTML: Use browser dev tools or https://validator.w3.org/

## Code Style Guidelines
- **Formatting**: Use consistent 4-space indentation
- **Naming**: camelCase for variables/functions, descriptive names
- **JS Organization**: Group related functions, maintain clean separation of concerns
- **Error Handling**: Use try/catch blocks, display user-friendly error messages
- **UI Components**: Follow existing card/container patterns
- **CSS**: Use the established color scheme variables (--primary-color, etc.)
- **Chart Configuration**: Maintain consistent styling across visualizations

## Best Practices
- Check for NULL/undefined values when processing data
- Format currency with Intl.NumberFormat (USD)
- Format percentages with 1 decimal place
- Update loaders/spinners during async operations
- Keep UI responsive across desktop and mobile layouts
- Comment complex logic or calculations
- Follow Google Sheets API best practices
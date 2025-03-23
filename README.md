# FordAmp Profit Dashboard

A powerful analytics dashboard for Ford Amphitheater ticket sales and profit analysis. This dashboard application connects to the same Google Sheets data source as the main ticket sales application but focuses on visualizing profit metrics and performance data.

## Password Protection

This site is password protected when deployed to Netlify. Authentication credentials are stored as a Netlify environment variable (`NETLIFY_AUTH_USERS`) rather than in the repository for security.

Format for the environment variable value: `username:password`

Example: `admin:warrior12345!`

## Features

- Interactive charts and visualizations for:
  - Monthly revenue trends
  - Profit margins by concert
  - Sales distribution by type
  - Top performing concerts
  - Ticket price distribution
  - Profit timeline
- Key performance indicators (KPIs) with trend indicators
- Filtering by date range, year, concert, and sale type
- Responsive design for desktop and mobile devices
- Automatic data refresh

## Setup Instructions

### Prerequisites

- Google API Key with access to Google Sheets API
- Google Spreadsheet ID (same as the one used in the ticket sales app)
- Web hosting service (such as Netlify)

### Local Development

1. Clone this repository to your local machine:
   ```
   git clone <repository-url>
   cd fordamp-profit-dashboard
   ```

2. Create a `local-env.js` file in the root directory with your API credentials:
   ```javascript
   window.ENV = {
       GOOGLE_API_KEY: 'your-google-api-key',
       SPREADSHEET_ID: 'your-spreadsheet-id'
   };
   ```

3. Start a local development server:
   - Using Python:
     ```
     python -m http.server
     ```
   - Using Node.js:
     ```
     npx serve
     ```
   - Using VS Code Live Server extension:
     Click "Go Live" in the status bar

4. Open your browser and navigate to http://localhost:8000 (or the port shown in your terminal)

### Deployment to Netlify

1. Create a `process-env.js` file with placeholder variables (these will be replaced by Netlify during build):
   ```javascript
   window.ENV = {
       GOOGLE_API_KEY: '{{ GOOGLE_API_KEY }}',
       SPREADSHEET_ID: '{{ SPREADSHEET_ID }}'
   };
   ```

2. Set up password protection files:
   - Create a `_redirects` file with: `/* /index.html 200! Role=subscriber`
   - Create a `netlify.toml` file with auth configuration
   - Create a placeholder `users.txt` file (credentials will be generated from an environment variable)

3. Push your code to a GitHub repository:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

4. Sign up for a Netlify account at https://netlify.com

5. Connect your GitHub repository to Netlify:
   - Click "New site from Git"
   - Select GitHub and authorize Netlify
   - Choose your repository
   - Configure build settings (if needed)
   - Add environment variables:
     - Key: `GOOGLE_API_KEY`, Value: Your Google API key
     - Key: `SPREADSHEET_ID`, Value: Your Google Spreadsheet ID
     - Key: `NETLIFY_AUTH_USERS`, Value: `admin:warrior12345!` (or your preferred credentials)

6. Deploy your site:
   - Click "Deploy site"
   - Netlify will build and deploy your application
   - The site will be password protected using the credentials in users.txt

7. Configure domain settings (optional):
   - Go to "Domain settings" in your Netlify dashboard
   - Add a custom domain or use the provided Netlify subdomain

## Google Sheets API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API for your project
4. Create an API key with appropriate restrictions:
   - Application restrictions: HTTP referrers (websites)
   - Website restrictions: Add your development and production domains
5. Copy the API key to your `local-env.js` and Netlify environment variables

## Spreadsheet Structure

The dashboard uses the same spreadsheet as the ticket sales application with the following columns:
- Concert (Column A)
- Date (Column B)
- Seat (Column C)
- List Price (Column D)
- Sale Type (Column E)
- Sale Price (Column F)
- Date Sold (Column G)
- Date Paid (Column H)
- Buyer (Column I)
- Cost (Column J)
- % Profit (Column K)
- Profit (Column L)

## Development Commands

- Start local server: `python -m http.server` or `npx serve`
- View site: Open browser to http://localhost:8000 (or port shown in terminal)
- Debug: Open browser console (F12) to check for JS errors and API responses
- Validate HTML: Use browser dev tools or https://validator.w3.org/
- Test API: Verify Google Sheets connection in console network tab
- Deploy: Upload all files to web hosting service or push to GitHub for Netlify deployment

## Customization

- Color scheme: Edit CSS variables in the `<style>` section of index.html
- Chart options: Modify chart configurations in app.js
- Filter options: Add or remove filters in the filters section of index.html
- Dashboard layout: Adjust the grid layout in the dashboard-container section

## Troubleshooting

- **API Key Issues**: Ensure your API key has the correct permissions and domain restrictions
- **CORS Errors**: Check that your domain is allowed in the Google Cloud Console
- **No Data Showing**: Verify the spreadsheet ID and range in app.js
- **Chart Rendering Issues**: Check browser console for JavaScript errors
- **Mobile Display Problems**: Test responsiveness using browser developer tools

## License

This project is licensed under the MIT License - see the LICENSE file for details.

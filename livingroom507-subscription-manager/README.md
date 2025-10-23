# Livingroom507 Subscription Manager

## Overview
The Livingroom507 Subscription Manager is designed to facilitate user subscription management and analytics. This project integrates with a backend API and a database to provide users with insights into their subscription status, compounding rewards, and affiliate earnings.

## Project Structure
The project is organized into several key directories and files:

- **public/**: Contains the HTML, CSS, and JavaScript files for the client-side application.
  - **index.html**: The main HTML file for the Livingroom507 application.
  - **subscription-manager.html**: Connects users to their current subscription data, compounding rewards, and affiliate earnings.
  - **style.css**: Styles for the HTML pages.
  - **script.js**: Client-side functionality.

- **functions/**: Contains serverless functions for handling API requests.
  - **api/**: 
    - **subscriptions.js**: Fetches subscription data from the database.
    - **compound.js**: Calculates total compounded rewards for active subscribers.
    - **users.js**: Handles user data operations.

- **db/**: Contains SQL files for database schema and seed data.
  - **schema.sql**: Defines the database schema.
  - **seed.sql**: Contains initial user and subscription records.

- **wrangler.toml**: Configuration for the Cloudflare Workers environment.

## Features
- **Subscription Management**: Users can view and manage their subscriptions.
- **Compounding Rewards**: The system calculates and displays total compounded rewards for users.
- **Affiliate Earnings**: Users can track their affiliate earnings through the platform.

## Getting Started
1. Clone the repository.
2. Install dependencies using `npm install`.
3. Set up the database using the provided SQL files.
4. Start the server and access the application through your browser.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.
// Entry point for the Livingroom507 Subscription Manager application

import express from 'express';
import { json } from 'body-parser';
import subscriptionRoutes from './routes/subscriptionRoutes';
import webhookRoutes from './routes/webhookRoutes';
import { connectToDatabase } from './utils/database'; // Assuming a utility for database connection

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(json());
app.use(express.static('public')); // Serve static files from the public directory

// Connect to the database
connectToDatabase();

// Routes
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/webhooks', webhookRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Livingroom507 Subscription Manager is running on http://localhost:${PORT}`);
});
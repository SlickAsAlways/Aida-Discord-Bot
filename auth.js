const express = require('express');
const app = express();
const port = 3000; // or another port you're using for OAuth callback

app.get('/oauth2callback', (req, res) => {
    // Handle the callback and get the authorization code
    // After getting the code, exchange it for an access token
    res.send('Authentication successful! You can close this page now.');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

const express = require('express');
const db = require('./config/db');
//import the auth routes
const authRoutes = require('./routes/auth.routes');
const clubsRoutes = require('./routes/clubs.routes');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubsRoutes);Get-Content ..\.gitignore
console.log('Auth routes loaded successfully');
app.get('/', (req, res) => {
    res.send('Campus Tech Event Hub API is running!');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
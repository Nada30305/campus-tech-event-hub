
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');

// Middleware pour vérifier les requêtes Auth
router.use((req, res, next) => {
    console.log('AUTH REQUEST:', req.method, req.url);
    next();
});

// ================= REGISTER =================
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Vérifier que tous les champs sont fournis
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        // Vérifier si l'email existe déjà
        const [existingUser] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: 'Email already exists'
            });
        }

        // Crypter le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insérer le nouvel utilisateur
        await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'student']
        );

        // Envoyer une réponse de succès
        return res.status(201).json({
            message: 'User registered successfully'
        });

    } catch (error) {
        console.error('Register error:', error.message);
        return res.status(500).json({
            message: 'Server error'
        });
    }
});

// ================= LOGIN =================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier les champs
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        // Rechercher l'utilisateur par email
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        // Vérifier si l'utilisateur existe
        if (users.length === 0) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Comparer le mot de passe avec le hash stocké
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Envoyer une réponse de succès
        const accessToken = jwt.sign(
            { id: user.id,
            role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        return res.status(200).json({
            message: 'Login successful',
            accessToken: accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            message: 'Server error'
        });
    }
});
// ================= get user route =================
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const [users]=await db.query(
            'select id, name, role, email, created_at from users where id = ?',
            [req.user.id]
        );

        if (users.length===0){
            return res.status(404).json({
                message: 'User not found'
            });
        }
        return res.status(200).json({
            message: 'profile fetched successfully',
            user: users[0]
        });

    } catch (error) {
        console.error('Get user error:', error);
        return res.status(500).json({
            message: 'Server error'
        });
    }
});
// ================= UPDATE USER PROFILE =================
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: 'Name and email are required'
            });
        }

        await db.query(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [name, email, req.user.id]
        );

        return res.status(200).json({
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Update profile error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'Email already exists'
            });
        }

        return res.status(500).json({
            message: 'Server error'
        });
    }
});

// Exporter le router

module.exports = router;



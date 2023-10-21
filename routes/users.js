const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

const router = express.Router();

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

router.get('/', async (req, res) => {
    const users = await User.find();
    res.render('index', { users });
});

router.post('/', [
    check('name').not().isEmpty().withMessage('El nombre es obligatorio'),
    check('email').isEmail().withMessage('El correo electrónico no es válido'),
    check('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Si hay errores de validación, renderiza la vista nuevamente con los mensajes de error.
        const users = await User.find();
        return res.render('index', { users, errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();
    res.redirect('/users/list-users');
});

// router.post('/', async (req, res) => {
//     const newUser = new User(req.body);
//     await newUser.save();
//     res.redirect('/users');
// });

router.get('/edit/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    res.render('partials/edit', { user });
});

router.post('/update/:id', async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/users/list-users');
});

router.get('/delete/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/users/list-users');
});

router.get('/list-users', async (req, res) => {
    const users = await User.find();
    res.render('list-users', { users });
});

module.exports = router;

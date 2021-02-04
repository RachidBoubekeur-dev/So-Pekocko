const cryptoJS = require('crypto-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.signup = (req, res, next) => {
    let hashEmail = cryptoJS.HmacSHA512(req.body.email, 'RANDOM_SECRET_EMAIL').toString();
    bcrypt.hash(req.body.password, 10)
        .then(hashPassword => {
            const user = new User({
                email: hashEmail,
                password: hashPassword
            });
            user.save()
                .then(() => res.status(201).json({ massage: 'Utilisateur Créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
}

exports.login = (req, res, next) => {
    let hashEmail = cryptoJS.HmacSHA512(req.body.email, 'RANDOM_SECRET_EMAIL').toString();
    User.findOne({ email: hashEmail })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET_SO_PEKOCKO_P6_OPEN_CLASSROOMS',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => req.status(500).json({ error }));
        })
        .catch(error => req.status(500).json({ error }));
}
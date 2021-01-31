const Sauce = require('../models/sauce');
const fs = require('fs');

exports.like = (req, res, next) => {
    if (req.body.like === 1) {
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                sauce.usersLiked.push(req.body.userId);
                Sauce.updateOne({ _id: req.params.id }, {
                    usersLiked: sauce.usersLiked,
                    likes: sauce.usersLiked.length,
                    _id: req.params.id
                })
                    .then(() => res.status(200).json({ ...req.body }))
                    .catch(error => res.status(400).json({ error }));
            });
    } else if (req.body.like === 0) {
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                for (let i = 0; i < sauce.usersDisliked.length; i++) {
                    if (req.body.userId === sauce.usersDisliked[i]) {
                        sauce.usersDisliked.splice(i, 1);
                    }
                }

                for (let i = 0; i < sauce.usersLiked.length; i++) {
                    if (req.body.userId === sauce.usersLiked[i]) {
                        sauce.usersLiked.splice(i, 1);
                    }
                }

                Sauce.updateOne({ _id: req.params.id }, {
                    usersLiked: sauce.usersLiked,
                    usersDisliked: sauce.usersDisliked,
                    likes: sauce.usersLiked.length,
                    dislikes: sauce.usersDisliked.length,
                    _id: req.params.id
                })
                    .then(() => res.status(200).json({ ...req.body }))
                    .catch(error => res.status(400).json({ error }));
            });
    } else if (req.body.like === -1) {
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                sauce.usersDisliked.push(req.body.userId);
                Sauce.updateOne({ _id: req.params.id }, {
                    usersDisliked: sauce.usersDisliked,
                    dislikes: sauce.usersDisliked.length,
                    _id: req.params.id
                })
                    .then(() => res.status(200).json({ ...req.body }))
                    .catch(error => res.status(400).json({ error }));
            });
    }
};

exports.createSauce = (req, res, next) => {
    const sauceObjet = JSON.parse(req.body.sauce);
    delete sauceObjet._id;
    const sauce = new Sauce({
        ...sauceObjet,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLikes: [],
        usersDislikes: []
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

exports.updateSauce = (req, res, next) => {
    const sauceObjet = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };

    if (typeof (req.file) !== 'undefined') {
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => { });
            });
    }

    Sauce.updateOne({ _id: req.params.id }, { ...sauceObjet, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet Supprimé !' }))
            });
        })
        .catch(error => res.status(500).json({ error }));
};

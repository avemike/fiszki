const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const config = require('config');
const jwt = require('jsonwebtoken');

const { mCategory, validateCategory } = require('../models/mCategory');
const { mFlashcardCategory } = require('../models/mFlashcardCategory');

// return all categories
router.get('/', async (req, res) => {
    jwt.verify(req.headers['x-auth-token'], config.get('jwtPrivateKey'), async function(err, decoded) {
        const categories = await mCategory.find({userId: mongoose.Types.ObjectId(decoded._id)}).sort('firstText');
    
        if (!categories) return res.status(404).send('categories were not found.');    
        else res.send(categories);
    })    
    
});

// return category with given id
router.get('/:id', async (req, res) => {
    jwt.verify(req.headers['x-auth-token'], config.get('jwtPrivateKey'), async function(err, decoded) {
        const category = await mCategory.findOne({_id: mongoose.Types.ObjectId(req.params.id), userId: mongoose.Types.ObjectId(decoded._id)}).sort('name');
        
        if (!category) return res.status(404).send('The category with the given ID was not found.');
        else res.send(category);
    })
});

// creates category
router.post('/', async (req, res) => {
    const { error } = validateCategory(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    jwt.verify(req.headers['x-auth-token'], config.get('jwtPrivateKey'), async function(err, decoded) {
        
        let category = new mCategory({
            name: req.body.name,
            userId: mongoose.Types.ObjectId(decoded._id)
        });
    
        category = await category.save();
        
        res.send(category);
    });
});
 
// change category (by given id) properties
router.put('/:id', async (req, res) => {
    const { error } = validateCategory(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    jwt.verify(req.headers['x-auth-token'], config.get('jwtPrivateKey'), async function(err, decoded) {
        const category = await mCategory.findOneAndUpdate({
                _id: mongoose.Types.ObjectId(req.params.id),
                userId: mongoose.Types.ObjectId(decoded._id)
            }, {
                name: req.body.name,
                userId: mongoose.Types.ObjectId(decoded._id)
            }, {
                new: true
            });
    
        if (!category) return res.status(404).send('The category with given ID was not found.');
    
        res.send(category);
    })
});

// delete category by given id
router.delete('/:id', async (req, res) => {
    jwt.verify(req.headers['x-auth-token'], config.get('jwtPrivateKey'), async function(err, decoded) {
        let category = await mCategory.findOneAndDelete(
            {
                _id: mongoose.Types.ObjectId(req.params.id),
                userId: mongoose.Types.ObjectId(decoded._id)
            }
        );
        
        
        if (!category) return res.status(404).send('The category with the given ID was not found.');    
        else while(await mCategoryCategory.findOneAndDelete(
            {
                categoryId: mongoose.Types.ObjectId(req.params.id)
            }
        ));
        res.send(category);
    })
});

// 
// RELATION (flashcard - category) 
// 

router.get('/:id/flashcards', async (req, res) => {
    jwt.verify(req.headers['x-auth-token'], config.get('jwtPrivateKey'), async function(err, decoded) {
        mFlashcardCategory.find(
            {
                categoryId: mongoose.Types.ObjectId(req.params.id),
                userId: mongoose.Types.ObjectId(decoded._id)
            }
        )
        .populate('flashcardId')
        .exec()
        .then( docs => {
            const flashcards = docs.map(doc => {
                return doc.flashcardId;
            })
            res.send(flashcards);
        })
    })
});

module.exports = router;
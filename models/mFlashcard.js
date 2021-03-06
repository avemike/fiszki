const Joi = require('joi');
const mongoose = require('mongoose');

const mFlashcard = mongoose.model('Flashcard', new mongoose.Schema({
    firstText: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 255
    },
    secondText: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 255
    },
    correctAnswers: {
        type: Number,
        default: 0
    },
    badAnswers: {
        type: Number,
        default: 0
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}));

function validate(flashcard) {
    const schema = {
        firstText: Joi.string().min(1).max(255).required(),
        secondText: Joi.string().min(1).max(255).required(),
        correctAnswers: Joi.number(),
        badAnswers: Joi.number()
    };

    return Joi.validate(flashcard, schema);
}

exports.mFlashcard= mFlashcard;
exports.validateFlashcard = validate;
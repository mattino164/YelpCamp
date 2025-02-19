const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');
const review = require('./models/review');

const extension = (joi) => ({
    type: 'string', // Defines this as an extension for string validation
    base: joi.string(), // Sets the base type to a Joi string

    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML tags!' 
        // Custom error message when validation fails
    },

    rules: {
        escapeHTML: { // Defines a custom validation rule called "escapeHTML"
            validate(value, helpers) {
                // Sanitizes the input by removing all HTML tags and attributes
                const clean = sanitizeHtml(value, { 
                    allowedTags: [], 
                    allowedAttributes: {} 
                });

                // If the sanitized value differs from the original, trigger an error
                if (clean !== value) {
                    return helpers.error('string.escapeHTML', { value });
                }

                return clean; // Return the sanitized value
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        description: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML()
    })
    .required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})
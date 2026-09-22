const mongoose = require('mongoose');

const newsletterSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        source: {
            type: String,
            default: 'footer',
        },
        status: {
            type: String,
            enum: ['active', 'unsubscribed'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

module.exports = Newsletter;

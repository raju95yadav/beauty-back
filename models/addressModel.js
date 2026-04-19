const mongoose = require('mongoose');

const addressSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, required: true, default: 'India' },
        isDefault: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;

const Address = require('../models/addressModel');

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
const getAddresses = async (req, res) => {
    const addresses = await Address.find({ user: req.user._id });
    res.json(addresses);
};

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = async (req, res) => {
    const { name, phone, street, city, state, zip, country, isDefault } = req.body;

    if (isDefault) {
        await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
        user: req.user._id,
        name,
        phone,
        street,
        city,
        state,
        zip,
        country,
        isDefault,
    });

    res.status(201).json(address);
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteAddress = async (req, res) => {
    const address = await Address.findById(req.params.id);

    if (address && address.user.toString() === req.user._id.toString()) {
        await Address.findByIdAndDelete(req.params.id);
        res.json({ message: 'Address removed' });
    } else {
        res.status(404);
        throw new Error('Address not found');
    }
};

module.exports = { getAddresses, addAddress, deleteAddress };

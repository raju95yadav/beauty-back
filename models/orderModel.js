const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        orderItems: [
            {
                name: { type: String, required: true },
                qty: { type: Number, required: true },
                image: { type: String, required: true },
                price: { type: Number, required: true },
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'Product',
                },
            },
        ],
        shippingAddress: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zip: { type: String, required: true },
            country: { type: String, required: true },
        },
        paymentMethod: {
            type: String,
            required: true,
        },
        paymentResult: {
            id: { type: String },
            status: { type: String },
            update_time: { type: String },
            email_address: { type: String },
        },
        itemsPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        taxPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },
        deliveredAt: {
            type: Date,
        },
        orderStatus: {
            type: String,
            required: true,
            enum: ['Order Placed', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
            default: 'Order Placed',
        },
        trackingData: {
            placedAt: { type: Date },
            processingAt: { type: Date },
            packedAt: { type: Date },
            shippedAt: { type: Date },
            outForDeliveryAt: { type: Date },
            deliveredAt: { type: Date },
            cancelledAt: { type: Date },
            estimatedDelivery: { type: Date },
            trackingNumber: { type: String },
            dispatchCity: { type: String, default: 'Mumbai Central Warehouse' },
            destinationCity: { type: String },
            courierPartner: { type: String, default: 'BlueDart Express' },
            statusLogs: [
                {
                    status: { type: String, required: true },
                    title: { type: String, required: true },
                    description: { type: String },
                    location: { type: String },
                    timestamp: { type: Date, default: Date.now }
                }
            ]
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

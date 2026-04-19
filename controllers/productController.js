const Product = require('../models/productModel');
const { cloudinary } = require('../utils/cloudinary');
const { createAdminNotification } = require('./notificationController');

// Helper to upload buffer to Cloudinary with fallback
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'product-site' },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        stream.end(buffer);
    });
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const pageSize = Number(req.query.limit) || 12;
        const page = Number(req.query.pageNumber) || 1;

        const keyword = req.query.keyword
            ? {
                  name: {
                      $regex: req.query.keyword,
                      $options: 'i',
                  },
              }
            : {};

        let categoryQuery = {};
        if (req.query.category) {
            const categories = Array.isArray(req.query.category) 
                ? req.query.category 
                : req.query.category.split(',').filter(Boolean);
            
            if (categories.length > 0) {
                // Use a safer way to match categories that might contain special characters
                categoryQuery = { category: { $in: categories.map(c => new RegExp(`^${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')) } };
            }
        }

        const brand = req.query.brand ? { brand: { $regex: req.query.brand, $options: 'i' } } : {};
        
        let priceFilter = {};
        if (req.query.minPrice || req.query.maxPrice) {
            priceFilter.price = {};
            if (req.query.minPrice) priceFilter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) priceFilter.price.$lte = Number(req.query.maxPrice);
        }

        const sort = req.query.sort || 'newest';
        let sortBy = { createdAt: -1 };
        if (sort === 'price_asc') sortBy = { price: 1 };
        else if (sort === 'price_desc') sortBy = { price: -1 };
        else if (sort === 'rating') sortBy = { rating: -1 };

        const query = { ...keyword, ...categoryQuery, ...brand, ...priceFilter };

        const count = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort(sortBy)
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching products' });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching product' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await Product.findByIdAndDelete(req.params.id);

            await createAdminNotification({
                type: 'PRODUCT',
                message: `Product removed: ${product.name}`,
                link: '/manage-products',
                adminId: req.user._id
            });

            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error deleting product' });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const { name, price, description, brand, category, stock } = req.body;

        let images = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const result = await uploadToCloudinary(file.buffer);
                    images.push({
                        url: result.secure_url,
                        public_id: result.public_id,
                    });
                } catch (uploadError) {
                    console.error('Cloudinary upload failure, using fallback:', uploadError.message);
                    // Use a high-quality placeholder if Cloudinary fails
                    images.push({
                        url: `https://placehold.co/600x600?text=${encodeURIComponent(name || 'Product')}`,
                        public_id: 'fallback_id',
                    });
                }
            }
        }

        const product = new Product({
            name,
            price: Number(price) || 0,
            user: req.user._id,
            images: images.length > 0 ? images : [{
                url: `https://placehold.co/600x600?text=${encodeURIComponent(name || 'Product')}`,
                public_id: 'default_id'
            }],
            brand,
            category,
            stock: Number(stock) || 0,
            numReviews: 0,
            description,
        });

        const createdProduct = await product.save();

        await createAdminNotification({
            type: 'PRODUCT',
            message: `New product added: ${createdProduct.name}`,
            link: '/manage-products',
            adminId: req.user._id
        });

        res.status(201).json(createdProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: error.message || 'Error creating product' });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const { name, price, description, brand, category, stock } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            if (req.files && req.files.length > 0) {
                let uploadedImages = [];
                for (const file of req.files) {
                    try {
                        const result = await uploadToCloudinary(file.buffer);
                        uploadedImages.push({
                            url: result.secure_url,
                            public_id: result.public_id,
                        });
                    } catch (uploadError) {
                        console.error('Cloudinary update failure, using fallback:', uploadError.message);
                        uploadedImages.push({
                            url: `https://placehold.co/600x600?text=${encodeURIComponent(name || product.name)}`,
                            public_id: 'fallback_id',
                        });
                    }
                }
                product.images = uploadedImages;
            }
            
            product.name = name || product.name;
            product.price = price ? Number(price) : product.price;
            product.description = description || product.description;
            product.brand = brand || product.brand;
            product.category = category || product.category;
            product.stock = stock !== undefined ? Number(stock) : product.stock;

            const updatedProduct = await product.save();

            await createAdminNotification({
                type: 'PRODUCT',
                message: `Product updated: ${updatedProduct.name}`,
                link: '/manage-products',
                adminId: req.user._id
            });

            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: error.message || 'Error updating product' });
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Product already reviewed' });
            }

            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id,
            };

            product.reviews.push(review);

            product.numReviews = product.reviews.length;

            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            await product.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error adding review' });
    }
};

// @desc    Get products by category
// @route   GET /api/products/category/:categoryName
// @access  Public
const getProductsByCategory = async (req, res) => {
    try {
        const categoryParam = req.params.categoryName.toLowerCase();
        
        // Exact mapping from Frontend Slug to Database Category
        const categoryMap = {
            'makeup': 'Makeup',
            'skin': 'Skin Care',
            'skin-care': 'Skin Care',
            'hair': 'Hair Care',
            'hair-care': 'Hair Care',
            'appliances': 'Appliances',
            'personal-care': 'Personal Care',
            'bath-and-body': 'Personal Care',
            'natural': 'Natural',
            'mom-and-baby': 'Mom & Baby',
            'health-and-wellness': 'Health & Wellness',
            'men': 'Men',
            'fragrance': 'Fragrance',
            'luxe': 'Luxe'
        };

        // If mapped, use the perfect mapped name. Otherwise, intelligently fallback by replacing hyphens with spaces.
        const targetCategory = categoryMap[categoryParam] || categoryParam.replace(/-/g, ' ');

        // Find products safely matching the category name (case insensitive)
        const products = await Product.find({
            category: { $regex: new RegExp(`^${targetCategory}$`, 'i') }
        });

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    deleteProduct,
    createProduct,
    updateProduct,
    createProductReview,
    getProductsByCategory,
};

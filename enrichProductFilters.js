require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/productModel');

const skinTypesList = ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal', 'All Skin Types'];
const ingredientsList = [
    'Hyaluronic Acid',
    'Vitamin C',
    'Niacinamide',
    'Retinol',
    'Salicylic Acid',
    'Tea Tree',
    'Aloe Vera',
    'Rosehip Oil',
    'Shea Butter',
    'Centella Asiatica',
    'Argan Oil',
    'Jojoba Oil',
    'Peptides',
    'Squalane'
];

// Helper to deterministically pick 1-2 items based on product name
const pickItems = (name, list, count = 2) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) % 1000000;
    }
    const idx1 = hash % list.length;
    const idx2 = (hash + 3) % list.length;
    if (count === 1 || idx1 === idx2) return [list[idx1]];
    return [list[idx1], list[idx2]];
};

const enrichProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({});
        console.log(`Found ${products.length} products to enrich.`);

        let updatedCount = 0;
        for (const p of products) {
            let skins = p.skinType;
            let ingrs = p.ingredients;

            if (!skins || skins.length === 0) {
                skins = pickItems(p.name, skinTypesList, 2);
            }
            if (!ingrs || ingrs.length === 0) {
                ingrs = pickItems(p.name, ingredientsList, 2);
            }

            p.skinType = skins;
            p.ingredients = ingrs;
            await p.save();
            updatedCount++;
        }

        console.log(`Successfully enriched ${updatedCount} products with skinType & ingredients!`);
        process.exit(0);
    } catch (err) {
        console.error('Error enriching products:', err);
        process.exit(1);
    }
};

enrichProducts();

require('dotenv').config();
const mongoose = require("mongoose");
const Product = require("./models/productModel");
const User = require("./models/User");

const seedData = [
  // Natural
  {
    title: "Organic Aloe Vera Gel",
    brand: "Nature's Essence",
    price: 15.00,
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=400&q=80",
    category: "Natural"
  },
  {
    title: "100% Pure Tea Tree Oil",
    brand: "Earth Botanics",
    price: 22.50,
    stock: 75,
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80",
    category: "Natural"
  },
  // Mom & Baby
  {
    title: "Tear-Free Baby Shampoo",
    brand: "Gentle Touch",
    price: 12.00,
    stock: 120,
    imageUrl: "https://images.unsplash.com/photo-1518776853503-490b4d4b14d3?auto=format&fit=crop&w=400&q=80",
    category: "Mom & Baby" // Wait, I need to match EXACTLY "Mom & Baby"
  },
  {
    title: "Nourishing Baby Lotion",
    brand: "BabyCare",
    price: 14.50,
    stock: 85,
    imageUrl: "https://images.unsplash.com/photo-1596755462226-9f89e29a1b18?auto=format&fit=crop&w=400&q=80",
    category: "Mom & Baby"
  },
  // Health & Wellness
  {
    title: "Daily Multivitamin Gummies",
    brand: "VitaBoost",
    price: 25.00,
    stock: 200,
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5e128ccda?auto=format&fit=crop&w=400&q=80",
    category: "Health & Wellness"
  },
  {
    title: "Probiotic Digestive Supplements",
    brand: "GutHealth",
    price: 35.00,
    stock: 150,
    imageUrl: "https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=400&q=80",
    category: "Health & Wellness"
  },
  // Men
  {
    title: "Men's 3-in-1 Charcoal Body Wash",
    brand: "Lumberjack",
    price: 18.00,
    stock: 100,
    imageUrl: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=400&q=80",
    category: "Men"
  },
  {
    title: "Exfoliating Face Scrub for Men",
    brand: "Groomed",
    price: 24.00,
    stock: 60,
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80",
    category: "Men"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to the database");

    // Fetch an admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log("No admin user found. Cannot proceed.");
      process.exit(1);
    }

    const newProducts = seedData.map(product => {
      const p = new Product({
        user: adminUser._id,
        name: product.title,
        brand: product.brand,
        price: product.price,
        stock: product.stock,
        category: product.category, // e.g. "Mom & Baby", "Natural", "Health & Wellness", "Men"
        description: `This is a premium ${product.category} product carefully crafted to enhance your daily routine. Highly rated by customers, it provides magnificent value.`,
        images: [{ url: product.imageUrl, public_id: 'seed_placeholder' }]
      });
      return p;
    });

    await Product.insertMany(newProducts);
    console.log(`Successfully seeded ${newProducts.length} missing category products to the database!`);
    
    process.exit();
  } catch (error) {
    console.error("Error seeding the database:", error);
    process.exit(1);
  }
};

seedDB();

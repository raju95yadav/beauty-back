require('dotenv').config();
const mongoose = require("mongoose");
const Product = require("./models/productModel");
const User = require("./models/User");
const fs = require("fs");

const seedData = [
  {
    title: "Pure Rosehip Seed Oil",
    brand: "Bloom Botanics",
    price: 28.00,
    stock: 110,
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTptixki81OV-Jl1nIBXiTriJ4h_mfiXWtsBjrMIHtVRsobTRdHwEEBf7ggu87k",
    category: "Skin Care"
  },
  {
    title: "French Vanilla Whipped Body Butter",
    brand: "VelvetSkin",
    price: 19.50,
    stock: 85,
    imageUrl: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcR-JTCZJM3JZ0lZJupdNLywFWaaMQuW4cv-dj9eaV8GgsW-bdWTbkKjwq7dtdFX",
    category: "Bodycare"
  },
  {
    title: "Liquid Glow Highlighter",
    brand: "Aura Lux",
    price: 22.00,
    stock: 150,
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRj7rM_5jucqdoBtLovREGYlx4GCA-MnLV7WNfK3ANesn6uVqfsJdGWYpf076Zb",
    category: "Makeup"
  },
  {
    title: "Cooling Cucumber Eye Gel",
    brand: "ChillOut",
    price: 16.00,
    stock: 200,
    imageUrl: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSLepv9iymEsIjwFJdmACbBiriaPLvt1m-mEBDhlx1TmUT-6Q7kHqtoM-COQTTv",
    category: "Skin Care"
  },
  {
    title: "Vegan Leather Makeup Case",
    brand: "ChicTravel",
    price: 45.00,
    stock: 30,
    imageUrl: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSoKDVB0HW_ug8N6VGIqg8ttJMtX5_wK_EApbjfr-7b_E83_lj9kN-apvbhhXve",
    category: "Accessories"
  },
  {
    title: "Biotin Hair Growth Serum",
    brand: "RootRevive",
    price: 34.00,
    stock: 75,
    imageUrl: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcS38Z4cU-Fk5rH6CT6rTLmTiF78ivWruH4ZyrE3I_7MiUmPi7hPBrH057XKL7PV",
    category: "Hair Care"
  },
  {
    title: "Volcanic Stone Face Roller",
    brand: "EarthCore",
    price: 14.99,
    stock: 120,
    imageUrl: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQZJRDD9PMEtNKDBOziuYQLjLhTz8scqPQIBvI2Qk5lxRSlGo6n3RZvk8mGf8Rf",
    category: "Skin Care"
  },
  {
    title: "Sandalwood & Amber Cologne",
    brand: "FloralMist",
    price: 55.00,
    stock: 25,
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhteg7si-BzSsZQ087R2IgEOIZnbf-Cj-MhmFcV8c0NTLubI2iX5RNalTUzzLE",
    category: "Fragrance"
  },
  {
    title: "Hydrating Watermelon Lip Mask",
    brand: "SugarKiss",
    price: 12.00,
    stock: 180,
    imageUrl: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSNxyi_U33PkACM_9Lk8G-BIknFGK9Y9ZqE4ONnJXt_vrx9XPtyBqJwja19RgK3",
    category: "Skin Care"
  },
  {
    title: "Mineral Sunscreen SPF 50",
    brand: "SunKissed",
    price: 21.50,
    stock: 300,
    imageUrl: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRWEIutErNR06vUdKaCAD-syDL_TYebeD0--qpEwlNNkE5IqOJwOYux6rDzBQnq",
    category: "Skin Care"
  },
  {
    title: "Exfoliating Coffee Lip Scrub",
    brand: "WakeUp Skin",
    price: 9.00,
    stock: 220,
    imageUrl: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTU---TleC5xegArAnmtsth-caZL242YeTgP19eQydCbq0Mn9iTVEU6J62AaxHv",
    category: "Skin Care"
  },
  {
    title: "Dead Sea Mud Facial Mask",
    brand: "PureEarth",
    price: 24.00,
    stock: 65,
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9RX1E7zjVvCI_Ms7JB2oZFoh_uHrHnaE0u0KTIsk6DOXPEF4dHpoaFVgMxgVQ",
    category: "Skin Care"
  },
  {
    title: "Silk Infused Finishing Powder",
    brand: "Lumière",
    price: 29.00,
    stock: 90,
    imageUrl: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTpmgrzQWXMNq9ypG3tpEGUJQEP0aX3SvzHB-sMaEjOXdWjCpo3_3kIpE18Y_OW",
    category: "Makeup"
  },
  {
    title: "Marula & Neroli Hand Wash",
    brand: "SpaDay",
    price: 18.00,
    stock: 140,
    imageUrl: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQ17P9tXH_RJmh8N0O1YkEwOz9kxsEc2gjXLheFgvLFbEEEJLZrHB8YccNPkSNj",
    category: "Bodycare"
  },
  {
    title: "Waterproof Gel Eyeliner",
    brand: "LashLux",
    price: 15.00,
    stock: 250,
    imageUrl: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTKx6fTiwhrNEDhpQ2wFEFWyUtW7Ih9NHC2HOp68iTPVOCW5wfpa_13irB8iisg",
    category: "Makeup"
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
        category: product.category,
        description: `This is a premium ${product.category.toLowerCase()} product carefully crafted to enhance your daily beauty routine. Highly rated by customers, it provides magnificent value.`,
        images: [{ url: product.imageUrl, public_id: 'seed_placeholder' }]
      });
      return p;
    });

    await Product.insertMany(newProducts);
    console.log(`Successfully seeded ${newProducts.length} products to the database!`);
    
    process.exit();
  } catch (error) {
    console.error("Error seeding the database:", error);
    process.exit(1);
  }
};

seedDB();

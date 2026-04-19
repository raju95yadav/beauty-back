const mongoose = require("mongoose");
const Product = require("./models/Product"); // make sure this path is correct

// 🔴 IMPORTANT: replace with your DB name
mongoose.connect("mongodb://127.0.0.1:27017/nykaaclone")
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.log(err));

const products = [
  {
    title: "Pure Rosehip Seed Oil",
    brand: "Bloom Botanics",
    price: 28.00,
    stock: 110,
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTptixki81OV-Jl1nIBXiTriJ4h_mfiXWtsBjrMIHtVRsobTRdHwEEBf7ggu87k",
    category: "Skincare"
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
    category: "Skincare"
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
    category: "Haircare"
  },
  {
    title: "Volcanic Stone Face Roller",
    brand: "EarthCore",
    price: 14.99,
    stock: 120,
    imageUrl: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQZJRDD9PMEtNKDBOziuYQLjLhTz8scqPQIBvI2Qk5lxRSlGo6n3RZvk8mGf8Rf",
    category: "Skincare"
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
    category: "Skincare"
  },
  {
    title: "Mineral Sunscreen SPF 50",
    brand: "SunKissed",
    price: 21.50,
    stock: 300,
    imageUrl: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRWEIutErNR06vUdKaCAD-syDL_TYebeD0--qpEwlNNkE5IqOJwOYux6rDzBQnq",
    category: "Skincare"
  },

  // ---------- CONTINUE SAME STRUCTURE ----------

  {
    title: "Exfoliating Coffee Lip Scrub",
    brand: "WakeUp Skin",
    price: 9.00,
    stock: 220,
    imageUrl: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTU---TleC5xegArAnmtsth-caZL242YeTgP19eQydCbq0Mn9iTVEU6J62AaxHv",
    category: "Skincare"
  },
  {
    title: "Dead Sea Mud Facial Mask",
    brand: "PureEarth",
    price: 24.00,
    stock: 65,
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9RX1E7zjVvCI_Ms7JB2oZFoh_uHrHnaE0u0KTIsk6DOXPEF4dHpoaFVgMxgVQ",
    category: "Skincare"
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

  // 👉 I trimmed here to keep response readable
];

const importData = async () => {
  try {
    await Product.insertMany(products);
    console.log("🎉 Products Added Successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importData();
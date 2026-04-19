const Contact = require('../models/Contact');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Mock data for support and jobs
// Rich data for support and jobs
const supportContent = {
  'order-tracking': {
    title: 'Order Tracking',
    sections: [
      { id: 1, title: 'How to track?', content: 'Once your order is shipped, a unique Tracking ID is sent via SMS and Email. You can enter this ID on our Tracking Portal or use the live link provided in the confirmation email.' },
      { id: 2, title: 'Carrier Partners', content: 'We partner with premium logistics providers including BlueDart, Delhivery, and Ecom Express to ensure safe and timely delivery.' },
      { id: 3, title: 'Delivery Timeline', content: 'Metros: 2-3 business days. Rest of India: 4-6 business days. North East & Jammu: 7-9 business days.' }
    ]
  },
  'shipping-policy': {
    title: 'Shipping Policy',
    sections: [
      { id: 1, title: 'Free Shipping', content: 'Enjoy complimentary shipping on all orders above ₹500. For orders below this value, a nominal convenience fee of ₹49 applies.' },
      { id: 2, title: 'Packaging', content: 'All products are shipped in eco-friendly, tamper-proof luxury packaging to ensure they reach you in pristine condition.' },
      { id: 3, title: 'International Shipping', content: 'Currently, we only ship within India. We are working hard to bring Glam Beauty to international shores very soon!' }
    ]
  },
  'return-policy': {
    title: 'Return Policy',
    sections: [
      { id: 1, title: 'Hassle-Free Returns', content: 'You can return most items within 15 days of delivery. The product must be unused, in its original packaging, with all tags and seals intact.' },
      { id: 2, title: 'Refund Timeline', content: 'Once we receive the returned item and it passes quality check, your refund will be initiated within 48 hours to the original payment method.' },
      { id: 3, title: 'Non-Returnable Items', content: 'Personal care items, masks, and intimate wear are non-returnable for hygiene reasons unless received damaged.' }
    ]
  },
  'faqs': {
    title: 'Frequently Asked Questions',
    sections: [
      { id: 1, title: 'Are the products authentic?', content: 'Absolutely. We source 100% authentic products directly from authorized distributors or the brands themselves.' },
      { id: 2, title: 'How can I change my address?', content: 'You can update your address from your Account Details before an order is shipped. Once shipped, address changes are not possible.' },
      { id: 3, title: 'Do you offer Cash on Delivery?', content: 'Yes! COD is available for most pin codes in India for orders up to ₹10,000.' }
    ]
  }
};

const aboutContent = {
  company: {
    name: 'Glam Beauty',
    description: 'India\'s premier luxury beauty destination, bringing curated elegance to every doorstep.',
    story: 'Founded with a vision to revolutionize the digital beauty experience, Glam Beauty combines cutting-edge technology with high-end aesthetics. We believe that luxury should be accessible, and every purchase should be an experience.',
    vision: 'To become Asia\'s most trusted and loved beauty ecosystem.',
    mission: 'To empower individuals through self-expression and provide access to the world\'s finest beauty brands.'
  },
  developer: {
    name: 'Raju Yadav',
    role: 'Lead Architect & Full Stack Developer',
    description: 'A passionate technologist dedicated to building seamless, high-performance web experiences. Raju is the visionary behind the Glam Beauty platform architecture.',
    expertise: ['React.js', 'Node.js', 'Cloud Infrastructure', 'UI/UX Design']
  }
};

const jobListings = [
  { 
    id: 1, 
    title: 'Frontend Developer (React)', 
    department: 'Engineering', 
    location: 'Remote / Mumbai',
    description: 'Build stunning, performant user interfaces for our growing customer base.',
    requirements: ['3+ years React experience', 'Expertise in Tailwind CSS', 'Experience with Framer Motion'],
    perks: ['Equity options', 'Remote-first culture', 'Health insurance']
  },
  { 
    id: 2, 
    title: 'Product Designer (UX/UI)', 
    department: 'Design', 
    location: 'Bangalore / Hybrid',
    description: 'Shape the aesthetic and functional future of luxury e-commerce.',
    requirements: ['Strong portfolio in Figma', 'Understanding of luxury branding', 'Mobile-first mindset'],
    perks: ['Wellness allowance', 'Learning budget', 'Latest Apple hardware']
  },
  { 
    id: 3, 
    title: 'Logistics Operations Lead', 
    department: 'Operations', 
    location: 'Mumbai',
    description: 'Optimize our supply chain to ensure lightning-fast deliveries.',
    requirements: ['Experience in e-commerce logistics', 'Data-driven decision making'],
    perks: ['Performance bonuses', 'On-site meals', 'Commuter benefits']
  }
];

// @desc    Newsletter subscription
// @route   POST /api/newsletter
const subscribeNewsletter = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  
  // In a real app, save to DB
  console.log(`Newsletter subscription: ${email}`);
  res.status(200).json({ success: true, message: 'Successfully subscribed to newsletter!' });
};

// @desc    Get support content
// @route   GET /api/support/:type
const getSupportContent = async (req, res) => {
  const { type } = req.params;
  const content = supportContent[type];
  if (!content) return res.status(404).json({ message: 'Content not found' });
  res.status(200).json(content);
};

// @desc    Get job listings
// @route   GET /api/jobs
const getJobs = async (req, res) => {
  res.status(200).json(jobListings);
};

// @desc    Contact form submission
// @route   POST /api/contact
const submitContactForm = async (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  try {
    // 1. Save to Database
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    // 2. Setup Email Notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Sending to admin email
      subject: `New Contact Form Submission from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #db2777;">New Contact Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`Contact stored and email sent: ${name}`);
    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully! Redirecting to WhatsApp...' 
    });
  } catch (error) {
    console.error('Contact Form Error:', error);
    res.status(500).json({ message: 'Failed to process request, but please try WhatsApp.' });
  }
};

// @desc    Get Admin Contact for WhatsApp
// @route   GET /api/main/admin-contact
const getAdminContact = async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
    if (!admin) {
      return res.status(200).json({ 
        phone: "917857873455", // Fallback
        email: "support@nykaaclone.com" 
      });
    }
    res.status(200).json({ 
      phone: admin.phone || "917857873455",
      email: admin.email,
      name: admin.name,
      profilePic: admin.profilePic
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching admin info' });
  }
};

// @desc    Get About Content
// @route   GET /api/main/about
const getAboutContent = async (req, res) => {
  res.status(200).json(aboutContent);
};

module.exports = {
  subscribeNewsletter,
  getSupportContent,
  getAboutContent,
  getJobs,
  submitContactForm,
  getAdminContact
};

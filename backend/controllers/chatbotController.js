const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require('../models/Product');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatbotReply = async (req, res) => {
  const { message, userName } = req.body;
  if (!message) return res.status(400).json({ reply: "No message provided." });

  // List of greetings
  const greetings = ["hi", "hello", "hey", "good morning", "good evening", "good afternoon"];
  const lowerMsg = message.trim().toLowerCase();

  // If the message is a greeting
  if (greetings.includes(lowerMsg)) {
    // You can get the user's name from session/auth, or just use a default
    const name = userName || "there";
    return res.json({
      reply: `Hi ${name}, how can I assist you today? Here are some things I can help with:`,
      keywords: ["Party Wear", "Cotton Kurtis", "Designer", "Traditional", "Casual"]
    });
  }

  try {
    // 1. Try to find a product by title or category
    const regex = new RegExp(message, 'i');
    const product = await Product.findOne({ $or: [{ title: regex }, { category: regex }] });

    if (product) {
      // If a product is found, reply with info and redirect link
      return res.json({
        reply: `We found a product matching your query: ${product.title}. Redirecting you now...`,
        redirect: `/product.html?id=${product._id}`
      });
    }

    // 2. If no product found, reply with a polite refusal
    return res.json({
      reply: "Sorry, I can only help with questions about our products and services. Please ask about a product, category, or feature on this website."
    });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ reply: "Sorry, I couldn't process your request." });
  }
};

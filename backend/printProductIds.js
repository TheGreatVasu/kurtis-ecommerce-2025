const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config({ path: './config/config.env' });

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  const products = await Product.find({}, { _id: 1, title: 1 });
  console.log('Product IDs and Titles:');
  products.forEach(p => {
    console.log(`${p.title}: ${p._id}`);
  });
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
}); 
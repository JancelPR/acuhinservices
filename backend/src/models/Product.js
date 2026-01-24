import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  image: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    default: 'pc'
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  },
  barcode: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;
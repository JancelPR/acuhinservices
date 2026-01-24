import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  category: String,
  price: Number,
  quantity: Number,
  unit: String
});

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  total: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
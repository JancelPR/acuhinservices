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
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true // Allows nulls/missing for old records while enforcing uniqueness on new ones
  },
  action: {
    type: String,
    default: 'CREATE_TRANSACTION'
  },
  items: [cartItemSchema],
  total: {
    type: Number,
    required: true
  },
  payment: {
    type: Number,
    required: true,
    default: 0
  },
  change: {
    type: Number,
    required: true,
    default: 0
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
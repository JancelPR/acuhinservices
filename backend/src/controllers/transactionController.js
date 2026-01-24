import Transaction from '../models/Transaction.js';
import { mapMongoErrorToHttp } from '../config/db.js';

/**
 * Get all transactions
 * Fetches all transactions from the database, sorted with most recent first.
 * Returns transactions in a frontend-friendly format.
 */
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    const formattedTransactions = transactions.map(t => {
      const obj = t.toObject ? t.toObject() : t;
      const { _id, transactionId, __v, ...rest } = obj;
      return { ...rest, id: transactionId || _id.toString() };
    });
    res.json(formattedTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    const { status, message } = mapMongoErrorToHttp(error);
    res.status(status).json({ message });
  }
};

/**
 * Create a new transaction
 * Handles the creation of a sales transaction.
 * Validates the transaction payload (items, total, id).
 * Sanitizes item data before saving to the database.
 */
export const createTransaction = async (req, res) => {
  try {
    const { items, total, id } = req.body;
    
    if (!id) return res.status(400).json({ message: 'Transaction ID is required' });
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Transaction must have at least one item' });
    }
    if (total === undefined || total === null || isNaN(total)) {
      return res.status(400).json({ message: 'Total amount is required and must be a number' });
    }
    
    // Sanitize and validate items
    const sanitizedItems = items.map((item, index) => {
      if (!item.id || !item.name || item.price === undefined || item.quantity === undefined) {
        throw new Error(`Invalid item at index ${index}: missing required fields`);
      }
      return {
        id: String(item.id),
        name: String(item.name),
        category: String(item.category || ''),
        price: Number(item.price),
        quantity: Number(item.quantity),
        unit: String(item.unit || 'pc')
      };
    });
    
    const newTransaction = new Transaction({
      transactionId: String(id),
      items: sanitizedItems,
      total: Number(total),
      date: new Date(),
    });
    
    const savedTransaction = await newTransaction.save();
    
    const obj = savedTransaction.toObject ? savedTransaction.toObject() : savedTransaction;
    const { _id, transactionId, __v, ...rest } = obj;
    const formatted = { ...rest, id: transactionId || _id.toString() };
    res.status(201).json(formatted);
  } catch (error) {
    if (error.message.startsWith('Invalid item')) {
         return res.status(400).json({ message: error.message });
    }
    console.error('Error creating transaction:', error);
    const { status, message } = mapMongoErrorToHttp(error);
    res.status(status).json({ message, error: error.message });
  }
};

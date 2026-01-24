import Product from '../models/Product.js';
import { mapMongoErrorToHttp } from '../config/db.js';
import { toFrontendFormat, toFrontendFormatArray, sanitizeProductBody } from '../utils/formatters.js';

/**
 * Get all products
 * Fetches products from the database, sorted by creation date (newest first).
 * Returns the products in a format suitable for the frontend.
 */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(toFrontendFormatArray(products));
  } catch (error) {
    console.error('Error fetching products:', error);
    const { status, message } = mapMongoErrorToHttp(error);
    res.status(status).json({ message });
  }
};

/**
 * Create a new product
 * Validates and sanitizes the request body, then creates a new product in the database.
 * Returns the created product in frontend format.
 */
export const createProduct = async (req, res) => {
  try {
    const productData = sanitizeProductBody(req.body);
    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();
    res.status(201).json(toFrontendFormat(savedProduct));
  } catch (error) {
    console.error('Error creating product:', error);
    const { status, message } = mapMongoErrorToHttp(error);
    res.status(status).json({ message });
  }
};

/**
 * Update a product
 * Updates an existing product by ID with the provided data.
 * Validates the update data and ensures the product exists.
 */
export const updateProduct = async (req, res) => {
  try {
    const updateData = sanitizeProductBody(req.body);
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(toFrontendFormat(updatedProduct));
  } catch (error) {
    console.error('Error updating product:', error);
    const { status, message } = mapMongoErrorToHttp(error);
    res.status(status).json({ message });
  }
};

/**
 * Delete a product
 * Removes a product from the database by its ID.
 */
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    const { status, message } = mapMongoErrorToHttp(error);
    res.status(status).json({ message });
  }
};

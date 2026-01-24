import Category from '../models/Category.js';
import { mapMongoErrorToHttp } from '../config/db.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories.map(cat => cat.name));
  } catch (error) {
    console.error('Error fetching categories:', error);
    const { status, message } = mapMongoErrorToHttp(error);
    res.status(status).json({ message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const newCategory = new Category({ name });
    await newCategory.save();
    res.status(201).json(newCategory.name);
  } catch (error) {
    console.error('Error creating category:', error);
    const { status, message } = mapMongoErrorToHttp(error);
    res.status(status).json({ message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { name } = req.params;
    await Category.findOneAndDelete({ name });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    const { status, message } = mapMongoErrorToHttp(error);
    res.status(status).json({ message });
  }
};

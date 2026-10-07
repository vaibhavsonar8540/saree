const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

// @desc    Create / Add a new Category
// @route   POST /api/categories
// @access  Private / Admin
const createCategory = async (req, res) => {
  try {
    const { name, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: `Category '${name.trim()}' already exists`,
      });
    }

    const category = await Category.create({
      name: name.trim(),
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating category',
      error: error.message,
    });
  }
};

// @desc    Fetch / Get all Categories (with optional subcategories populated)
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const { isActive, includeSubcategories } = req.query;
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    let categories = await Category.find(filter).sort({ name: 1 }).lean();

    if (includeSubcategories === 'true') {
      const subCategories = await SubCategory.find({ isActive: true }).lean();
      categories = categories.map((cat) => {
        const subs = subCategories.filter(
          (sub) => sub.categoryId.toString() === cat._id.toString()
        );
        return { ...cat, subCategories: subs };
      });
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories',
      error: error.message,
    });
  }
};

// @desc    Fetch / Get Category by ID or Name/Slug
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    let category = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      category = await Category.findById(id).lean();
    }

    if (!category) {
      const decodedName = decodeURIComponent(id).replace(/-/g, ' ').trim();
      category = await Category.findOne({
        name: { $regex: new RegExp(`^${decodedName}$`, 'i') },
      }).lean();
    }

    if (!category) {
      const decodedName = decodeURIComponent(id).replace(/-/g, ' ').trim();
      category = await Category.findOne({
        name: { $regex: new RegExp(decodedName, 'i') },
      }).lean();
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const subCategories = await SubCategory.find({ categoryId: category._id }).sort({ name: 1 }).lean();

    res.status(200).json({
      success: true,
      data: {
        ...category,
        subCategories,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category details',
      error: error.message,
    });
  }
};

// @desc    Update / Edit Category by ID
// @route   PUT /api/categories/:id
// @access  Private / Admin
const updateCategory = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Category '${name.trim()}' already exists`,
        });
      }
      category.name = name.trim();
    }

    if (isActive !== undefined) {
      category.isActive = isActive;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating category',
      error: error.message,
    });
  }
};

// @desc    Delete Category and associated Subcategories
// @route   DELETE /api/categories/:id
// @access  Private / Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Delete associated subcategories
    const deletedSubs = await SubCategory.deleteMany({ categoryId: category._id });

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category and its subcategories deleted successfully',
      deletedCategoryId: req.params.id,
      deletedSubcategoriesCount: deletedSubs.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting category',
      error: error.message,
    });
  }
};

// @desc    Seed sample Categories
// @route   POST /api/categories/seed
// @access  Public / Admin
const seedCategories = async (req, res) => {
  try {
    const defaultCategories = ['Saree', 'Lehenga', 'Salwar Suit', 'Kurti', 'Gown', 'Dupatta'];

    const createdCategories = [];
    for (const name of defaultCategories) {
      const cat = await Category.findOneAndUpdate(
        { name },
        { name, isActive: true },
        { upsert: true, new: true }
      );
      createdCategories.push(cat);
    }

    res.status(201).json({
      success: true,
      message: 'Sample categories seeded successfully',
      count: createdCategories.length,
      data: createdCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while seeding categories',
      error: error.message,
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  seedCategories,
};

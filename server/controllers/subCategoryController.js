const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');

// @desc    Create / Add a new SubCategory (with categoryId)
// @route   POST /api/subcategories
// @access  Private / Admin
const createSubCategory = async (req, res) => {
  try {
    const { name, categoryId, isActive } = req.body;

    if (!name || !name.trim() || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory name and categoryId are required',
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Referenced category does not exist',
      });
    }

    // Check if duplicate subcategory exists under the same category
    const existingSub = await SubCategory.findOne({
      categoryId,
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existingSub) {
      return res.status(400).json({
        success: false,
        message: `Subcategory '${name.trim()}' already exists under '${categoryExists.name}'`,
      });
    }

    const subCategory = await SubCategory.create({
      name: name.trim(),
      categoryId,
      isActive: isActive !== undefined ? isActive : true,
    });

    const populatedSubCategory = await SubCategory.findById(subCategory._id).populate(
      'categoryId',
      'name'
    );

    res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      data: populatedSubCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating subcategory',
      error: error.message,
    });
  }
};

// @desc    Fetch / Get all SubCategories (optionally filter by categoryId)
// @route   GET /api/subcategories
// @access  Public
const getSubCategories = async (req, res) => {
  try {
    const { categoryId, category, isActive } = req.query;
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const targetCategory = categoryId || category;
    if (targetCategory) {
      filter.categoryId = targetCategory;
    }

    const subCategories = await SubCategory.find(filter)
      .sort({ name: 1 })
      .populate('categoryId', 'name');

    res.status(200).json({
      success: true,
      count: subCategories.length,
      data: subCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching subcategories',
      error: error.message,
    });
  }
};

// @desc    Fetch / Get SubCategory by ID
// @route   GET /api/subcategories/:id
// @access  Public
const getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id).populate('categoryId', 'name');

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    res.status(200).json({
      success: true,
      data: subCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching subcategory details',
      error: error.message,
    });
  }
};

// @desc    Update / Edit SubCategory by ID
// @route   PUT /api/subcategories/:id
// @access  Private / Admin
const updateSubCategory = async (req, res) => {
  try {
    const { name, categoryId, isActive } = req.body;
    let subCategory = await SubCategory.findById(req.params.id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    const targetCategory = categoryId || subCategory.categoryId;

    if (categoryId) {
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Referenced category does not exist',
        });
      }
      subCategory.categoryId = categoryId;
    }

    if (name && name.trim().toLowerCase() !== subCategory.name.toLowerCase()) {
      const duplicate = await SubCategory.findOne({
        categoryId: targetCategory,
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Subcategory '${name.trim()}' already exists under this category`,
        });
      }
      subCategory.name = name.trim();
    }

    if (isActive !== undefined) {
      subCategory.isActive = isActive;
    }

    await subCategory.save();

    const updatedSubCategory = await SubCategory.findById(subCategory._id).populate(
      'categoryId',
      'name'
    );

    res.status(200).json({
      success: true,
      message: 'Subcategory updated successfully',
      data: updatedSubCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating subcategory',
      error: error.message,
    });
  }
};

// @desc    Delete SubCategory by ID
// @route   DELETE /api/subcategories/:id
// @access  Private / Admin
const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    await SubCategory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Subcategory deleted successfully',
      deletedId: req.params.id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting subcategory',
      error: error.message,
    });
  }
};

// @desc    Seed sample SubCategories linked to Saree category
// @route   POST /api/subcategories/seed
// @access  Public / Admin
const seedSubCategories = async (req, res) => {
  try {
    // 1. Ensure Saree category exists
    let sareeCat = await Category.findOne({ name: 'Saree' });
    if (!sareeCat) {
      sareeCat = await Category.create({ name: 'Saree', isActive: true });
    }

    const sampleSubs = [
      'Banarasi Silk',
      'Kanjivaram Silk',
      'Chanderi Cotton',
      'Organza',
      'Georgette',
      'Silk Blend',
      'Bandhani',
      'Tussar Silk',
    ];

    const createdSubCats = [];
    for (const name of sampleSubs) {
      const sub = await SubCategory.findOneAndUpdate(
        { categoryId: sareeCat._id, name },
        { categoryId: sareeCat._id, name, isActive: true },
        { upsert: true, new: true }
      );
      createdSubCats.push(sub);
    }

    const result = await SubCategory.find({ categoryId: sareeCat._id }).populate(
      'categoryId',
      'name'
    );

    res.status(201).json({
      success: true,
      message: 'Sample subcategories seeded successfully',
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while seeding subcategories',
      error: error.message,
    });
  }
};

module.exports = {
  createSubCategory,
  getSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  seedSubCategories,
};

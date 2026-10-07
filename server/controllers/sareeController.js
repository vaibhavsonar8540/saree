const Saree = require('../models/Saree');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const { uploadToCloudinary } = require('../config/cloudinary');

/**
 * Upload single media item (Buffer, Base64, or URL) to Cloudinary
 * Returns secure Cloudinary URL.
 */
const uploadMediaToCloudinary = async (mediaSource, isVideo = false) => {
  if (!mediaSource) return '';

  // 1. Multer file object with buffer
  if (mediaSource.buffer) {
    const resourceType = mediaSource.mimetype?.startsWith('video/') || isVideo ? 'video' : 'auto';
    const res = await uploadToCloudinary(mediaSource.buffer, { resource_type: resourceType });
    return res.secure_url || '';
  }

  // 2. String input (Base64 data URI, external URL, or existing Cloudinary URL)
  if (typeof mediaSource === 'string') {
    const trimmed = mediaSource.trim();
    if (!trimmed) return '';

    // Already hosted on Cloudinary
    if (trimmed.includes('cloudinary.com')) {
      return trimmed;
    }

    try {
      const detectVideo = isVideo || trimmed.startsWith('data:video') || trimmed.endsWith('.mp4');
      const res = await uploadToCloudinary(trimmed, {
        resource_type: detectVideo ? 'video' : 'auto',
      });
      return res.secure_url || trimmed;
    } catch (err) {
      console.error('Cloudinary upload warning:', err.message);
      return trimmed;
    }
  }

  return '';
};

/**
 * Helper to normalize colors input into array of { name, hexCode }
 */
const parseColorsPayload = (colorsInput) => {
  if (!colorsInput) return [];

  let raw = colorsInput;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch (e) {
      // If single comma-separated color string
      if (raw.includes(',')) {
        return raw.split(',').map((c) => ({ name: c.trim(), hexCode: '#1B5E3B' }));
      }
      return [{ name: raw.trim(), hexCode: '#1B5E3B' }];
    }
  }

  if (Array.isArray(raw)) {
    return raw.map((item) => {
      if (typeof item === 'string') {
        return { name: item, hexCode: '#1B5E3B' };
      }
      if (typeof item === 'object' && item !== null) {
        return {
          name: item.name || item.colorName || 'Default',
          hexCode: item.hexCode || item.hex || '#1B5E3B',
        };
      }
      return { name: 'Default', hexCode: '#1B5E3B' };
    });
  }

  return [];
};

/**
 * Helper to parse colorMedia payload if passed as JSON string or indexed form fields
 */
const parseColorMediaPayload = (body) => {
  if (!body) return [];
  let raw = body.colorMedia || body.colorVariants || [];
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch (e) {
      raw = [];
    }
  }
  if (Array.isArray(raw)) return raw;

  // Parse indexed FormData keys like colorMedia[0][colorName]
  const parsedMap = {};
  Object.keys(body).forEach((key) => {
    const match = key.match(/^colorMedia\[(\d+)\]\[(\w+)\]/);
    if (match) {
      const [, idx, prop] = match;
      if (!parsedMap[idx]) parsedMap[idx] = {};
      parsedMap[idx][prop] = body[key];
    }
  });

  const sortedKeys = Object.keys(parsedMap).sort((a, b) => Number(a) - Number(b));
  return sortedKeys.map((k) => parsedMap[k]);
};

/**
 * Helper to upload all colorMedia items (thumbnails, images, videos) to Cloudinary
 */
const processAndUploadColorMedia = async (input, filesMap = {}) => {
  if (!Array.isArray(input)) return [];

  const processedList = [];

  for (let index = 0; index < input.length; index++) {
    const item = input[index] || {};
    const colorName = item.colorName || item.name || `Variant ${index + 1}`;
    const hexCode = item.hexCode || item.hex || '#1B5E3B';

    // 1. Thumbnail upload
    let thumbnailSource = item.thumbnail || '';
    if (filesMap[`colorMedia[${index}][thumbnail]`]) {
      thumbnailSource = filesMap[`colorMedia[${index}][thumbnail]`][0];
    } else if (filesMap[`colorMedia_${index}_thumbnail`]) {
      thumbnailSource = filesMap[`colorMedia_${index}_thumbnail`][0];
    }
    let uploadedThumbnail = await uploadMediaToCloudinary(thumbnailSource, false);

    // 2. Images array upload
    let rawImages = [];
    if (filesMap[`colorMedia[${index}][images]`]) {
      rawImages = filesMap[`colorMedia[${index}][images]`];
    } else if (filesMap[`colorMedia_${index}_images`]) {
      rawImages = filesMap[`colorMedia_${index}_images`];
    } else if (Array.isArray(item.images)) {
      rawImages = item.images;
    } else if (typeof item.images === 'string') {
      rawImages = item.images.includes(',')
        ? item.images.split(',').map((s) => s.trim()).filter(Boolean)
        : [item.images];
    }

    const uploadedImages = [];
    for (const imgSource of rawImages) {
      if (!imgSource) continue;
      const uploadedImgUrl = await uploadMediaToCloudinary(imgSource, false);
      if (uploadedImgUrl) {
        uploadedImages.push(uploadedImgUrl);
      }
    }

    if (!uploadedThumbnail && uploadedImages.length > 0) {
      uploadedThumbnail = uploadedImages[0];
    }

    // 3. Video upload
    let videoSource = item.video || '';
    if (filesMap[`colorMedia[${index}][video]`]) {
      videoSource = filesMap[`colorMedia[${index}][video]`][0];
    } else if (filesMap[`colorMedia_${index}_video`]) {
      videoSource = filesMap[`colorMedia_${index}_video`][0];
    }
    const uploadedVideo = await uploadMediaToCloudinary(videoSource, true);

    processedList.push({
      colorName,
      hexCode,
      colorId: item.colorId || `col-${index}`,
      thumbnail: uploadedThumbnail,
      images: uploadedImages,
      video: uploadedVideo,
    });
  }

  return processedList;
};

// ==========================================
// 1. CREATE SAREE PRODUCT
// @route   POST /api/sarees
// ==========================================
const createSaree = async (req, res) => {
  try {
    const {
      name,
      SKU,
      description,
      category,
      subCategory,
      sareeType,
      price,
      discountedPrice,
      fabric,
      pattern,
      occasion,
      workType,
      borderType,
      sareeLength,
      sareeWidth,
      blousePiece,
      blouseLength,
      stock,
      isActive,
      colors,
      thumbnail,
      video,
      colorMedia,
      images,
    } = req.body;

    // 1. Required field validation
    if (!name || !SKU || !description || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, SKU, description, and price are required fields',
      });
    }

    // 2. Uniqueness check for SKU
    const existingSKU = await Saree.findOne({ SKU: SKU.trim().toUpperCase() });
    if (existingSKU) {
      return res.status(400).json({
        success: false,
        message: `Product with SKU '${SKU}' already exists`,
      });
    }

    // 3. Process uploaded files from Multer
    const filesMap = {};
    if (req.files) {
      if (Array.isArray(req.files)) {
        req.files.forEach((file) => {
          if (!filesMap[file.fieldname]) filesMap[file.fieldname] = [];
          filesMap[file.fieldname].push(file);
        });
      } else if (typeof req.files === 'object') {
        Object.keys(req.files).forEach((key) => {
          filesMap[key] = req.files[key];
        });
      }
    }

    // 4. Parse & Upload colorMedia
    const rawColorMedia = parseColorMediaPayload(req.body);
    const formattedColorMedia = await processAndUploadColorMedia(rawColorMedia, filesMap);

    // 5. Parse colors array ({ name, hexCode })
    let parsedColors = parseColorsPayload(colors);
    if (parsedColors.length === 0 && formattedColorMedia.length > 0) {
      parsedColors = formattedColorMedia.map((m) => ({
        name: m.colorName || 'Variant',
        hexCode: m.hexCode || '#1B5E3B',
      }));
    }

    // 6. Upload root thumbnail and video to Cloudinary
    let rootThumbnailSource = thumbnail;
    if (filesMap['thumbnail'] && filesMap['thumbnail'][0]) {
      rootThumbnailSource = filesMap['thumbnail'][0];
    }
    let uploadedRootThumbnail = rootThumbnailSource
      ? await uploadMediaToCloudinary(rootThumbnailSource, false)
      : (formattedColorMedia[0] ? formattedColorMedia[0].thumbnail || (formattedColorMedia[0].images && formattedColorMedia[0].images[0]) : '');

    let rootVideoSource = video;
    if (filesMap['video'] && filesMap['video'][0]) {
      rootVideoSource = filesMap['video'][0];
    }
    const uploadedRootVideo = rootVideoSource
      ? await uploadMediaToCloudinary(rootVideoSource, true)
      : (formattedColorMedia[0] ? formattedColorMedia[0].video : '');

    // 7. Upload general product images array
    let rawImages = Array.isArray(images) ? images : [];
    if (filesMap['images']) {
      rawImages = filesMap['images'];
    }
    const uploadedImagesList = [];
    for (const imgSource of rawImages) {
      const url = await uploadMediaToCloudinary(imgSource, false);
      if (url) uploadedImagesList.push(url);
    }

    if (!uploadedRootThumbnail && uploadedImagesList.length > 0) {
      uploadedRootThumbnail = uploadedImagesList[0];
    }

    // 8. Create and Save Saree Document
    const newSaree = await Saree.create({
      name: name.trim(),
      SKU: SKU.trim().toUpperCase(),
      description: description.trim(),
      category: category || 'Saree',
      subCategory: subCategory || '',
      sareeType: sareeType || '',
      price: Number(price),
      discountedPrice: discountedPrice ? Number(discountedPrice) : 0,
      fabric: fabric || '',
      pattern: pattern || '',
      occasion: occasion || '',
      workType: workType || '',
      borderType: borderType || '',
      sareeLength: sareeLength ? Number(sareeLength) : 5.5,
      sareeWidth: sareeWidth ? Number(sareeWidth) : 1.15,
      blousePiece: blousePiece !== undefined ? Boolean(blousePiece) : true,
      blouseLength: blouseLength ? Number(blouseLength) : 0.8,
      stock: stock !== undefined ? Number(stock) : 10,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      colors: parsedColors,
      thumbnail: uploadedRootThumbnail,
      video: uploadedRootVideo,
      images: uploadedImagesList,
      colorMedia: formattedColorMedia,
    });

    res.status(201).json({
      success: true,
      message: 'Saree product created successfully with Cloudinary URLs stored',
      data: newSaree,
    });
  } catch (error) {
    console.error('Create Saree Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating saree product',
      error: error.message,
    });
  }
};

// ==========================================
// 2. FETCH ALL SAREE PRODUCTS / SEARCH
// @route   GET /api/sarees
// ==========================================
const getSarees = async (req, res) => {
  try {
    const {
      search,
      q,
      category,
      subCategory,
      sareeType,
      fabric,
      pattern,
      occasion,
      workType,
      borderType,
      minPrice,
      maxPrice,
      isActive,
      sortBy,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const mongoose = require('mongoose');

    if (category) {
      let catName = category;
      let catId = category;
      const cleanName = decodeURIComponent(category).replace(/-/g, ' ').trim();

      if (mongoose.Types.ObjectId.isValid(category)) {
        const catObj = await Category.findById(category).lean();
        if (catObj) catName = catObj.name;
      } else {
        const catObj = await Category.findOne({
          $or: [
            { name: { $regex: new RegExp(`^${cleanName}$`, 'i') } },
            { name: { $regex: new RegExp(cleanName, 'i') } },
          ],
        }).lean();
        if (catObj) {
          catName = catObj.name;
          catId = catObj._id.toString();
        } else {
          catName = cleanName;
        }
      }

      filter.$or = [
        { category: { $regex: new RegExp(catId, 'i') } },
        { category: { $regex: new RegExp(catName, 'i') } },
        { subCategory: { $regex: new RegExp(catName, 'i') } },
        { fabric: { $regex: new RegExp(catName, 'i') } },
      ];
    }

    if (subCategory) {
      if (mongoose.Types.ObjectId.isValid(subCategory)) {
        const subObj = await SubCategory.findById(subCategory).lean();
        const subName = subObj ? subObj.name : subCategory;
        filter.$or = [
          { subCategory: { $regex: new RegExp(subCategory, 'i') } },
          { subCategory: { $regex: new RegExp(subName, 'i') } },
          { fabric: { $regex: new RegExp(subName, 'i') } },
        ];
      } else {
        filter.subCategory = { $regex: new RegExp(subCategory, 'i') };
      }
    }

    if (sareeType) filter.sareeType = { $regex: new RegExp(sareeType, 'i') };
    if (fabric) filter.fabric = { $regex: new RegExp(fabric, 'i') };
    if (pattern) filter.pattern = { $regex: new RegExp(pattern, 'i') };
    if (occasion) filter.occasion = { $regex: new RegExp(occasion, 'i') };
    if (workType) filter.workType = { $regex: new RegExp(workType, 'i') };
    if (borderType) filter.borderType = { $regex: new RegExp(borderType, 'i') };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const querySearchTerm = (search || q || '').trim();
    if (querySearchTerm) {
      const searchRegex = new RegExp(querySearchTerm, 'i');
      filter.$or = [
        { name: searchRegex },
        { SKU: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { subCategory: searchRegex },
        { sareeType: searchRegex },
        { fabric: searchRegex },
        { pattern: searchRegex },
        { occasion: searchRegex },
        { workType: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'newest' || sortBy === 'date_desc') sortOptions = { createdAt: -1 };
    if (sortBy === 'oldest' || sortBy === 'date_asc') sortOptions = { createdAt: 1 };
    if (sortBy === 'price_asc') sortOptions = { price: 1 };
    if (sortBy === 'price_desc') sortOptions = { price: -1 };
    if (sortBy === 'name') sortOptions = { name: 1 };
    if (sortBy === 'popular' || sortBy === 'most_loved') sortOptions = { favoriteCount: -1, salesCount: -1, createdAt: -1 };

    const total = await Saree.countDocuments(filter);
    const sarees = await Saree.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: sarees.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: sarees,
    });
  } catch (error) {
    console.error('Fetch Sarees Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching saree products',
      error: error.message,
    });
  }
};

// ==========================================
// 2B. SEARCH SAREES CONTROLLER (Category, SubCategory, Name, Fabric)
// @route   GET /api/sarees/search
// ==========================================
const searchSarees = async (req, res) => {
  try {
    const {
      q,
      search,
      name,
      category,
      subCategory,
      fabric,
      sortBy,
      page = 1,
      limit = 10,
    } = req.query;

    const searchTerm = (q || search || name || '').trim();
    const filter = { isActive: true };

    const mongoose = require('mongoose');

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        const catObj = await Category.findById(category).lean();
        const catName = catObj ? catObj.name : category;
        filter.$or = [
          { category: { $regex: new RegExp(category, 'i') } },
          { category: { $regex: new RegExp(catName, 'i') } },
        ];
      } else {
        filter.category = { $regex: new RegExp(category, 'i') };
      }
    }

    if (subCategory) {
      if (mongoose.Types.ObjectId.isValid(subCategory)) {
        const subObj = await SubCategory.findById(subCategory).lean();
        const subName = subObj ? subObj.name : subCategory;
        filter.$or = [
          { subCategory: { $regex: new RegExp(subCategory, 'i') } },
          { subCategory: { $regex: new RegExp(subName, 'i') } },
        ];
      } else {
        filter.subCategory = { $regex: new RegExp(subCategory, 'i') };
      }
    }

    if (fabric) {
      filter.fabric = { $regex: new RegExp(fabric, 'i') };
    }

    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, 'i');
      filter.$or = [
        { name: searchRegex },
        { category: searchRegex },
        { subCategory: searchRegex },
        { sareeType: searchRegex },
        { fabric: searchRegex },
        { description: searchRegex },
        { pattern: searchRegex },
        { occasion: searchRegex },
        { workType: searchRegex },
        { SKU: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'newest' || sortBy === 'date_desc') sortOptions = { createdAt: -1 };
    if (sortBy === 'oldest' || sortBy === 'date_asc') sortOptions = { createdAt: 1 };
    if (sortBy === 'price_asc') sortOptions = { price: 1 };
    if (sortBy === 'price_desc') sortOptions = { price: -1 };
    if (sortBy === 'name') sortOptions = { name: 1 };
    if (sortBy === 'popular' || sortBy === 'most_loved') sortOptions = { favoriteCount: -1, salesCount: -1, createdAt: -1 };

    const total = await Saree.countDocuments(filter);
    const sarees = await Saree.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: sarees.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: sarees,
    });
  } catch (error) {
    console.error('Search Sarees Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching saree products',
      error: error.message,
    });
  }
};

// ==========================================
// 3. FETCH SINGLE SAREE BY ID OR SKU
// @route   GET /api/sarees/:id
// ==========================================
const getSareeById = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');

    let saree = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      saree = await Saree.findById(id);
    }

    if (!saree) {
      saree = await Saree.findOne({ SKU: id.toUpperCase() });
    }

    if (!saree) {
      return res.status(404).json({
        success: false,
        message: 'Saree product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: saree,
    });
  } catch (error) {
    console.error('Get Saree By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching saree details',
      error: error.message,
    });
  }
};

// ==========================================
// 4. UPDATE SAREE PRODUCT
// @route   PUT /api/sarees/:id
// ==========================================
const updateSaree = async (req, res) => {
  try {
    let saree = await Saree.findById(req.params.id);

    if (!saree) {
      return res.status(404).json({
        success: false,
        message: 'Saree product not found',
      });
    }

    if (req.body.SKU && req.body.SKU.trim().toUpperCase() !== saree.SKU) {
      const existingSKU = await Saree.findOne({ SKU: req.body.SKU.trim().toUpperCase() });
      if (existingSKU) {
        return res.status(400).json({
          success: false,
          message: `Product with SKU '${req.body.SKU}' already exists`,
        });
      }
      req.body.SKU = req.body.SKU.trim().toUpperCase();
    }

    // Process files map
    const filesMap = {};
    if (req.files) {
      if (Array.isArray(req.files)) {
        req.files.forEach((file) => {
          if (!filesMap[file.fieldname]) filesMap[file.fieldname] = [];
          filesMap[file.fieldname].push(file);
        });
      } else if (typeof req.files === 'object') {
        Object.keys(req.files).forEach((key) => {
          filesMap[key] = req.files[key];
        });
      }
    }

    // Update colorMedia if provided
    const rawColorMedia = parseColorMediaPayload(req.body);
    if (rawColorMedia && rawColorMedia.length > 0) {
      const formattedColorMedia = await processAndUploadColorMedia(rawColorMedia, filesMap);
      if (formattedColorMedia.length > 0) {
        req.body.colorMedia = formattedColorMedia;
      }
    }

    // Update colors array if provided
    if (req.body.colors) {
      req.body.colors = parseColorsPayload(req.body.colors);
    }

    // Upload root thumbnail/video if changed
    if (req.body.thumbnail) {
      req.body.thumbnail = await uploadMediaToCloudinary(req.body.thumbnail, false);
    } else if (filesMap['thumbnail'] && filesMap['thumbnail'][0]) {
      req.body.thumbnail = await uploadMediaToCloudinary(filesMap['thumbnail'][0], false);
    }

    if (req.body.video) {
      req.body.video = await uploadMediaToCloudinary(req.body.video, true);
    } else if (filesMap['video'] && filesMap['video'][0]) {
      req.body.video = await uploadMediaToCloudinary(filesMap['video'][0], true);
    }

    const updatedSaree = await Saree.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Saree product updated successfully',
      data: updatedSaree,
    });
  } catch (error) {
    console.error('Update Saree Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating saree product',
      error: error.message,
    });
  }
};

// ==========================================
// 5. DELETE SAREE PRODUCT
// @route   DELETE /api/sarees/:id
// ==========================================
const deleteSaree = async (req, res) => {
  try {
    const saree = await Saree.findById(req.params.id);

    if (!saree) {
      return res.status(404).json({
        success: false,
        message: 'Saree product not found',
      });
    }

    await Saree.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Saree product deleted successfully',
      deletedId: req.params.id,
    });
  } catch (error) {
    console.error('Delete Saree Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting saree product',
      error: error.message,
    });
  }
};

module.exports = {
  createSaree,
  getSarees,
  searchSarees,
  getSareeById,
  updateSaree,
  deleteSaree,
};

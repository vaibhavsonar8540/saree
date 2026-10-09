'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  clearProductFeedback,
} from '../redux/slices/productSlice';
import { fetchCategoriesAction, fetchSubCategoriesAction } from '../redux/slices/categorySlice';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ListFilter,
  Upload,
  Palette,
  X,
  Film,
  Check,
  Link as LinkIcon,
  Sliders,
  Scissors,
} from 'lucide-react';

export default function ProductManager() {
  const dispatch = useDispatch();

  const { products, loading, submitting, error, successMessage } = useSelector((state) => state.product);
  const { categories, subCategories } = useSelector((state) => state.category);

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add'
  const [localFeedback, setLocalFeedback] = useState(null);

  // Custom Colors created dynamically per product
  const [customColors, setCustomColors] = useState([]);
  const [showAddColorModal, setShowAddColorModal] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#B76E79');

  // Form State (All fields default to empty with placeholders)
  const initialFormState = {
    name: '',
    SKU: '',
    description: '',
    category: '',
    subCategory: '',
    sareeType: '',
    price: '',
    discountedPrice: '',
    fabric: '',
    pattern: '',
    occasion: '',
    workType: '',
    borderType: '',
    sareeLength: '',
    sareeWidth: '',
    blousePiece: true,
    blouseLength: '',
    stock: '',
    isActive: true,
    thumbnail: '',
    video: '',
    selectedColors: [],
  };

  const [formData, setFormData] = useState(initialFormState);

  // Per-color media map: { [colorId]: { thumbnail: '', detailImages: [], video: '' } }
  const [colorMediaMap, setColorMediaMap] = useState({});
  const [activeUrlInput, setActiveUrlInput] = useState({ colorId: null, type: null }); // type: 'thumbnail' | 'detail' | 'video'
  const [urlInputValue, setUrlInputValue] = useState('');

  const loadAllData = () => {
    dispatch(fetchProductsAction());
    dispatch(fetchCategoriesAction());
    dispatch(fetchSubCategoriesAction());
  };

  useEffect(() => {
    loadAllData();
  }, [dispatch]);

  const showLocalFeedback = (type, text) => {
    setLocalFeedback({ type, text });
    setTimeout(() => setLocalFeedback(null), 5000);
  };

  useEffect(() => {
    if (error) {
      showLocalFeedback('error', typeof error === 'string' ? error : 'Failed to submit product');
      dispatch(clearProductFeedback());
    }
    if (successMessage) {
      showLocalFeedback('success', successMessage);
      dispatch(clearProductFeedback());
    }
  }, [error, successMessage, dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      // Reset subCategory if category changes
      if (name === 'category') {
        updated.subCategory = '';
      }
      return updated;
    });
  };

  // Filter subcategories dynamically based on selected Category
  const selectedCategoryObj = categories.find(
    (c) => c.name === formData.category || c._id === formData.category
  );

  const availableSubCategories = subCategories.filter((s) => {
    if (!formData.category) return true;
    if (!s.categoryId) return true;

    const catId = typeof s.categoryId === 'object' ? s.categoryId._id : s.categoryId;
    const catName = typeof s.categoryId === 'object' ? s.categoryId.name : null;

    if (catName && catName.toLowerCase() === formData.category.toLowerCase()) {
      return true;
    }

    if (selectedCategoryObj && catId === selectedCategoryObj._id) {
      return true;
    }

    if (catId === formData.category) {
      return true;
    }

    return false;
  });

  const handleColorToggle = (colorId) => {
    setFormData((prev) => {
      const exists = prev.selectedColors.includes(colorId);
      return {
        ...prev,
        selectedColors: exists
          ? prev.selectedColors.filter((id) => id !== colorId)
          : [...prev.selectedColors, colorId],
      };
    });
  };

  const handleRemoveColorPill = (colorId, e) => {
    e.stopPropagation();
    setCustomColors((prev) => prev.filter((c) => c._id !== colorId));
    setFormData((prev) => ({
      ...prev,
      selectedColors: prev.selectedColors.filter((id) => id !== colorId),
    }));
    setColorMediaMap((prev) => {
      const copy = { ...prev };
      delete copy[colorId];
      return copy;
    });
  };

  // Add Custom Color Handler
  const handleAddNewColor = (e) => {
    e.preventDefault();
    const nameTrimmed = newColorName.trim();
    if (!nameTrimmed) {
      showLocalFeedback('error', 'Please enter a color name.');
      return;
    }

    let hex = newColorHex.trim();
    if (hex && !hex.startsWith('#')) {
      hex = `#${hex}`;
    }
    if (!hex) hex = '#B76E79';

    const colorId = `color_${Date.now()}`;
    const colorObj = { _id: colorId, name: nameTrimmed, hexCode: hex };

    setCustomColors((prev) => [...prev, colorObj]);
    setFormData((prev) => ({
      ...prev,
      selectedColors: [...prev.selectedColors, colorId],
    }));

    setNewColorName('');
    setNewColorHex('#B76E79');
    setShowAddColorModal(false);
    showLocalFeedback('success', `Color '${nameTrimmed}' added!`);
  };

  // Media helpers for color variation matrix
  const updateColorField = (colorId, field, value) => {
    setColorMediaMap((prev) => ({
      ...prev,
      [colorId]: {
        ...(prev[colorId] || { thumbnail: '', detailImages: [], video: '' }),
        [field]: value,
      },
    }));
  };

  const handleFileSelect = (colorId, field, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (field === 'detailImages') {
        const currentList = colorMediaMap[colorId]?.detailImages || [];
        if (currentList.length >= 5) {
          showLocalFeedback('error', 'Maximum 5 detail images allowed per color variant.');
          return;
        }
        updateColorField(colorId, 'detailImages', [...currentList, reader.result]);
      } else {
        updateColorField(colorId, field, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddUrlMedia = (colorId, type) => {
    if (!urlInputValue.trim()) return;
    if (type === 'detailImages') {
      const currentList = colorMediaMap[colorId]?.detailImages || [];
      if (currentList.length >= 5) {
        showLocalFeedback('error', 'Maximum 5 detail images allowed per color variant.');
        return;
      }
      updateColorField(colorId, 'detailImages', [...currentList, urlInputValue.trim()]);
    } else {
      updateColorField(colorId, type, urlInputValue.trim());
    }
    setUrlInputValue('');
    setActiveUrlInput({ colorId: null, type: null });
  };

  const removeDetailImage = (colorId, index) => {
    const currentList = colorMediaMap[colorId]?.detailImages || [];
    const updated = currentList.filter((_, i) => i !== index);
    updateColorField(colorId, 'detailImages', updated);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.SKU.trim() || !formData.price) {
      showLocalFeedback('error', 'Product Name, SKU, and Price are required fields.');
      return;
    }

    const colorsPayload = [];
    const colorMediaPayload = [];

    for (const cId of formData.selectedColors) {
      const customObj = customColors.find((c) => c._id === cId) || { name: 'Color', hexCode: '#1B5E3B' };
      colorsPayload.push({
        name: customObj.name,
        hexCode: customObj.hexCode,
      });

      const media = colorMediaMap[cId] || {};
      const thumb = media.thumbnail || formData.thumbnail || '';
      const imgs = media.detailImages && media.detailImages.length > 0 ? media.detailImages : (thumb ? [thumb] : []);

      colorMediaPayload.push({
        colorName: customObj.name,
        hexCode: customObj.hexCode,
        colorId: cId,
        thumbnail: thumb,
        images: imgs,
        video: media.video || formData.video || '',
      });
    }

    const rootThumb =
      formData.thumbnail ||
      (colorMediaPayload[0] ? colorMediaPayload[0].thumbnail : '') ||
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop';

    const payload = {
      name: formData.name.trim(),
      SKU: formData.SKU.trim(),
      description: formData.description.trim(),
      category: formData.category || 'Saree',
      subCategory: formData.subCategory || '',
      sareeType: formData.sareeType || '',
      price: Number(formData.price),
      discountedPrice: Number(formData.discountedPrice || 0),
      fabric: formData.fabric || '',
      pattern: formData.pattern || '',
      occasion: formData.occasion || '',
      workType: formData.workType || '',
      borderType: formData.borderType || '',
      sareeLength: Number(formData.sareeLength || 5.5),
      sareeWidth: Number(formData.sareeWidth || 1.2),
      blousePiece: formData.blousePiece,
      blouseLength: Number(formData.blouseLength || 0.8),
      stock: Number(formData.stock || 0),
      isActive: formData.isActive,
      colors: colorsPayload,
      colorMedia: colorMediaPayload,
      thumbnail: rootThumb,
      video: formData.video || (colorMediaPayload[0] ? colorMediaPayload[0].video : ''),
    };

    const resAction = await dispatch(createProductAction(payload));
    if (createProductAction.fulfilled.match(resAction)) {
      showLocalFeedback('success', `Product '${formData.name}' created successfully!`);
      setFormData(initialFormState);
      setCustomColors([]);
      setColorMediaMap({});
      dispatch(fetchProductsAction());
      setActiveTab('list');
    }
  };

  const handleDeleteProduct = (id, name) => {
    if (!confirm(`Are you sure you want to delete '${name}'?`)) return;
    dispatch(deleteProductAction(id));
  };

  const handleToggleActive = async (product) => {
    const newActive = product.isActive === false ? true : false;
    const resAction = await dispatch(
      updateProductAction({ id: product._id, sareeData: { isActive: newActive } })
    );
    if (updateProductAction.fulfilled.match(resAction)) {
      showLocalFeedback('success', `'${product.name}' status set to ${newActive ? 'ACTIVE' : 'INACTIVE'}`);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 font-sans">
      {/* Header Banner with Primary Add Product Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-emerald-600" /> Saree Products Manager
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage saree inventory cards, toggle active storefront visibility, and upload variation media.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all border border-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'list' ? 'add' : 'list')}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95"
          >
            {activeTab === 'list' ? (
              <>
                <Plus className="w-4 h-4" /> Add New Saree
              </>
            ) : (
              <>
                <ListFilter className="w-4 h-4" /> View All Products ({products.length})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {localFeedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border text-sm font-semibold transition-all shadow-xs ${
            localFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {localFeedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <span>{localFeedback.text}</span>
          </div>
        </div>
      )}

      {/* MAIN VIEW AREA: PRODUCT CARDS OR ADD FORM */}
      {activeTab === 'list' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">
              LIVE PRODUCT CARDS ({products.length})
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Toggle switch controls storefront visibility
            </span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 shadow-xs">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No saree products found.</p>
              <p className="text-xs text-slate-400 mt-1">Click + Add New Saree at the top to create your first item.</p>
              <button
                onClick={() => setActiveTab('add')}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" /> Add New Saree
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((item) => (
                <div
                  key={item._id}
                  className={`bg-white rounded-3xl border transition-all duration-300 hover:shadow-xl flex flex-col justify-between overflow-hidden relative group ${
                    item.isActive !== false
                      ? 'border-slate-200/80 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 opacity-90'
                  }`}
                >
                  {/* Card Image Banner & Badges */}
                  <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={
                        item.thumbnail ||
                        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop'
                      }
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Stock Badge */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border backdrop-blur-md ${
                          item.stock > 0
                            ? 'bg-emerald-500/90 text-white border-emerald-400'
                            : 'bg-rose-500/90 text-white border-rose-400'
                        }`}
                      >
                        {item.stock > 0 ? `${item.stock} IN STOCK` : 'OUT OF STOCK'}
                      </span>
                    </div>

                    {/* SKU Tag */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-900/80 text-white backdrop-blur-md">
                        {item.SKU}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Categories */}
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-100">
                          {item.category || 'Saree'}
                        </span>
                        {item.subCategory && (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                            {item.subCategory}
                          </span>
                        )}
                        {item.fabric && (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">
                            {item.fabric}
                          </span>
                        )}
                      </div>

                      {/* Product Name */}
                      <h3 className="font-black text-base text-slate-900 tracking-tight line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {item.description || 'Luxury handcrafted designer saree.'}
                      </p>
                    </div>

                    {/* Price & Actions Row */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-xs text-slate-400 font-bold uppercase block text-[10px]">Price</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-slate-900">
                              ₹{item.discountedPrice > 0 ? item.discountedPrice : item.price}
                            </span>
                            {item.discountedPrice > 0 && (
                              <span className="line-through text-xs text-slate-400 font-normal">
                                ₹{item.price}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* ACTIVE TOGGLE SWITCH */}
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200/80">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider ${
                              item.isActive !== false ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                          >
                            {item.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleActive(item)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              item.isActive !== false ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                            role="switch"
                            aria-checked={item.isActive !== false}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                item.isActive !== false ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {item.colors?.length || 0} Color Variants
                        </span>

                        <button
                          onClick={() => handleDeleteProduct(item._id, item.name)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">

          <div className="p-8">
            <form onSubmit={handleCreateProduct} className="space-y-8">
              {/* Step 1: Basic & Full Controller Specifications */}
              <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 space-y-6">
                <div>
                  <h3 className="font-bold text-sm uppercase text-slate-800 tracking-wider flex items-center gap-2">
                    <Sliders className="w-4.5 h-4.5 text-slate-900" /> Step 1 — Basic Product Specifications
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    All core details, pricing, fabric specs, and dimensions defined in the controller.
                  </p>
                </div>

                {/* Sub-Section A: Basic Info & Pricing */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Basic Info & Pricing
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Saree Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="e.g. Royal Banarasi Silk Saree"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        SKU Code *
                      </label>
                      <input
                        type="text"
                        name="SKU"
                        placeholder="e.g. SAR-BAN-001"
                        value={formData.SKU}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Saree Type
                      </label>
                      <input
                        type="text"
                        name="sareeType"
                        placeholder="e.g. Banarasi, Kanjivaram, Chanderi"
                        value={formData.sareeType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      rows="3"
                      placeholder="Enter detailed description of fabric, design, and weave..."
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      required
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                      >
                        <option value="">-- Select Category --</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">SubCategory</label>
                      <select
                        name="subCategory"
                        value={formData.subCategory}
                        onChange={handleInputChange}
                        disabled={!formData.category && availableSubCategories.length === 0}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option value="">
                          {!formData.category
                            ? '-- Select Category First --'
                            : availableSubCategories.length === 0
                            ? '-- No SubCategories Available --'
                            : '-- Select SubCategory --'}
                        </option>
                        {availableSubCategories.map((s) => (
                          <option key={s._id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Price (₹) *</label>
                      <input
                        type="number"
                        name="price"
                        placeholder="e.g. 12999"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Discounted Price (₹)</label>
                      <input
                        type="number"
                        name="discountedPrice"
                        placeholder="e.g. 9999"
                        value={formData.discountedPrice}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Stock Quantity *</label>
                      <input
                        type="number"
                        name="stock"
                        placeholder="e.g. 10"
                        value={formData.stock}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-Section B: Fabric & Craft Specifications */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-slate-700" /> Fabric & Craft Specifications
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Fabric</label>
                      <input
                        type="text"
                        name="fabric"
                        placeholder="e.g. Silk, Georgette, Organza"
                        value={formData.fabric}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Pattern</label>
                      <input
                        type="text"
                        name="pattern"
                        placeholder="e.g. Zari Embroidered, Floral"
                        value={formData.pattern}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Occasion</label>
                      <input
                        type="text"
                        name="occasion"
                        placeholder="e.g. Wedding, Festive, Bridal"
                        value={formData.occasion}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Work Type</label>
                      <input
                        type="text"
                        name="workType"
                        placeholder="e.g. Zari, Gota Patti, Sequence"
                        value={formData.workType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Border Type</label>
                      <input
                        type="text"
                        name="borderType"
                        placeholder="e.g. Heavy Border, Contrast"
                        value={formData.borderType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-Section C: Dimensions & Blouse Options */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Dimensions & Options
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Saree Length (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="sareeLength"
                        placeholder="e.g. 5.5"
                        value={formData.sareeLength}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Saree Width (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="sareeWidth"
                        placeholder="e.g. 1.2"
                        value={formData.sareeWidth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Blouse Length (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="blouseLength"
                        placeholder="e.g. 0.8"
                        value={formData.blouseLength}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="blousePiece"
                        name="blousePiece"
                        checked={formData.blousePiece}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                      />
                      <label htmlFor="blousePiece" className="text-xs font-bold text-slate-700 select-none">
                        Includes Blouse Piece
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                      />
                      <label htmlFor="isActive" className="text-xs font-bold text-slate-700 select-none">
                        Active on Storefront
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 & 3: Colors Selection & Custom Add */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm uppercase text-slate-800 tracking-wider flex items-center gap-2">
                      <Palette className="w-4.5 h-4.5 text-amber-500" /> Step 2 & 3 — Colors Selection
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Add color variations to construct variation media for this product.
                    </p>
                  </div>

                  <span className="text-[11px] font-bold uppercase text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    SELECT COLORS ({formData.selectedColors.length} SELECTED)
                  </span>
                </div>

                {/* Color Pills List */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  {customColors.map((c) => {
                    const isSelected = formData.selectedColors.includes(c._id);
                    return (
                      <div
                        key={c._id}
                        onClick={() => handleColorToggle(c._id)}
                        className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all shadow-xs cursor-pointer ${
                          isSelected
                            ? 'bg-slate-950 text-white border-slate-950 ring-2 ring-slate-400/20'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs shrink-0"
                          style={{ backgroundColor: c.hexCode }}
                        ></span>
                        <span>{c.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        <button
                          type="button"
                          onClick={(e) => handleRemoveColorPill(c._id, e)}
                          className="text-slate-400 hover:text-rose-400 ml-1 p-0.5"
                          title="Remove Color"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* + Add New Color Pill Button */}
                  <button
                    type="button"
                    onClick={() => setShowAddColorModal((prev) => !prev)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-dashed border-slate-400 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-600 transition-all bg-slate-50/50"
                  >
                    <Plus className="w-4 h-4 text-slate-900" />
                    <span>Add New Color</span>
                  </button>
                </div>

                {/* Clean Add Color Input Card */}
                {showAddColorModal && (
                  <div className="mt-4 p-5 bg-slate-50/90 rounded-2xl border border-slate-300 shadow-sm space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs uppercase text-slate-800 tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" /> Create & Add Custom Color Swatch
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowAddColorModal(false)}
                        className="text-slate-400 hover:text-slate-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-6">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Color Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Rose Gold, Peacock Blue, Emerald"
                          value={newColorName}
                          onChange={(e) => setNewColorName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Hex Code
                        </label>
                        <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-300 rounded-xl focus-within:ring-2 focus-within:ring-slate-900">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                            style={{ backgroundColor: newColorHex || '#B76E79' }}
                          ></span>
                          <input
                            type="text"
                            placeholder="#B76E79"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            className="w-full text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={handleAddNewColor}
                          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 4 & 5: Variation Matrix & Media Upload */}
              {formData.selectedColors.length > 0 && (
                <div className="space-y-6 pt-2">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" /> Step 4 & 5 — Variation Matrix & Media Upload
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Upload thumbnail (1), detail images (up to 5 max), and video for each generated color combination.
                    </p>
                  </div>

                  {formData.selectedColors.map((cId) => {
                    const colorObj = customColors.find((c) => c._id === cId) || { name: 'Color', hexCode: '#000' };
                    const media = colorMediaMap[cId] || { thumbnail: '', detailImages: [], video: '' };

                    return (
                      <div
                        key={cId}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 transition-all hover:border-slate-300"
                      >
                        {/* Variation Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <span
                              className="w-4.5 h-4.5 rounded-full border border-slate-300 shadow-xs shrink-0"
                              style={{ backgroundColor: colorObj.hexCode }}
                            ></span>
                            <h4 className="font-bold text-slate-900 text-base">{colorObj.name}</h4>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline-block">
                            Storage path: sarees/products/{formData.SKU || 'NEW'}/variations/{colorObj.name.toLowerCase()}
                          </span>
                        </div>

                        {/* 3 Upload Box Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Column 1: THUMBNAIL (1 IMAGE) */}
                          <div className="space-y-2">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              THUMBNAIL (1 IMAGE)
                            </label>

                            {media.thumbnail ? (
                              <div className="relative group w-full h-36 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                                <img
                                  src={media.thumbnail}
                                  alt="Thumbnail"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateColorField(cId, 'thumbnail', '')}
                                  className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-full shadow-md hover:bg-rose-700 transition-all opacity-90 group-hover:opacity-100"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="relative border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-2xl h-36 flex flex-col items-center justify-center p-4 bg-slate-50/40 transition-all text-center">
                                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                  UPLOAD
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileSelect(cId, 'thumbnail', e.target.files[0])}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <button
                                  type="button"
                                  onClick={() => setActiveUrlInput({ colorId: cId, type: 'thumbnail' })}
                                  className="mt-2 text-[10px] text-purple-600 font-bold hover:underline flex items-center gap-1 relative z-10"
                                >
                                  <LinkIcon className="w-3 h-3" /> Or paste Image URL
                                </button>
                              </div>
                            )}

                            {activeUrlInput.colorId === cId && activeUrlInput.type === 'thumbnail' && (
                              <div className="flex gap-1.5 pt-1">
                                <input
                                  type="url"
                                  placeholder="https://example.com/thumb.jpg"
                                  value={urlInputValue}
                                  onChange={(e) => setUrlInputValue(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddUrlMedia(cId, 'thumbnail')}
                                  className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg"
                                >
                                  OK
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Column 2: DETAIL IMAGES (0/5 MAX) */}
                          <div className="space-y-2">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              DETAIL IMAGES ({media.detailImages?.length || 0}/5 MAX)
                            </label>

                            <div className="flex flex-wrap gap-2">
                              {(media.detailImages || []).map((img, idx) => (
                                <div
                                  key={idx}
                                  className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
                                >
                                  <img src={img} alt={`Detail ${idx}`} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => removeDetailImage(cId, idx)}
                                    className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full shadow-md hover:bg-rose-700 transition-all opacity-90"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}

                              {(media.detailImages || []).length < 5 && (
                                <div className="relative border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-2xl w-16 h-16 flex flex-col items-center justify-center bg-slate-50/40 transition-all cursor-pointer">
                                  <Plus className="w-5 h-5 text-slate-400" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileSelect(cId, 'detailImages', e.target.files[0])}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => setActiveUrlInput({ colorId: cId, type: 'detailImages' })}
                              className="text-[10px] text-purple-600 font-bold hover:underline flex items-center gap-1 pt-1"
                            >
                              <LinkIcon className="w-3 h-3" /> Or paste Detail Image URL
                            </button>

                            {activeUrlInput.colorId === cId && activeUrlInput.type === 'detailImages' && (
                              <div className="flex gap-1.5 pt-1">
                                <input
                                  type="url"
                                  placeholder="https://example.com/detail.jpg"
                                  value={urlInputValue}
                                  onChange={(e) => setUrlInputValue(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddUrlMedia(cId, 'detailImages')}
                                  className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg"
                                >
                                  OK
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Column 3: PRODUCT VIDEO (OPTIONAL) */}
                          <div className="space-y-2">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              PRODUCT VIDEO (OPTIONAL)
                            </label>

                            {media.video ? (
                              <div className="relative group w-full h-36 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 flex flex-col items-center justify-center text-white">
                                <Film className="w-8 h-8 text-purple-400 mb-1" />
                                <span className="text-[11px] font-medium max-w-[180px] truncate px-2">
                                  {media.video}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateColorField(cId, 'video', '')}
                                  className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-full shadow-md hover:bg-rose-700 transition-all opacity-90"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="relative border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-2xl h-36 flex flex-col items-center justify-center p-4 bg-slate-50/40 transition-all text-center">
                                <Film className="w-6 h-6 text-slate-400 mb-1" />
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                  UPLOAD VIDEO
                                </span>
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) => handleFileSelect(cId, 'video', e.target.files[0])}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <button
                                  type="button"
                                  onClick={() => setActiveUrlInput({ colorId: cId, type: 'video' })}
                                  className="mt-2 text-[10px] text-purple-600 font-bold hover:underline flex items-center gap-1 relative z-10"
                                >
                                  <LinkIcon className="w-3 h-3" /> Or paste Video URL
                                </button>
                              </div>
                            )}

                            {activeUrlInput.colorId === cId && activeUrlInput.type === 'video' && (
                              <div className="flex gap-1.5 pt-1">
                                <input
                                  type="url"
                                  placeholder="https://example.com/video.mp4"
                                  value={urlInputValue}
                                  onChange={(e) => setUrlInputValue(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddUrlMedia(cId, 'video')}
                                  className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg"
                                >
                                  OK
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {submitting ? 'Submitting...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

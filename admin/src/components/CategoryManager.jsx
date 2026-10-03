'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategoriesAction,
  createCategoryAction,
  deleteCategoryAction,
  seedCategoriesAction,
  fetchSubCategoriesAction,
  createSubCategoryAction,
  deleteSubCategoryAction,
  seedSubCategoriesAction,
  clearCategoryFeedback,
} from '../redux/slices/categorySlice';
import {
  FolderPlus,
  Layers,
  Plus,
  Trash2,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Tag,
  ListFilter,
} from 'lucide-react';

export default function CategoryManager() {
  const dispatch = useDispatch();
  const {
    categories,
    subCategories,
    loading,
    categoryLoading,
    subCategoryLoading,
    error,
    successMessage,
  } = useSelector((state) => state.category);

  const [activeTab, setActiveTab] = useState('category'); // 'category' | 'subcategory'
  const [categoryName, setCategoryName] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [localFeedback, setLocalFeedback] = useState(null);

  const loadData = () => {
    dispatch(fetchCategoriesAction(true));
    dispatch(fetchSubCategoriesAction());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const showLocalFeedback = (type, text) => {
    setLocalFeedback({ type, text });
    setTimeout(() => setLocalFeedback(null), 4000);
  };

  useEffect(() => {
    if (error) {
      showLocalFeedback('error', error);
      dispatch(clearCategoryFeedback());
    }
    if (successMessage) {
      showLocalFeedback('success', successMessage);
      dispatch(clearCategoryFeedback());
    }
  }, [error, successMessage, dispatch]);

  // ---------------- CATEGORY HANDLERS ----------------
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      showLocalFeedback('error', 'Please enter a valid category name');
      return;
    }

    const resAction = await dispatch(createCategoryAction(categoryName.trim()));
    if (createCategoryAction.fulfilled.match(resAction)) {
      setCategoryName('');
      dispatch(fetchCategoriesAction(true));
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!confirm(`Are you sure you want to delete category '${name}' and its subcategories?`)) return;
    dispatch(deleteCategoryAction(id));
  };

  const handleSeedCategories = () => {
    dispatch(seedCategoriesAction());
  };

  // ---------------- SUBCATEGORY HANDLERS ----------------
  const handleCreateSubCategory = async (e) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      showLocalFeedback('error', 'Please select a parent Category');
      return;
    }
    if (!subCategoryName.trim()) {
      showLocalFeedback('error', 'Please enter a subcategory name');
      return;
    }

    const resAction = await dispatch(
      createSubCategoryAction({ name: subCategoryName.trim(), categoryId: selectedCategoryId })
    );
    if (createSubCategoryAction.fulfilled.match(resAction)) {
      setSubCategoryName('');
      dispatch(fetchSubCategoriesAction());
    }
  };

  const handleDeleteSubCategory = (id, name) => {
    if (!confirm(`Are you sure you want to delete subcategory '${name}'?`)) return;
    dispatch(deleteSubCategoryAction(id));
  };

  const handleSeedSubCategories = () => {
    dispatch(seedSubCategoriesAction());
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <FolderPlus className="w-7 h-7 text-sky-600" /> Category & Subcategory Manager
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Organize saree store categories and assign subcategories dynamically. (Powered by Redux Toolkit)
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all border border-slate-200"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>

      {/* Toast Alert Message */}
      {localFeedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border text-sm font-semibold transition-all shadow-sm ${
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

      {/* TAB NAVIGATION LAYOUT */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/80 p-2 gap-2">
          <button
            onClick={() => setActiveTab('category')}
            className={`flex-1 py-3 px-6 rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'category'
                ? 'bg-white text-sky-600 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            <Tag className="w-4 h-4" /> CREATE CATEGORY
          </button>

          <button
            onClick={() => setActiveTab('subcategory')}
            className={`flex-1 py-3 px-6 rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'subcategory'
                ? 'bg-white text-sky-600 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            <Layers className="w-4 h-4" /> CREATE SUBCATEGORY
          </button>
        </div>

        {/* TAB 1: CATEGORY CONTENT */}
        {activeTab === 'category' && (
          <div className="p-8 space-y-8">
            {/* Create Category Form */}
            <form onSubmit={handleCreateCategory} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-sm uppercase text-slate-700 tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-600" /> Add New Category
              </h3>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter Category Name (e.g. Saree, Lehenga, Kurti)"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  required
                />

                <button
                  type="submit"
                  disabled={categoryLoading}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  {categoryLoading ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>

            {/* Existing Categories List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-slate-500" /> Category List ({categories.length})
                </h3>

                {categories.length === 0 && (
                  <button
                    onClick={handleSeedCategories}
                    className="text-xs text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Seed Default Categories
                  </button>
                )}
              </div>

              {categories.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
                  <Tag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-500">No categories created yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Use the form above or click Seed Default Categories.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <div
                      key={cat._id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
                    >
                      <div>
                        <h4 className="font-bold text-base text-slate-800">{cat.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {cat.subCategories ? `${cat.subCategories.length} Subcategories` : 'Active'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteCategory(cat._id, cat.name)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-80 group-hover:opacity-100"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SUBCATEGORY CONTENT */}
        {activeTab === 'subcategory' && (
          <div className="p-8 space-y-8">
            {/* Create SubCategory Form */}
            <form onSubmit={handleCreateSubCategory} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-sm uppercase text-slate-700 tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-600" /> Add New SubCategory
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Select Parent Category
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                    required
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    SubCategory Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Subcategory Name (e.g. Banarasi, Kanjivaram)"
                    value={subCategoryName}
                    onChange={(e) => setSubCategoryName(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={subCategoryLoading}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4" />
                  {subCategoryLoading ? 'Creating...' : 'Create SubCategory'}
                </button>
              </div>
            </form>

            {/* Existing SubCategories List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-slate-500" /> SubCategory List ({subCategories.length})
                </h3>

                {subCategories.length === 0 && (
                  <button
                    onClick={handleSeedSubCategories}
                    className="text-xs text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Seed Default SubCategories
                  </button>
                )}
              </div>

              {subCategories.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
                  <Layers className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-500">No subcategories created yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Select a category and enter subcategory name above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subCategories.map((sub) => (
                    <div
                      key={sub._id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
                    >
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-700 mb-1">
                          {sub.categoryId?.name || 'Category'}
                        </span>
                        <h4 className="font-bold text-base text-slate-800">{sub.name}</h4>
                      </div>

                      <button
                        onClick={() => handleDeleteSubCategory(sub._id, sub.name)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-80 group-hover:opacity-100"
                        title="Delete SubCategory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

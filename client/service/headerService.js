import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Service to fetch categories along with their subcategories for the header component.
 * References backend server endpoints:
 * GET /api/categories?includeSubcategories=true&isActive=true
 */
export const fetchHeaderCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories`, {
      params: {
        includeSubcategories: true,
        isActive: true,
      },
      timeout: 5000,
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    return response.data || [];
  } catch (error) {
    console.warn('HeaderService: Failed to fetch categories from server, using fallback.', error.message);
    
    // Return structured default data as fallback if server is unreachable
    return [
      {
        _id: 'cat-1',
        name: 'Silk Sarees',
        isActive: true,
        subCategories: [
          { _id: 'sub-1', name: 'Kanjeevaram Silk', categoryId: 'cat-1', isActive: true },
          { _id: 'sub-2', name: 'Banarasi Silk', categoryId: 'cat-1', isActive: true },
          { _id: 'sub-3', name: 'Tussar Silk', categoryId: 'cat-1', isActive: true },
          { _id: 'sub-4', name: 'Mysore Silk', categoryId: 'cat-1', isActive: true },
        ],
      },
      {
        _id: 'cat-2',
        name: 'Cotton Sarees',
        isActive: true,
        subCategories: [
          { _id: 'sub-5', name: 'Chanderi Cotton', categoryId: 'cat-2', isActive: true },
          { _id: 'sub-6', name: 'Handloom Cotton', categoryId: 'cat-2', isActive: true },
          { _id: 'sub-7', name: 'Mulmul Cotton', categoryId: 'cat-2', isActive: true },
        ],
      },
      {
        _id: 'cat-3',
        name: 'Designer Sarees',
        isActive: true,
        subCategories: [
          { _id: 'sub-8', name: 'Organza Sarees', categoryId: 'cat-3', isActive: true },
          { _id: 'sub-9', name: 'Georgette Sarees', categoryId: 'cat-3', isActive: true },
          { _id: 'sub-10', name: 'Party Wear Sarees', categoryId: 'cat-3', isActive: true },
        ],
      },
      {
        _id: 'cat-4',
        name: 'Regional Sarees',
        isActive: true,
        subCategories: [
          { _id: 'sub-11', name: 'Paithani Sarees', categoryId: 'cat-4', isActive: true },
          { _id: 'sub-12', name: 'Bandhani / Bandhej', categoryId: 'cat-4', isActive: true },
          { _id: 'sub-13', name: 'Patola Sarees', categoryId: 'cat-4', isActive: true },
        ],
      },
    ];
  }
};

/**
 * Service to fetch all active subcategories individually if needed.
 * GET /api/subcategories?isActive=true
 */
export const fetchSubCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/subcategories`, {
      params: { isActive: true },
      timeout: 5000,
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data || [];
  } catch (error) {
    console.warn('HeaderService: Failed to fetch subcategories.', error.message);
    return [];
  }
};

const headerService = {
  fetchHeaderCategories,
  fetchSubCategories,
};

export default headerService;

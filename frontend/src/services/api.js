import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

function unwrapCollection(responseData) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (responseData && typeof responseData === 'object') {
    for (const key of ['data', 'shops', 'results', 'items', 'records']) {
      const value = responseData[key];
      if (Array.isArray(value)) {
        return value;
      }
      if (value && typeof value === 'object') {
        const nested = unwrapCollection(value);
        if (nested.length > 0) {
          return nested;
        }
      }
    }
  }

  return [];
}

function unwrapPagination(responseData) {
  if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
    return responseData.pagination || null;
  }

  return null;
}

function normalizeError(error) {
  if (error?.response) {
    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      `Request failed with status ${error.response.status}`;

    const normalized = new Error(message);
    normalized.status = error.response.status;
    normalized.data = error.response.data;
    return normalized;
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('Network request failed');
}

export const shopApi = {
  getStorePage: async ({ page = 1, limit = 200 } = {}) => {
    try {
      const response = await apiClient.get('/shops', {
        params: {
          page,
          limit,
          type: 'shop',
        },
      });

      return {
        items: unwrapCollection(response.data),
        pagination: unwrapPagination(response.data),
      };
    } catch (error) {
      throw normalizeError(error);
    }
  },

  getAllShops: async () => {
    try {
      const firstPage = await shopApi.getStorePage({ page: 1, limit: 200 });
      const pagination = firstPage.pagination;

      if (!pagination?.hasNextPage) {
        return firstPage.items;
      }

      const pageNumbers = Array.from(
        { length: Math.max(0, Number(pagination.totalPages || 1) - 1) },
        (_, index) => index + 2,
      );

      const remainingPages = await Promise.all(
        pageNumbers.map((page) => shopApi.getStorePage({ page, limit: 200 })),
      );

      return [firstPage.items, ...remainingPages.map((page) => page.items)].flat();
    } catch (error) {
      throw normalizeError(error);
    }
  },

  getShops: async (searchQuery = '') => {
    try {
      const response = await apiClient.get('/shops', {
        params: searchQuery ? { search: searchQuery } : undefined,
      });
      return unwrapCollection(response.data);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  getNearbyShops: async (lat, lng) => {
    try {
      const response = await apiClient.get('/shops/nearby', {
        params: { latitude: lat, longitude: lng },
      });
      return unwrapCollection(response.data);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  createShop: async (shopData) => {
    try {
      const response = await apiClient.post('/shops', shopData);
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  deleteShop: async (id) => {
    try {
      const response = await apiClient.delete(`/shops/${id}`);
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  },
};

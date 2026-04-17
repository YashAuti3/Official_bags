import { products, categories } from '../data/mock';

/**
 * Product service — abstracts data fetching.
 * Swap the implementations here when connecting to a real API.
 */

export const getAllProducts = () => {
  return Promise.resolve([...products]);
};

export const getProductById = (id) => {
  const product = products.find(p => p.id === parseInt(id));
  return Promise.resolve(product || null);
};

export const getProductsByCategory = (categoryName) => {
  if (!categoryName) return Promise.resolve([...products]);
  const filtered = products.filter(
    p => p.category.toLowerCase() === categoryName.toLowerCase()
  );
  return Promise.resolve(filtered);
};

export const getAllCategories = () => {
  return Promise.resolve([...categories]);
};

/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const productRepository = require('../repository/product');
const ServiceError = require('../core/serviceError');

const getAllProducts = async (pagina) => {
  const products = await productRepository.getAllProducts(pagina);
  if (!products) {
    throw ServiceError.notFound('Geen producten gevonden');
  }
  return products;
};

const getProductByOrder = async (orderId) => {
  const products = await productRepository.getProductByOrder(orderId);
  if (!products) {
    throw ServiceError.notFound(`Product met ID ${orderId} niet gevonden`);
  }
  return products;
};

const getProductById = async (productId) => {
  const product = await productRepository.getProductById(productId);
  if (!product) {
    throw ServiceError.notFound(`Product met ID ${productId} niet gevonden`);
  }
  return product;
};

module.exports = { getProductByOrder, getAllProducts, getProductById};
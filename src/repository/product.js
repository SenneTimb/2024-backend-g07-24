const { getKnex, tables } = require('../data');

const makeProduct = ({ AANTAL, EENHEIDSPRIJS, bestellingId, productId, NAAM, aantalInStock, bedrijfsNaam }) => ({
  id: productId,
  aantal: AANTAL,
  eenheidsprijs: EENHEIDSPRIJS,
  bestellingId: bestellingId, 
  naam: NAAM,
  aantalInStock: aantalInStock,
  bedrijfsNaam,
});

const ITEMS_PER_PAGE = 5;

const getAllProducts = async (pagina) => {

  const offset = (pagina - 1) * ITEMS_PER_PAGE;

  try {

    const count = await getKnex()(tables.product)
      .count('PRODUCTID as total');
    const products = await getKnex()(tables.product)
      .join(
        tables.bedrijf + ' as leverancierBedrijf',
        `${tables.product}.bedrijfId`,
        '=',
        'leverancierBedrijf.BEDRIJFID',
      )
      .select(
        'PRODUCTID as productId', 
        'AANTAL as aantal', 
        'EENHEIDSPRIJS as eenheidsprijs', 
        'INSTOCK as aantalInStock', 
        `${tables.product}.NAAM as naam`,
        'leverancierBedrijf.NAAM as bedrijfsNaam',
      )
      .limit(ITEMS_PER_PAGE)
      .offset(offset);

    const productsMapped = products.map((product) => ({
      id: product.productId,
      aantal: product.aantal,
      eenheidsprijs: product.eenheidsprijs,
      naam: product.naam,
      aantalInStock: product.aantalInStock === 1, 
      bedrijfsNaam: product.bedrijfsNaam,
    }));


    return {products: productsMapped, total: count[0].total};
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error; 
  }
};

const getProductByOrder = async (orderId) => {
  const products = await getKnex()(tables.bestelling_product)
    .join(tables.product, `${tables.bestelling_product}.productId`, '=', `${tables.product}.PRODUCTID`)
    .join(
      tables.bedrijf + ' as leverancierBedrijf',
      `${tables.product}.bedrijfId`,
      '=',
      'leverancierBedrijf.BEDRIJFID',
    )
    .select(
      `${tables.bestelling_product}.AANTAL`,
      `${tables.bestelling_product}.EENHEIDSPRIJS`,
      `${tables.bestelling_product}.bestellingId`,
      `${tables.bestelling_product}.productId`,
      `${tables.product}.NAAM`,
      `${tables.product}.AANTAL as aantalInStock`,
      'leverancierBedrijf.NAAM as bedrijfsNaam',
    )
    .where(`${tables.bestelling_product}.bestellingId`, '=', orderId);  // Filter by orderId

  return products.map(makeProduct);
};

const getProductById = async (productId) => {
  const product = await getKnex()(tables.product)
    .join(
      tables.bedrijf + ' as leverancierBedrijf',
      `${tables.product}.bedrijfId`,
      '=',
      'leverancierBedrijf.BEDRIJFID',
    )
    .select(
      'PRODUCTID as productId',
      `${tables.product}.NAAM`,
      'AANTAL as aantalInStock',
      'EENHEIDSPRIJS as eenheidsprijs',
      'leverancierBedrijf.NAAM as bedrijfsNaam',
    )
    .where('PRODUCTID', '=', productId)
    .first();

  return product ? {
    id: product.productId,
    naam: product.NAAM,
    aantalInStock: product.aantalInStock,
    eenheidsprijs: product.eenheidsprijs,
    bedrijfsNaam: product.bedrijfsNaam,
  } : null;
};

module.exports = { getProductByOrder, getAllProducts, getProductById};

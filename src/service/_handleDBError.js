const ServiceError = require('../core/serviceError');

const handleDBError = (error) => {
  const {code = '', sqlMessage } = error;

  if(code === 'ER_DUP_ENTRY') {
    switch(true) {
      default:
        return ServiceError.validationFailed('This item already exists');
    }
  }

  if (code.startsWith('ER_NO_REFERENCED_ROW')) {
    // TODO: errors opvangen voor references met bestellingen en bedrijf bijvoorbeeld
    switch (true) {
      case sqlMessage.includes('fk_notificatie_order'):
        return ServiceError.notFound('This order does not exist');
      default:
        return ServiceError.notFound('This item does not exist');
    }
  }
};

module.exports = handleDBError;
const crypto = require('crypto');

/**
 * Generates an uppercase, human-readable unique reference code.
 * Example: PRO-PT-202610-8421, PRO-TR-202610-1943, PRO-CT-202610-7210
 *
 * @param {string} prefix - e.g. 'PT' for Personal Training, 'TR' for Trial, 'CT' for Contact
 * @returns {string} Unique reference code
 */
const generateReference = (prefix = 'PT') => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // 4 random alphanumeric characters for collision resistance
  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();

  return `PRO-${prefix.toUpperCase()}-${year}${month}${day}-${randomSuffix}`;
};

module.exports = { generateReference };

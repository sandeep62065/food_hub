const crypto = require('crypto');

const generateReferralCode = (name) => {
  // Extract first 3 alphanumeric characters of the name, uppercase
  const prefix = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase().padEnd(3, 'X');
  // Generate 4 random alphanumeric characters
  const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}${suffix}`;
};

module.exports = { generateReferralCode };

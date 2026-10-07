/**
 * Hospital Management System (HMS)
 * Centralized Sri Lankan Rupee (LKR) Currency Formatter
 *
 * Consistent formatting: Rs. 1,500.00
 */

export function formatLKR(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return 'Rs. 0.00';
  }
  const num = Number(amount);
  return `Rs. ${num.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatLKRCompact(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return 'Rs. 0';
  }
  const num = Number(amount);
  return `Rs. ${num.toLocaleString('en-LK', {
    maximumFractionDigits: 0,
  })}`;
}

export default formatLKR;

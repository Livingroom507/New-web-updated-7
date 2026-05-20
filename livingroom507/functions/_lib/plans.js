export const PLAN_DETAILS = {
  BASIC: { name: 'BASIC', monthlyCost: 19.5, purchaseUnit: 44.41, purchaseEarning: 7.21 },
  STANDARD: { name: 'STANDARD', monthlyCost: 29.5, purchaseUnit: 67.18, purchaseEarning: 10.91 },
  PREMIUM: { name: 'PREMIUM', monthlyCost: 39.5, purchaseUnit: 89.95, purchaseEarning: 14.61 },
  'STANDARD-BRAND': { name: 'STANDARD-BRAND', monthlyCost: 70.5, purchaseUnit: 160.55, purchaseEarning: 26.09 },
  'STANDARD+': { name: 'STANDARD+', monthlyCost: 106.65, purchaseUnit: 242.87, purchaseEarning: 39.47 },
  'PREMIUM+': { name: 'PREMIUM+', monthlyCost: 142.81, purchaseUnit: 325.22, purchaseEarning: 52.85 },
  CONTROLLER: { name: 'CONTROLLER', monthlyCost: 197.94, purchaseUnit: 450.77, purchaseEarning: 73.25 },
  ENTERPRISE: { name: 'ENTERPRISE', monthlyCost: 246.12, purchaseUnit: 558.89, purchaseEarning: 90.76 },
  BUSINESS: { name: 'BUSINESS', monthlyCost: 329.56, purchaseUnit: 748.1, purchaseEarning: 121.49 },
};

export function getPlanByName(planName) {
  if (!planName) {
    return null;
  }

  return PLAN_DETAILS[String(planName).trim().toUpperCase()] || null;
}

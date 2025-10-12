import { Request } from "express";

// Check if the cart is empty
const checkEmptyCart = (cart: Record<string, any> | null): boolean => {
  if (!cart) return true;
  return Object.keys(cart).length === 0;
};

// Count total quantity in cart
const countCartQty = (cart: Record<string, { quantity: number }> | null): number => {
  if (!cart) return 0;
  return Object.values(cart).reduce((sum, item) => sum + (item.quantity || 0), 0);
};

// Check if shipping country is Singapore
const checkShipmentCountrySingapore = (country: string | undefined): boolean => {
  return country?.toLowerCase() === "singapore";
};

// Check if promo code exists
const checkPromo = (promo: string | undefined | null): boolean => {
  return !!promo && promo.trim().length > 0;
};

// Convert discount number to percentage string
const convertDiscount = (discount: number | string): string => {
  const num = typeof discount === "string" ? parseFloat(discount) : discount;
  return `${num * 100}%`;
};

// Display readable coupon type
const displayCouponType = (type: string): string => {
  switch (type) {
    case "public": return "Public Coupon";
    case "private": return "Private Coupon";
    default: return "Unknown";
  }
};

// Check if product price is discounted
const checkProductPriceDiscounted = (price: number, discountedPrice: number): boolean => {
  return discountedPrice < price;
};

export default {
  checkEmptyCart,
  countCartQty,
  checkShipmentCountrySingapore,
  checkPromo,
  convertDiscount,
  displayCouponType,
  checkProductPriceDiscounted,
};

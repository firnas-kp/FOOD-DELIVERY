/** Slug for Tomato / platform menu items (no restaurantId). */
export const PLATFORM_RESTAURANT_SLUG = "tomato-kitchen";

export const restaurantKeyFromFood = (food) =>
    food?.restaurantId ? String(food.restaurantId) : "__platform__";

export const slugFromRestaurantKey = (key) =>
    key === "__platform__" ? PLATFORM_RESTAURANT_SLUG : key;

export const restaurantKeyFromSlug = (slug) =>
    !slug || slug === PLATFORM_RESTAURANT_SLUG ? "__platform__" : slug;

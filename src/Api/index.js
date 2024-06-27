import { Method } from "./apiMethod";

// Products
export const getProducts = (userInfo) => Method.GET("/productWeb/list");

// Configuration
export const roomSize = (data) => Method.GET("/roomSizeDetail");
export const placeOrder = (data) => Method.POST("/pdf", data)

// Cart
export const getCart = () => Method.POST("/cart");
export const deleteCartItem = (id) => Method.GET(`/removeFromCart/${id}`);
export const addCartItem = (data) => Method.POST("/addItem", data)


import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../css/dealer/DealerShoppingCart.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const SERVER_URL = API_BASE_URL || "https://oneplussparkpaintsserver.onrender.com";

const DealerShoppingCart = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_BASE_URL}/api/dealer/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCart(response.data.cart);
    } catch (error) {
      console.error("Fetch shopping cart error:", error);
      setError(
        error.response?.data?.message || "Failed to load shopping cart"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;

    try {
      setUpdatingId(productId);

      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_BASE_URL}/api/dealer/cart/${productId}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCart(response.data.cart);
    } catch (error) {
      console.error("Update cart quantity error:", error);
      setError(
        error.response?.data?.message || "Failed to update quantity"
      );
    } finally {
      setUpdatingId("");
    }
  };

  const removeItem = async (productId) => {
    try {
      setUpdatingId(productId);

      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `${API_BASE_URL}/api/dealer/cart/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCart(response.data.cart);
    } catch (error) {
      console.error("Remove cart item error:", error);
      setError(
        error.response?.data?.message || "Failed to remove product"
      );
    } finally {
      setUpdatingId("");
    }
  };

  const getItemPrice = (product) => {
    return product?.discountPrice ?? product?.mrp ?? 0;
  };

  const getCartTotal = () => {
    return (
      cart?.items?.reduce((total, item) => {
        const price = getItemPrice(item.product);
        return total + price * item.quantity;
      }, 0) || 0
    );
  };

  const handleProceedToOrder = async () => {
    try {
      setPlacingOrder(true);
      setError("");

      const token = localStorage.getItem("token");

      await axios.post(
        `${API_BASE_URL}/api/dealer/orders`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/dealer/order-history");
    } catch (error) {
      console.error("Place order error:", error);

      setError(
        error.response?.data?.message || "Failed to place order"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="dealer-shopping-cart-page">
        <div className="dealer-shopping-cart-message">
          Loading shopping cart...
        </div>
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="dealer-shopping-cart-page">
        <button
          type="button"
          className="dealer-shopping-cart-back-btn"
          onClick={() => navigate("/dealer/product-ordering")}
        >
          <ArrowLeft size={18} />
          Back to Products
        </button>

        <div className="dealer-shopping-cart-message dealer-shopping-cart-error">
          {error}
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="dealer-shopping-cart-page">
      <div className="dealer-shopping-cart-header">
        <div>
          <h1>Shopping Cart</h1>
          <p>Review your selected products</p>
        </div>

        <button
          type="button"
          className="dealer-shopping-cart-back-btn"
          onClick={() => navigate("/dealer/product-ordering")}
        >
          <ArrowLeft size={18} />
          Continue Shopping
        </button>
      </div>

      {error && (
        <div className="dealer-shopping-cart-inline-error">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="dealer-shopping-cart-empty">
          <ShoppingCart size={45} />
          <h2>Your cart is empty</h2>
          <p>Add products from Product Ordering.</p>

          <button
            type="button"
            onClick={() => navigate("/dealer/product-ordering")}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="dealer-shopping-cart-layout">
          <div className="dealer-shopping-cart-items">
            {items.map((item) => {
              const product = item.product;
              const price = getItemPrice(product);

              return (
                <div
                  className="dealer-shopping-cart-item"
                  key={product._id}
                >
                  <div className="dealer-shopping-cart-item-image">
                    {product.image ? (
                      <img
                        src={`${SERVER_URL}${product.image}`}
                        alt={product.productName}
                      />
                    ) : (
                      <Package size={40} />
                    )}
                  </div>

                  <div className="dealer-shopping-cart-item-details">
                    <span>{product.category}</span>
                    <h3>{product.productName}</h3>
                    <p>SKU: {product.sku}</p>
                    <p>Packing: {product.packingSize}</p>

                    <strong>₹{price}</strong>
                  </div>

                  <div className="dealer-shopping-cart-item-actions">
                    <div className="dealer-shopping-cart-quantity">
                      <button
                        type="button"
                        disabled={
                          updatingId === product._id || item.quantity <= 1
                        }
                        onClick={() =>
                          updateQuantity(
                            product._id,
                            item.quantity - 1
                          )
                        }
                      >
                        <Minus size={15} />
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        disabled={
                          updatingId === product._id ||
                          item.quantity >= product.stockQuantity
                        }
                        onClick={() =>
                          updateQuantity(
                            product._id,
                            item.quantity + 1
                          )
                        }
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="dealer-shopping-cart-remove-btn"
                      disabled={updatingId === product._id}
                      onClick={() => removeItem(product._id)}
                    >
                      <Trash2 size={17} />
                      Remove
                    </button>
                  </div>

                  <div className="dealer-shopping-cart-item-total">
                    ₹{price * item.quantity}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="dealer-shopping-cart-summary">
            <h2>Order Summary</h2>

            <div className="dealer-shopping-cart-summary-row">
              <span>Total Items</span>
              <strong>
                {items.reduce((total, item) => total + item.quantity, 0)}
              </strong>
            </div>

            <div className="dealer-shopping-cart-summary-row">
              <span>Subtotal</span>
              <strong>₹{getCartTotal()}</strong>
            </div>

            <div className="dealer-shopping-cart-summary-total">
              <span>Total</span>
              <strong>₹{getCartTotal()}</strong>
            </div>

            <button
              type="button"
              className="dealer-shopping-cart-order-btn"
              onClick={handleProceedToOrder}
              disabled={placingOrder}
            >
              {placingOrder ? "Placing Order..." : "Proceed to Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerShoppingCart;
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";

export interface CartItem {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  onCheckout: () => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}: CartSidebarProps) {
  const subtotal = items.reduce((acc, item) => {
    const priceStr = item.price.replace(/[¥,]/g, "");
    return acc + parseInt(priceStr) * item.quantity;
  }, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-calm-bg z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 md:p-8 flex justify-between items-center border-b border-calm-base/10">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-calm-accent-brass" />
                <h2 className="text-xl font-serif tracking-tight">Shopping Cart</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-calm-base/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag className="w-12 h-12 text-calm-base/20 mb-4" />
                  <p className="text-calm-text/50">Your cart is empty.</p>
                  <button
                    onClick={onClose}
                    className="mt-6 text-[10px] uppercase tracking-[0.2em] text-calm-accent-brass hover:text-calm-accent-oak transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex gap-4"
                    >
                      <div className="w-20 h-20 bg-white rounded-lg overflow-hidden shrink-0 shadow-sm border border-calm-base/5">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-sm font-medium truncate pr-2">{item.name}</h3>
                          <p className="text-sm font-serif">{item.price}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-calm-base/20 rounded-full py-1 px-3 gap-4">
                            <button
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="text-calm-text/40 hover:text-calm-accent-brass transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="text-calm-text/40 hover:text-calm-accent-brass transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => onRemove(item.id)}
                            className="text-calm-text/30 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 md:p-8 bg-white border-t border-calm-base/10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-calm-text/50 text-sm">Subtotal</span>
                  <span className="text-xl font-serif">¥{subtotal.toLocaleString()}</span>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full bg-calm-text text-white py-4 flex items-center justify-center gap-3 group hover:bg-calm-accent-oak transition-all duration-500 rounded-sm"
                >
                  <span className="text-[11px] uppercase tracking-[0.3em]">Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-center text-[10px] text-calm-text/30 mt-4 uppercase tracking-widest">
                  Shipping & taxes calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

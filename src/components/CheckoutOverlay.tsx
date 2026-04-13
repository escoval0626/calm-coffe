import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CreditCard, Truck, CheckCircle, ArrowRight, Loader2 } from "lucide-react";

interface CheckoutOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subtotal: number;
}

export default function CheckoutOverlay({
  isOpen,
  onClose,
  onSuccess,
  subtotal,
}: CheckoutOverlayProps) {
  const [step, setStep] = useState<"info" | "payment" | "processing" | "success">("info");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postal: "",
  });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "info") setStep("payment");
  };

  const handleMockPayment = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("success");
    }, 2500);
  };

  const handleFinalClose = () => {
    onSuccess();
    onClose();
    // Reset for next time after a short delay
    setTimeout(() => setStep("info"), 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={step === "processing" ? undefined : onClose}
            className="absolute inset-0 bg-calm-text/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-calm-bg shadow-2xl rounded-lg overflow-hidden flex flex-col md:flex-row min-h-[500px]"
          >
            {/* Left side: Order Summary (Visible on Desktop) */}
            <div className="hidden md:flex md:w-1/3 bg-calm-base/10 p-8 flex-col justify-between">
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-calm-text/40 mb-8">
                  Order Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-calm-text/50">Subtotal</span>
                    <span>¥{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-calm-text/50">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="pt-4 border-t border-calm-text/5 flex justify-between font-serif text-lg">
                    <span>Total</span>
                    <span>¥{subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-[9px] text-calm-text/30 leading-relaxed uppercase tracking-widest">
                This is a mock checkout for demonstration purposes only.
              </div>
            </div>

            {/* Right side: Content */}
            <div className="flex-1 p-8 md:p-12 relative">
              {step !== "processing" && step !== "success" && (
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 text-calm-text/30 hover:text-calm-text transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <AnimatePresence mode="wait">
                {step === "info" && (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <Truck className="w-5 h-5 text-calm-accent-brass" />
                      <h2 className="text-2xl font-serif">Shipping Information</h2>
                    </div>
                    <form onSubmit={handleNext} className="space-y-6 flex-1">
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-widest text-calm-text/40">
                            Full Name
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="John Doe"
                            className="w-full bg-white border border-calm-base/20 px-4 py-3 text-sm focus:outline-none focus:border-calm-accent-brass transition-colors"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-widest text-calm-text/40">
                            Email Address
                          </label>
                          <input
                            required
                            type="email"
                            placeholder="hello@example.com"
                            className="w-full bg-white border border-calm-base/20 px-4 py-3 text-sm focus:outline-none focus:border-calm-accent-brass transition-colors"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-widest text-calm-text/40">
                            Address
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="Nagareyama Otakanomori 1-2-3"
                            className="w-full bg-white border border-calm-base/20 px-4 py-3 text-sm focus:outline-none focus:border-calm-accent-brass transition-colors"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full mt-8 bg-calm-text text-white py-4 flex items-center justify-center gap-3 group hover:bg-calm-accent-oak transition-all duration-500 rounded-sm"
                      >
                        <span className="text-[11px] uppercase tracking-[0.3em]">Payment Method</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </form>
                  </motion.div>
                )}

                {step === "payment" && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <CreditCard className="w-5 h-5 text-calm-accent-brass" />
                      <h2 className="text-2xl font-serif">Payment Method</h2>
                    </div>
                    <div className="space-y-8 flex-1">
                      <div className="p-6 bg-white border border-calm-accent-brass/20 rounded-md">
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-sm font-medium">Credit Card</span>
                          <div className="flex gap-2">
                            <div className="w-8 h-5 bg-calm-base/20 rounded" />
                            <div className="w-8 h-5 bg-calm-base/20 rounded" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="h-10 border-b border-calm-base/10 text-sm flex items-center text-calm-text/40">
                            •••• •••• •••• 4242
                          </div>
                          <div className="flex gap-4">
                            <div className="flex-1 h-10 border-b border-calm-base/10 text-sm flex items-center text-calm-text/40">
                              MM / YY
                            </div>
                            <div className="w-20 h-10 border-b border-calm-base/10 text-sm flex items-center text-calm-text/40">
                              CVC
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[11px] text-calm-text/40 leading-relaxed">
                          By clicking "Complete Order", you agree to our Terms of Service. 
                          This is a simulation—no real credit card is required.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleMockPayment}
                      className="w-full mt-8 bg-calm-accent-brass text-white py-4 flex items-center justify-center gap-3 group hover:bg-calm-accent-oak transition-all duration-500 rounded-sm"
                    >
                      <span className="text-[11px] uppercase tracking-[0.3em]">Complete Order</span>
                    </button>
                    <button
                      onClick={() => setStep("info")}
                      className="mt-4 text-[10px] text-calm-text/40 uppercase tracking-widest hover:text-calm-text transition-colors text-center"
                    >
                      Go Back
                    </button>
                  </motion.div>
                )}

                {step === "processing" && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center py-20"
                  >
                    <Loader2 className="w-12 h-12 text-calm-accent-brass animate-spin mb-6" />
                    <h2 className="text-2xl font-serif mb-2">Processing Order</h2>
                    <p className="text-calm-text/50 text-sm">Please wait a moment...</p>
                  </motion.div>
                )}

                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center py-10"
                  >
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-8">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-serif mb-4 text-balance">Thank you for your order!</h2>
                    <p className="text-calm-text/60 mb-8 max-w-sm">
                      We've received your mock order. In a real shop, a confirmation email would be on its way.
                    </p>
                    <div className="bg-white p-6 rounded-lg border border-calm-base/10 w-full mb-8">
                      <div className="flex justify-between text-xs uppercase tracking-widest text-calm-text/40 mb-2">
                        <span>Order Number</span>
                        <span>Date</span>
                      </div>
                      <div className="flex justify-between font-medium text-sm">
                        <span>#CALM-{(Math.random() * 10000).toFixed(0)}</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleFinalClose}
                      className="w-full bg-calm-text text-white py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-calm-accent-oak transition-all duration-500 rounded-sm"
                    >
                      Return to Shop
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

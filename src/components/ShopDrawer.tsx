import { motion } from "motion/react";
import { X, ShoppingBag, ArrowRight } from "lucide-react";

interface Product {
  id: number;
  name: string;
  desc: string;
  price: string;
  image: string;
  story: string;
}

interface ShopDrawerProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: () => void;
}

export default function ShopDrawer({ product, onClose, onAddToCart }: ShopDrawerProps) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/20 backdrop-blur-[3px]"
      />

      {/* Drawer Content */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.8 }}
        className="relative w-full max-w-xl bg-calm-bg h-full shadow-2xl overflow-y-auto"
      >
        {/* Close button */}
        <motion.button
          onClick={onClose}
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="absolute top-8 right-8 p-3 hover:bg-calm-base/10 rounded-full transition-all duration-300 z-10 group"
        >
          <X className="w-5 h-5 text-calm-text group-hover:rotate-90 transition-transform duration-300" />
        </motion.button>

        <div className="p-8 md:p-16">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="aspect-[4/5] overflow-hidden mb-12 shadow-calm relative group"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </motion.div>

          {/* Product Info */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <span className="text-calm-accent-brass uppercase tracking-[0.3em] text-[10px] mb-3 block">
                Product Detail
              </span>
              <h2 className="text-3xl mb-3">{product.name}</h2>
              <p className="text-calm-accent-oak font-medium text-xl">{product.price}</p>
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
              className="h-[1px] bg-calm-base/30 origin-left"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <p className="text-calm-text/70 leading-[1.9] text-sm">
                {product.story}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="pt-6"
            >
              <button
                onClick={onAddToCart}
                className="group w-full py-5 bg-calm-text text-white hover:bg-calm-accent-oak transition-all duration-700 flex items-center justify-center gap-3 tracking-[0.2em] uppercase text-xs relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-calm-accent-brass transform translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)]" />
                <ShoppingBag className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Add to Cart</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <p className="text-center text-[10px] text-calm-text/30 mt-4 uppercase tracking-[0.2em]">
                Secure mock payment available
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

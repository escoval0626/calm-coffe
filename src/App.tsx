import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "motion/react";
import { Instagram, MapPin, Clock, Mail, Menu as MenuIcon, X, ArrowUpRight } from "lucide-react";
import Hero from "./components/Hero";
import ShopDrawer from "./components/ShopDrawer";
import ParallaxSection from "./components/ParallaxSection";
import RevealImage from "./components/RevealImage";
import CartSidebar, { CartItem } from "./components/CartSidebar";
import CheckoutOverlay from "./components/CheckoutOverlay";
import { ShoppingBag } from "lucide-react";

import dripImg from "@/assets/images/menu-drip.png";
import latteImg from "@/assets/images/menu-latte.png";
import coldbrewImg from "@/assets/images/menu-coldbrew.png";
import sconeImg from "@/assets/images/menu-scone.png";
import lemoncakeImg from "@/assets/images/menu-lemoncake.png";
import tartImg from "@/assets/images/menu-tart.png";
import blendImg from "@/assets/images/shop-blend.png";
import mugImg from "@/assets/images/shop-mug.png";
import apronImg from "@/assets/images/shop-apron.png";
import conceptImg from "@/assets/images/concept-new.png";

const menuItems = [
  { id: 1, name: "Single Origin Drip", desc: "季節ごとに厳選された豆の個性を引き出す一杯。", price: "¥650", image: dripImg },
  { id: 2, name: "Oat Milk Latte", desc: "クリーミーなオーツミルクとエスプレッソの調和。", price: "¥700", image: latteImg },
  { id: 3, name: "Cold Brew", desc: "12時間かけてゆっくりと抽出した、澄んだ味わい。", price: "¥600", image: coldbrewImg },
  { id: 4, name: "Homemade Scone", desc: "外はサクッと、中はしっとり。季節のジャムを添えて。", price: "¥450", image: sconeImg },
  { id: 5, name: "Lemon Cake", desc: "瀬戸内レモンの爽やかな香りとアイシングの甘み。", price: "¥550", image: lemoncakeImg },
  { id: 6, name: "Seasonal Tart", desc: "旬のフルーツを贅沢に使った、パティシエ特製タルト。", price: "¥750", image: tartImg },
];

const shopItems = [
  {
    id: 1,
    name: "Calm Blend (200g)",
    desc: "深呼吸したくなるような、穏やかな苦味と甘み。",
    price: "¥1,800",
    image: blendImg,
    story: "私たちのシグネチャーブレンド。エチオピアの華やかさとブラジルのコクを絶妙なバランスで配合しました。朝の最初の一杯にふさわしい、透明感のある味わいです。"
  },
  {
    id: 2,
    name: "Original Brass Mug",
    desc: "使い込むほどに味わいが増す、真鍮製のマグ。",
    price: "¥4,200",
    image: mugImg,
    story: "職人が一つひとつ手作業で仕上げた真鍮製のマグカップ。熱伝導率が高く、冷たい飲み物をより美味しく感じさせます。経年変化を楽しみながら、長く愛用していただける逸品です。"
  },
  {
    id: 3,
    name: "Linen Apron",
    desc: "上質なリネンを使用した、軽やかなエプロン。",
    price: "¥8,800",
    image: apronImg,
    story: "バリスタも愛用する、機能性と美しさを兼ね備えたリネンエプロン。洗うたびに柔らかく肌に馴染みます。キッチンに立つ時間が少しだけ特別になる、そんな一枚です。"
  },
];

// ===== Section Heading Component =====
function SectionHeading({
  label,
  title,
  align = "left",
}: {
  label: string;
  title: string;
  align?: "left" | "center";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className={`mb-20 md:mb-24 ${align === "center" ? "text-center" : ""}`}>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-calm-accent-brass uppercase tracking-[0.4em] text-[10px] mb-6 block"
      >
        {label}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
        className="text-4xl md:text-5xl"
      >
        {title}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ delay: 0.5, duration: 1, ease: [0.77, 0, 0.175, 1] }}
        className={`w-16 h-[1px] bg-calm-accent-brass mt-6 ${align === "center" ? "mx-auto" : ""}`}
        style={{ transformOrigin: align === "center" ? "center" : "left" }}
      />
    </div>
  );
}

// ===== Menu Card with 3D tilt =====
function MenuCard({
  item,
  index,
}: {
  item: (typeof menuItems)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 1, ease: [0.215, 0.61, 0.355, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group cursor-pointer card-3d"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.3s ease-out",
      }}
    >
      <div className="aspect-[4/5] overflow-hidden mb-6 shadow-calm group-hover:shadow-calm-elevated transition-all duration-700 relative">
        <RevealImage
          src={item.image}
          alt={item.name}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <h3 className="text-lg mb-2 group-hover:text-calm-accent-oak transition-colors duration-500">
        {item.name}
      </h3>
      <p className="text-[13px] text-calm-text/50 mb-3 leading-relaxed">{item.desc}</p>
      <p className="text-calm-accent-oak font-medium tracking-wide">{item.price}</p>
    </motion.div>
  );
}

// ===== Shop Item with reveal =====
function ShopItem({
  item,
  index,
  onClick,
}: {
  item: (typeof shopItems)[0];
  index: number;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2, ease: [0.215, 0.61, 0.355, 1] }}
      onClick={onClick}
      className="flex flex-col md:flex-row gap-12 items-center group cursor-pointer pb-24 last:pb-0 relative"
    >
      <div className="w-full md:w-2/5 aspect-square overflow-hidden shadow-calm group-hover:shadow-calm-elevated transition-all duration-700 relative">
        <RevealImage
          src={item.image}
          alt={item.name}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-calm-accent-brass/0 group-hover:bg-calm-accent-brass/10 transition-colors duration-700" />
      </div>

      <div className="flex-1">
        <span className="text-calm-base text-[10px] uppercase tracking-[0.4em] mb-4 block">
          No.{String(item.id).padStart(2, "0")}
        </span>
        <h3 className="text-3xl md:text-4xl mb-6 group-hover:text-calm-accent-oak transition-colors duration-500 leading-tight">
          {item.name}
        </h3>
        <p className="text-calm-text/60 mb-10 leading-relaxed text-lg">{item.desc}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl text-calm-accent-oak font-medium font-serif">{item.price}</span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-calm-accent-brass flex items-center gap-2 group-hover:gap-4 transition-all duration-500">
            View Details
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ===== Instagram Photo Grid =====
function InstaGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="grid grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{
            delay: i * 0.1,
            duration: 0.6,
            ease: [0.215, 0.61, 0.355, 1],
          }}
          className="aspect-square bg-white/5 overflow-hidden group relative"
        >
          <img
            src={`https://picsum.photos/seed/coffee${i}/400/400`}
            alt="Instagram"
            className="w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Instagram className="w-6 h-6 text-white drop-shadow-lg" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ===== Main App =====
export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const addToCart = (product: any) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeFromCart = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const cartSubtotal = cartItems.reduce((acc, item) => {
    const priceStr = item.price.replace(/[¥,]/g, "");
    return acc + parseInt(priceStr) * item.quantity;
  }, 0);

  useEffect(() => {
    // Force scroll to top on refresh
    window.scrollTo(0, 0);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Scroll progress
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((window.scrollY / totalHeight) * 100);

      // Active section detection
      const sections = ["concept", "menu", "shop", "access"];
      for (const section of sections.reverse()) {
        const el = document.getElementById(section);
        if (el && window.scrollY >= el.offsetTop - 200) {
          setActiveSection(section);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = ["Concept", "Menu", "Shop", "Access"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.5, ease: "easeOut" }}
      className="relative min-h-screen grain-overlay"
    >
      {/* Scroll Progress Bar */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-700 px-8 py-6 md:px-16 ${
          isScrolled ? "bg-calm-bg/85 backdrop-blur-lg py-4 shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.a
            href="#"
            whileHover={{ scale: 1.02 }}
            className={`text-xl font-serif tracking-[0.3em] uppercase transition-colors duration-500 ${
              isScrolled ? "text-calm-text" : "text-white"
            }`}
          >
            Calm Coffee
          </motion.a>

          <div className="hidden lg:flex gap-12 text-[10px] uppercase tracking-[0.3em] font-medium">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`relative transition-colors duration-500 hover:text-calm-accent-brass py-1 ${
                  isScrolled ? "text-calm-text" : "text-white"
                }`}
              >
                {item}
                {activeSection === item.toLowerCase() && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-[1px] bg-calm-accent-brass"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative p-2 transition-colors duration-500 ${
                isScrolled ? "text-calm-text" : "text-white"
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItems.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-calm-accent-brass text-white text-[8px] flex items-center justify-center rounded-full"
                >
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </motion.span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`lg:hidden p-2 transition-colors duration-500 ${
                isScrolled ? "text-calm-text" : "text-white"
              }`}
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-calm-bg flex flex-col"
          >
            <div className="p-8 flex justify-between items-center">
              <div className="text-xl font-serif tracking-[0.3em] uppercase">Calm Coffee</div>
              <motion.button
                onClick={() => setIsMobileMenuOpen(false)}
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.3 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="flex-1 flex flex-col justify-center px-8">
              <div className="flex flex-col gap-1">
                {navItems.map((item, i) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                    className="text-4xl md:text-5xl font-serif py-4 hover:text-calm-accent-brass transition-colors duration-300 group flex items-center gap-6"
                  >
                    <span className="text-calm-base text-[10px] font-sans tracking-widest">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item}
                    <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.a>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="p-8 text-center text-[10px] text-calm-text/40 uppercase tracking-[0.3em]"
            >
              Nagareyama Otakanomori, Chiba
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <Hero />

      {/* Spacing replaced Marquee */}
      <div className="py-20" />

      {/* ===== Concept Section ===== */}
      <section id="concept" className="py-32 md:py-40 px-8 md:px-24 lg:px-32 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div>
            <SectionHeading label="Concept" title="" />
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-2xl md:text-3xl lg:text-4xl mb-8 leading-[1.4] -mt-16"
            >
              いつもの毎日に、<br />深呼吸できる余白を。
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-calm-text/60 leading-[2] mb-8 text-[15px]"
            >
              流山おおたかの森の静かな一角に佇む Calm Coffee。<br />
              コンクリートの静謐さと、木の温もりが調和する空間で、<br />
              丁寧に淹れられた一杯のコーヒーが、<br />
              あなたの心に小さな余白を作ります。
            </motion.p>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7, duration: 1, ease: [0.77, 0, 0.175, 1] }}
              className="w-24 h-[1px] bg-calm-accent-brass origin-left"
            />
          </div>

          <ParallaxSection speed={0.15}>
            <div className="relative">
              <RevealImage
                src={conceptImg}
                alt="Calm Coffee コンセプト"
                className="aspect-[3/4] md:aspect-square shadow-calm-hover"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute -bottom-8 -left-8 w-40 h-40 border border-calm-accent-brass/20 -z-10"
              />
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute -top-4 -right-4 w-20 h-20 bg-calm-accent-brass/10 -z-10"
              />
            </div>
          </ParallaxSection>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* ===== Menu Section ===== */}
      <section id="menu" className="py-32 md:py-40 bg-calm-base/8">
        <div className="px-8 md:px-24 lg:px-32 max-w-7xl mx-auto">
          <SectionHeading label="Cafe Menu" title="Eat-in Menu" align="center" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
            {menuItems.map((item, i) => (
              <MenuCard key={item.id} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="py-20" />

      {/* ===== Shop Section ===== */}
      <section id="shop" className="py-32 md:py-40 px-8 md:px-24 lg:px-32 max-w-7xl mx-auto">
        <SectionHeading label="Online Shop" title="Selected Items" />

        <div className="space-y-16">
          {shopItems.map((item, i) => (
            <ShopItem
              key={item.id}
              item={item}
              index={i}
              onClick={() => setSelectedProduct(item)}
            />
          ))}
        </div>
      </section>

      {/* ===== Access Section ===== */}
      <section id="access" className="py-32 md:py-40 bg-calm-text text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-calm-accent-brass/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="px-8 md:px-24 lg:px-32 max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-calm-accent-brass uppercase tracking-[0.4em] text-[10px] mb-6 block"
              >
                Access & Info
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-4xl md:text-5xl mb-16"
              >
                Visit Us
              </motion.h2>

              <div className="space-y-10">
                {[
                  {
                    icon: MapPin,
                    label: "Address",
                    content: "〒270-0128 千葉県流山市おおたかの森西 1-2-3\nNagareyama Otakanomori, Chiba",
                  },
                  {
                    icon: Clock,
                    label: "Hours",
                    content: "Open: 10:00 - 19:00\nClosed: Tuesday, Wednesday",
                  },
                  {
                    icon: Mail,
                    label: "Contact",
                    content: "hello@calmcoffee.jp",
                  },
                ].map((info, i) => (
                  <motion.div
                    key={info.label}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.15, duration: 0.6 }}
                    className="flex gap-5 group"
                  >
                    <div className="w-10 h-10 border border-calm-accent-brass/30 rounded-full flex items-center justify-center shrink-0 group-hover:bg-calm-accent-brass/10 transition-colors duration-500">
                      <info.icon className="w-4 h-4 text-calm-accent-brass" />
                    </div>
                    <div>
                      <span className="text-white/30 text-[10px] uppercase tracking-[0.3em] block mb-2">
                        {info.label}
                      </span>
                      <p className="text-white/70 leading-relaxed whitespace-pre-line text-sm">
                        {info.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-white/30 text-[10px] uppercase tracking-[0.3em] mb-6"
              >
                @calmcoffee_official
              </motion.p>
              <InstaGrid />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="py-16 px-8 md:px-24 lg:px-32 border-t border-calm-base/15 bg-calm-bg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="text-2xl font-serif tracking-[0.3em] uppercase"
            >
              Calm Coffee
            </motion.div>

            <div className="flex gap-10 text-[10px] uppercase tracking-[0.2em] text-calm-text/40">
              {["Privacy Policy", "Terms of Service", "Contact"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="hover:text-calm-accent-brass transition-colors duration-300 relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-calm-accent-brass group-hover:w-full transition-all duration-500" />
                </a>
              ))}
            </div>

            <div className="flex gap-6">
              <a href="#" className="group">
                <div className="w-10 h-10 border border-calm-base/20 rounded-full flex items-center justify-center group-hover:border-calm-accent-brass group-hover:bg-calm-accent-brass/5 transition-all duration-500">
                  <Instagram className="w-4 h-4 text-calm-text/40 group-hover:text-calm-accent-brass transition-colors duration-500" />
                </div>
              </a>
            </div>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
            className="h-[1px] bg-calm-base/10 mb-8 origin-left"
          />

          <p className="text-center text-[10px] text-calm-text/25 uppercase tracking-[0.3em]">
            © 2026 Calm Coffee. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Shop Drawer */}
      <AnimatePresence>
        {selectedProduct && (
          <ShopDrawer
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={() => {
              addToCart(selectedProduct);
              setSelectedProduct(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Overlay */}
      <CheckoutOverlay
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => setCartItems([])}
        subtotal={cartSubtotal}
      />

      {/* Back to top button */}
      <AnimatePresence>
        {isScrolled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 z-30 w-12 h-12 bg-calm-text/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-calm-accent-brass transition-colors duration-500 shadow-lg"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

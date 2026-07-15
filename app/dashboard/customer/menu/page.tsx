'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCartStore, useMenuStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';
import type { MenuItem } from '@/lib/types';

const CATEGORY_ICONS: Record<string, string> = {
  Coffee: '☕',
  Pastries: '🥐',
  Sandwiches: '🥪',
  Desserts: '🍰',
  Beverages: '🥤',
};

const iconFor = (item: MenuItem) => CATEGORY_ICONS[item.category] ?? '🍽️';

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const { items, loading, error, fetchItems } = useMenuStore();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const availableItems = useMemo(() => items.filter((item) => item.available), [items]);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(availableItems.map((item) => item.category)))],
    [availableItems]
  );

  const filteredItems = selectedCategory === 'All'
    ? availableItems
    : availableItems.filter((item) => item.category === selectedCategory);

  const handleAddToCart = () => {
    if (selectedItem) {
      addItem({
        id: `${selectedItem.id}-${Date.now()}`,
        menuItemId: selectedItem.id,
        menuItem: selectedItem,
        quantity,
        price: selectedItem.price,
      });
      setSelectedItem(null);
      setQuantity(1);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-foreground">Our Menu</h1>
        <p className="text-lg text-muted-foreground">Browse and order your favorite items</p>
      </motion.div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Category Filter */}
      {categories.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap gap-2"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>
      )}

      {/* Loading */}
      {loading && items.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
          Loading the menu...
        </div>
      )}

      {/* Items Grid */}
      {filteredItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ translateY: -4 }}
              className="bg-card border border-border rounded-2xl p-6 space-y-4 hover:border-primary/50 transition-all cursor-pointer"
              onClick={() => {
                setSelectedItem(item);
                setQuantity(1);
              }}
            >
              <div className="text-5xl">{iconFor(item)}</div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary font-bold text-lg">{formatINR(item.price)}</span>
                <span className="text-xs text-muted-foreground">
                  ⏱️ {item.preparationTime} min
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && availableItems.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 space-y-4"
        >
          <div className="text-6xl">🍽️</div>
          <h2 className="text-2xl font-bold text-foreground">Menu coming soon</h2>
          <p className="text-muted-foreground">Our menu is being prepared. Please check back shortly!</p>
        </motion.div>
      )}

      {/* Add-to-cart dialog */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-8 max-w-md w-full space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-2">
                <div className="text-6xl">{iconFor(selectedItem)}</div>
                <h2 className="text-2xl font-bold text-foreground">{selectedItem.name}</h2>
                <p className="text-muted-foreground">{selectedItem.description}</p>
                <p className="text-primary font-bold text-xl">{formatINR(selectedItem.price)}</p>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </Button>
                <span className="text-xl font-bold text-foreground w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleAddToCart}
                >
                  Add {formatINR(selectedItem.price * quantity)}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  icon: string;
  preparationTime: number;
}

const MENU_ITEMS: MenuItem[] = [
  // Beverages
  { id: '1', name: 'Espresso', price: 120, category: 'Coffee', description: 'Rich and bold single shot', icon: '☕', preparationTime: 1 },
  { id: '2', name: 'Cappuccino', price: 180, category: 'Coffee', description: 'Smooth and creamy', icon: '☕', preparationTime: 3 },
  { id: '3', name: 'Latte', price: 200, category: 'Coffee', description: 'Silky milk foam', icon: '☕', preparationTime: 3 },
  { id: '4', name: 'Americano', price: 150, category: 'Coffee', description: 'Double espresso with water', icon: '☕', preparationTime: 2 },
  { id: '5', name: 'Macchiato', price: 160, category: 'Coffee', description: 'Espresso with milk foam', icon: '☕', preparationTime: 2 },
  { id: '6', name: 'Mocha', price: 210, category: 'Coffee', description: 'Coffee with chocolate', icon: '☕', preparationTime: 3 },
  
  // Pastries
  { id: '7', name: 'Croissant', price: 150, category: 'Pastries', description: 'Buttery and flaky', icon: '🥐', preparationTime: 2 },
  { id: '8', name: 'Chocolate Pastry', price: 160, category: 'Pastries', description: 'Rich chocolate filling', icon: '🍫', preparationTime: 2 },
  { id: '9', name: 'Danish', price: 140, category: 'Pastries', description: 'Soft and delicious', icon: '🥐', preparationTime: 2 },
  { id: '10', name: 'Donut', price: 90, category: 'Pastries', description: 'Classic glazed donut', icon: '🍩', preparationTime: 1 },
  
  // Sandwiches
  { id: '11', name: 'Club Sandwich', price: 280, category: 'Sandwiches', description: 'Turkey, bacon, lettuce', icon: '🥪', preparationTime: 5 },
  { id: '12', name: 'Caesar Wrap', price: 240, category: 'Sandwiches', description: 'Fresh greens and parmesan', icon: '🌯', preparationTime: 5 },
  { id: '13', name: 'Veggie Sandwich', price: 200, category: 'Sandwiches', description: 'Fresh vegetables', icon: '🥗', preparationTime: 4 },
  { id: '14', name: 'Tuna Sandwich', price: 250, category: 'Sandwiches', description: 'Premium tuna mix', icon: '🥪', preparationTime: 4 },
];

const CATEGORIES = ['All', 'Coffee', 'Pastries', 'Sandwiches'];

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  const filteredItems = selectedCategory === 'All'
    ? MENU_ITEMS
    : MENU_ITEMS.filter(item => item.category === selectedCategory);

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

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            {category}
          </button>
        ))}
      </motion.div>

      {/* Menu Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedItem(item)}
              className="cursor-pointer group"
            >
              <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all hover:shadow-lg space-y-4">
                <div className="text-5xl group-hover:scale-110 transition-transform">{item.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-2xl font-bold text-primary">{formatINR(item.price)}</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {item.preparationTime} min
                  </span>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Add to Cart
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-8 max-w-md w-full space-y-6"
            >
              <div className="text-6xl text-center">{selectedItem.icon}</div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">{selectedItem.name}</h2>
                <p className="text-muted-foreground mt-2">{selectedItem.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ⏱️ Preparation time: {selectedItem.preparationTime} minutes
                </p>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-2xl font-bold text-primary">{formatINR(selectedItem.price)}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold text-foreground w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setSelectedItem(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Add to Cart ({formatINR(selectedItem.price * quantity)})
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

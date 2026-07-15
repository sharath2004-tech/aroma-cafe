'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const { items, getTotalPrice, getTotalItems, removeItem, updateQuantity, clearCart } = useCartStore();
  const [readyTime, setReadyTime] = useState('15');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    
    setIsPlacingOrder(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In real app, would call API here
    console.log('Order placed with ready time:', readyTime, 'minutes');
    
    clearCart();
    router.push('/dashboard/customer/orders');
  };

  if (items.length === 0) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="text-6xl">🛒</div>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Start adding items from our menu</p>
            <Button
              onClick={() => router.push('/dashboard/customer/menu')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Continue Shopping
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-foreground">Your Cart</h1>
        <p className="text-lg text-muted-foreground">{getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} ready to order</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 space-y-4"
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border border-border rounded-xl p-6 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="text-4xl">{item.menuItem.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{item.menuItem.name}</h3>
                  <p className="text-sm text-muted-foreground">{formatINR(item.price)} each</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="px-3 py-1 bg-muted rounded hover:bg-muted/80"
                >
                  −
                </button>
                <span className="text-lg font-bold w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-3 py-1 bg-muted rounded hover:bg-muted/80"
                >
                  +
                </button>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-primary">{formatINR(item.price * item.quantity)}</p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-destructive hover:underline mt-1"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6 sticky top-8">
            <h2 className="text-2xl font-bold text-foreground">Order Summary</h2>

            {/* Ready Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground block">Ready Time (minutes)</label>
              <input
                type="number"
                min="15"
                max="60"
                value={readyTime}
                onChange={(e) => setReadyTime(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">Minimum 15 minutes</p>
            </div>

            {/* Special Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground block">Special Notes (Optional)</label>
              <textarea
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="Any special requests..."
                className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
              />
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-3 border-t border-border pt-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground font-medium">{formatINR(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST (5%)</span>
                <span className="text-foreground font-medium">{formatINR(getTotalPrice() * 0.05)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                <span className="text-foreground">Total</span>
                <span className="text-primary">{formatINR(getTotalPrice() * 1.05)}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-4">
              <Button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3"
              >
                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/customer/menu')}
                className="w-full"
              >
                Continue Shopping
              </Button>
            </div>

            {/* Order Info */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-primary">Ready in approximately</p>
              <p className="text-2xl font-bold text-primary">{readyTime} minutes</p>
              <p className="text-xs text-muted-foreground">We&apos;ll notify you when it&apos;s ready</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

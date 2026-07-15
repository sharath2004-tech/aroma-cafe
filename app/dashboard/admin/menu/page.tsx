'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useMenuStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';
import type { MenuItem } from '@/lib/types';

export default function MenuManagementPage() {
  const { items, loading, error, fetchItems, addItem, updateItem, deleteItem } = useMenuStore();

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Coffee',
    description: '',
    preparationTime: '',
  });

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description,
        preparationTime: parseInt(formData.preparationTime),
      };

      if (editingId) {
        await updateItem(editingId, payload);
        setEditingId(null);
      } else {
        await addItem({ ...payload, available: true });
      }

      setFormData({ name: '', price: '', category: 'Coffee', description: '', preparationTime: '' });
      setShowForm(false);
    } catch {
      // store surfaces the error message
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      description: item.description,
      preparationTime: item.preparationTime.toString(),
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure? This removes the item for all customers.')) {
      await deleteItem(id).catch(() => {});
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    await updateItem(item.id, { available: !item.available }).catch(() => {});
  };

  const categories = Array.from(new Set(items.map(item => item.category)));

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Menu Management</h1>
          <p className="text-lg text-muted-foreground">Add, edit, and manage menu items</p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', price: '', category: 'Coffee', description: '', preparationTime: '' });
            setShowForm(!showForm);
          }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {showForm ? 'Cancel' : '+ Add Item'}
        </Button>
      </motion.div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card border border-border rounded-2xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Item Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Cappuccino"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="180"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Coffee">Coffee</option>
                    <option value="Pastries">Pastries</option>
                    <option value="Sandwiches">Sandwiches</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Preparation Time (min)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Item description..."
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3"
              >
                {submitting ? 'Saving...' : editingId ? 'Update Item' : 'Add Item'}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && items.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
          Loading menu items...
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 space-y-4"
        >
          <div className="text-6xl">🍽️</div>
          <h2 className="text-2xl font-bold text-foreground">No menu items yet</h2>
          <p className="text-muted-foreground">Click &quot;+ Add Item&quot; to create your first menu item — it will appear instantly for customers.</p>
        </motion.div>
      )}

      {/* Items by Category */}
      {categories.map((category, catIndex) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: catIndex * 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.filter(item => item.category === category).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-lg p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    item.available
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {item.available ? 'Available' : 'Out of Stock'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Price: <span className="text-primary font-bold">{formatINR(item.price)}</span></span>
                  <span className="text-muted-foreground">Prep: <span className="font-bold">{item.preparationTime}m</span></span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => toggleAvailability(item)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {item.available ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    onClick={() => handleEdit(item)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(item.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive"
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

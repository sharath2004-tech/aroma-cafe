import MenuItem from '../models/MenuItem.js';

export const getMenuItems = async (req, res) => {
  try {
    const { category, available } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (available !== undefined) filter.available = available === 'true';

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

export const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: '❌ Menu item not found' });
    }
    res.json({ item });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

export const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, image, category, available, preparationTime } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ message: '❌ name, category and price are required' });
    }
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ message: '❌ price must be a non-negative number' });
    }

    const item = new MenuItem({ name, description, price, image, category, available, preparationTime });
    await item.save();

    res.status(201).json({ message: '✅ Menu item created', item });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, image, category, available, preparationTime } = req.body;
    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({ message: '❌ price must be a non-negative number' });
    }

    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { name, description, price, image, category, available, preparationTime },
      { new: true, runValidators: true, omitUndefined: true }
    );
    if (!item) {
      return res.status(404).json({ message: '❌ Menu item not found' });
    }

    res.json({ message: '✅ Menu item updated', item });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: '❌ Menu item not found' });
    }
    res.json({ message: '✅ Menu item deleted' });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

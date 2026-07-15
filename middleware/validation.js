const validateOrder = (req, res, next) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: '❌ Order must have at least one item' });
  }

  const invalidItem = items.find(
    (item) => !item.menuItemId || !Number.isInteger(item.quantity) || item.quantity < 1
  );
  if (invalidItem) {
    return res.status(400).json({ message: '❌ Each item needs a menuItemId and a positive integer quantity' });
  }

  next();
};

export { validateOrder };


const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: '❌ Missing required fields: name, email, password' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ message: '❌ Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: '❌ Password must be at least 6 characters' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '❌ Email and password required' });
  }

  next();
};

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

export { validateLogin, validateOrder, validateRegister };


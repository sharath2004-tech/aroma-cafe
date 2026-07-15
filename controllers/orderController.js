import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
const isStaff = (req) => req.user.role === 'admin' || req.user.role === 'chef';

export const createOrder = async (req, res) => {
  try {
    const { items, deliveryType, tableNumber, notes, deliveryAddress } = req.body;

    const menuItems = await MenuItem.find({ _id: { $in: items.map((i) => i.menuItemId) } });
    const menuItemsById = new Map(menuItems.map((m) => [m._id.toString(), m]));

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const menuItem = menuItemsById.get(item.menuItemId);
      if (!menuItem) {
        return res.status(400).json({ message: `❌ Menu item ${item.menuItemId} not found` });
      }
      if (!menuItem.available) {
        return res.status(400).json({ message: `❌ ${menuItem.name} is currently unavailable` });
      }
      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        image: menuItem.image,
        notes: item.notes
      });
      totalAmount += menuItem.price * item.quantity;
    }

    const order = new Order({
      userId: req.user.userId,
      items: orderItems,
      totalAmount,
      deliveryType,
      tableNumber,
      notes,
      deliveryAddress
    });

    await order.save();

    if (global.io) {
      global.io.emit('order-created', {
        orderId: order._id,
        status: order.status,
        message: '📦 New order placed!'
      });
    }

    res.status(201).json({ message: '✅ Order created', order });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '❌ Order not found' });
    }
    if (!isStaff(req) && order.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: '❌ You do not have permission to view this order' });
    }
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: `❌ status must be one of: ${ORDER_STATUSES.join(', ')}` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ message: '❌ Order not found' });
    }

    if (global.io) {
      global.io.to(`order-${order._id}`).emit('order-updated', {
        orderId: order._id,
        status: order.status,
        message: `📝 Order status updated to ${status}`
      });
    }

    res.json({ message: '✅ Order updated', order });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '❌ Order not found' });
    }
    if (!isStaff(req) && order.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: '❌ You do not have permission to cancel this order' });
    }
    if (['completed', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ message: `❌ Order already ${order.status}` });
    }

    order.status = 'cancelled';
    order.updatedAt = Date.now();
    await order.save();

    if (global.io) {
      global.io.to(`order-${order._id}`).emit('order-updated', {
        orderId: order._id,
        status: order.status,
        message: '📝 Order cancelled'
      });
    }

    res.json({ message: '✅ Order cancelled', order });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('userId', 'name email');
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

const MenuItem = require('../models/MenuItem');


const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, imageUrl } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'name and price are required' });
    }

    const item = new MenuItem({
      name: name.trim(),
      description: description || '',
      price: Number(price),
      imageUrl: imageUrl || ''
    });

    const saved = await item.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('createMenuItem error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const listMenuItems = async (req, res) => {
  try {

    const items = await MenuItem.find().sort({ createdAt: -1 });

    return res.json(items);
  } catch (err) {
    console.error('listMenuItems error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const getMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findById(id);
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    return res.json(item);
  } catch (err) {
    console.error('getMenuItem error:', err);
    return res.status(400).json({ error: 'Invalid id' });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await MenuItem.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Menu item not found' });
    return res.json({ message: 'Deleted', id: deleted.id });
  } catch (err) {
    console.error('deleteMenuItem error:', err);
    return res.status(400).json({ error: 'Invalid id' });
  }
};

module.exports = {
  createMenuItem,
  listMenuItems,
  getMenuItem,
  deleteMenuItem
};

const bcrypt = require('bcryptjs');
const db = require('../config/database');

const seed = async () => {
  try {
    console.log('Seeding database...');

    db.exec('DELETE FROM order_items');
    db.exec('DELETE FROM orders');
    db.exec('DELETE FROM cart_items');
    db.exec('DELETE FROM payments');
    db.exec('DELETE FROM products');
    db.exec('DELETE FROM categories');
    db.exec('DELETE FROM tables');
    db.exec('DELETE FROM users');

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('user123', salt);

    db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run('Admin', 'admin@cafe.com', adminPassword, 'admin');
    db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run('John Doe', 'user@cafe.com', userPassword, 'customer');

    console.log('Users created');

    const categories = [
      { name: 'Beverages', description: 'Hot and cold drinks' },
      { name: 'Main Course', description: 'Delicious main dishes' },
      { name: 'Appetizers', description: 'Starters and small plates' },
      { name: 'Desserts', description: 'Sweet treats' },
      { name: 'Snacks', description: 'Light bites' },
      { name: 'Salads', description: 'Fresh and healthy salads' }
    ];

    const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
    const categoryIds = {};

    for (const cat of categories) {
      const result = insertCategory.run(cat.name, cat.description);
      categoryIds[cat.name] = result.lastInsertRowid;
    }

    console.log('Categories created');

    const products = [
      { name: 'Espresso', description: 'Rich and bold single shot espresso', price: 3.50, category: 'Beverages', prepTime: 5 },
      { name: 'Cappuccino', description: 'Classic Italian coffee with steamed milk foam', price: 4.50, category: 'Beverages', prepTime: 7 },
      { name: 'Fresh Orange Juice', description: 'Freshly squeezed orange juice', price: 5.00, category: 'Beverages', prepTime: 5 },
      { name: 'Grilled Chicken Breast', description: 'Tender grilled chicken with herbs and spices', price: 15.99, category: 'Main Course', prepTime: 25 },
      { name: 'Beef Steak', description: 'Premium cut beef steak grilled to perfection', price: 24.99, category: 'Main Course', prepTime: 30 },
      { name: 'Pasta Carbonara', description: 'Classic Italian pasta with creamy egg sauce and pancetta', price: 14.99, category: 'Main Course', prepTime: 20 },
      { name: 'Margherita Pizza', description: 'Traditional pizza with tomato sauce, mozzarella, and basil', price: 12.99, category: 'Main Course', prepTime: 18 },
      { name: 'Spring Rolls', description: 'Crispy vegetable spring rolls with sweet chili sauce', price: 7.99, category: 'Appetizers', prepTime: 12 },
      { name: 'Bruschetta', description: 'Toasted bread with fresh tomatoes, garlic, and basil', price: 8.99, category: 'Appetizers', prepTime: 10 },
      { name: 'Calamari', description: 'Crispy fried squid rings with marinara sauce', price: 10.99, category: 'Appetizers', prepTime: 15 },
      { name: 'Tiramisu', description: 'Classic Italian coffee-flavored dessert', price: 8.99, category: 'Desserts', prepTime: 5 },
      { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a molten center', price: 9.99, category: 'Desserts', prepTime: 15 },
      { name: 'Cheesecake', description: 'Creamy New York style cheesecake', price: 7.99, category: 'Desserts', prepTime: 5 },
      { name: 'French Fries', description: 'Crispy golden french fries', price: 4.99, category: 'Snacks', prepTime: 10 },
      { name: 'Garlic Bread', description: 'Toasted bread with garlic butter and herbs', price: 5.99, category: 'Snacks', prepTime: 8 },
      { name: 'Caesar Salad', description: 'Fresh romaine lettuce with Caesar dressing and croutons', price: 9.99, category: 'Salads', prepTime: 10 },
      { name: 'Greek Salad', description: 'Mediterranean salad with feta cheese and olives', price: 10.99, category: 'Salads', prepTime: 8 },
      { name: 'Mojito', description: 'Refreshing mint and lime cocktail', price: 6.99, category: 'Beverages', prepTime: 5 },
      { name: 'Grilled Salmon', description: 'Fresh Atlantic salmon with lemon butter sauce', price: 19.99, category: 'Main Course', prepTime: 22 }
    ];

    const insertProduct = db.prepare('INSERT INTO products (name, description, price, category_id, preparation_time) VALUES (?, ?, ?, ?, ?)');

    for (const prod of products) {
      insertProduct.run(prod.name, prod.description, prod.price, categoryIds[prod.category], prod.prepTime);
    }

    console.log('Products created');

    const tables = [
      { number: 'T1', capacity: 2, section: 'indoor' },
      { number: 'T2', capacity: 4, section: 'indoor' },
      { number: 'T3', capacity: 4, section: 'indoor' },
      { number: 'T4', capacity: 6, section: 'indoor' },
      { number: 'T5', capacity: 2, section: 'outdoor' },
      { number: 'T6', capacity: 4, section: 'outdoor' },
      { number: 'T7', capacity: 4, section: 'outdoor' },
      { number: 'T8', capacity: 8, section: 'outdoor' },
      { number: 'T9', capacity: 2, section: 'indoor' },
      { number: 'T10', capacity: 6, section: 'outdoor' }
    ];

    const insertTable = db.prepare('INSERT INTO tables (table_number, capacity, section) VALUES (?, ?, ?)');

    for (const table of tables) {
      insertTable.run(table.number, table.capacity, table.section);
    }

    console.log('Tables created');
    console.log('Database seeded successfully!');
    console.log('\nTest credentials:');
    console.log('Admin: admin@cafe.com / admin123');
    console.log('Customer: user@cafe.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();

import db from '../config/db.js';

const getAllProducts = async () => {
    const [rows] = await db.query('SELECT * FROM products ORDER BY id DESC');
    return rows;
};

const getProductById = async (id) => {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
};

const getAdvancedFilteredProducts = async (filters) => {
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (filters.category) {
        query += ' AND category = ?';
        params.push(filters.category);
    }

    if (filters.minPrice) {
        query += ' AND price >= ?';
        params.push(filters.minPrice);
    }

    if (filters.maxPrice) {
        query += ' AND price <= ?';
        params.push(filters.maxPrice);
    }

    if (filters.sort === 'price_asc') {
        query += ' ORDER BY price ASC';
    } else if (filters.sort === 'price_desc') {
        query += ' ORDER BY price DESC';
    } else {
        query += ' ORDER BY created_at DESC';
    }

    const [rows] = await db.query(query, params);
    return rows;
};

const createProduct = async (productData) => {
    const { name, price, old_price, is_flash_sale, sold_count, stock_count, category, image, description } = productData;
    const [result] = await db.query(
        'INSERT INTO products (name, price, old_price, is_flash_sale, sold_count, stock_count, category, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, price, old_price, is_flash_sale, sold_count, stock_count, category, image, description]
    );
    return result.insertId;
};

const updateProduct = async (id, productData) => {
    const { name, price, old_price, is_flash_sale, sold_count, stock_count, category, image, description } = productData;
    await db.query(
        'UPDATE products SET name=?, price=?, old_price=?, is_flash_sale=?, sold_count=?, stock_count=?, category=?, image=?, description=? WHERE id=?',
        [name, price, old_price, is_flash_sale, sold_count, stock_count, category, image, description, id]
    );
};

const deleteProduct = async (id) => {
    await db.query('DELETE FROM products WHERE id = ?', [id]);
};

export default {
    getAllProducts,
    getProductById,
    getAdvancedFilteredProducts,
    createProduct,
    updateProduct,
    deleteProduct
};

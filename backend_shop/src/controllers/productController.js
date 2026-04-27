import productService from '../services/productService.js';

const getAllProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getFilteredProducts = async (req, res) => {
    try {
        const products = await productService.getAdvancedFilteredProducts(req.query);
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const productId = await productService.createProduct(req.body);
        res.status(201).json({ id: productId, message: "Sản phẩm được tạo thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        await productService.updateProduct(req.params.id, req.body);
        res.json({ message: "Sản phẩm đã được cập nhật" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export default {
    getAllProducts,
    getProductById,
    getFilteredProducts,
    createProduct,
    updateProduct,
    deleteProduct
};

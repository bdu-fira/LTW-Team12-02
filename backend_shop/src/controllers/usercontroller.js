import userservice from "../services/userservice.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userController = {
    getAllUsers: async(req, res) => {
        try {
            const users = await userservice.getAllUsers();
            res.json({ success: true, data: users });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách người dùng:", error);
            res.status(500).json({ success: false, message: "Lỗi server" });
        }
    },

    register: async(req, res) => {
        try {
            const { full_name, email, password, phone } = req.body;
            
            // Kiểm tra xem email đã tồn tại chưa
            const existingUser = await userservice.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ success: false, message: "Email đã được sử dụng" });
            }

            // Mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Tạo người dùng mới
            const newUserId = await userservice.createUser({
                full_name,
                email,
                password: hashedPassword,
                phone
            });
            
            res.status(201).json({ success: true, message: "Đăng ký thành công", userId: newUserId });
        } catch (error) {
            console.error("Lỗi khi đăng ký người dùng:", error);
            res.status(500).json({ success: false, message: "Lỗi server" });
        }
    },

    login: async(req, res) => {
        try {
            const { email, password } = req.body;

            // Kiểm tra email
            const user = await userservice.getUserByEmail(email);
            if (!user) {
                return res.status(400).json({ success: false, message: "Email hoặc mật khẩu không đúng" });
            }

            // Kiểm tra mật khẩu
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ success: false, message: "Email hoặc mật khẩu không đúng" });
            }

            // Tạo token
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({ 
                success: true, 
                message: "Đăng nhập thành công",
                token,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error("Lỗi khi đăng nhập:", error);
            res.status(500).json({ success: false, message: "Lỗi server" });
        }
    }
};

export default userController;
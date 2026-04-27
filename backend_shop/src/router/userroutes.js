import express from 'express'; // Thiếu dòng này trong đoạn code bạn gửi
import userController from "../controllers/usercontroller.js";
const router = express.Router();

router.get("/all", userController.getAllUsers);

// Routes cho xác thực (đăng ký, đăng nhập)
router.post("/register", userController.register);
router.post("/login", userController.login);

export default router;
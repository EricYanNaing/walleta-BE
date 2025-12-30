import { Router } from "express";
import { AuthController } from "./modules/auth/auth.controller";
import { UserController } from "./modules/user/user.controller";
import { requireAuth } from "./middleware/auth";
import { SubCategoryController } from "./modules/subcategory/subcategory.controller";
import { TransactionController } from "./modules/transactions/transaction.controller";

export const router = Router();

// auth routers
router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);
router.get("/auth/:userId", requireAuth, AuthController.getUserInfo);

// user routers
router.get("/user/", requireAuth, UserController.getUserInfo);
router.patch("/user/", requireAuth, UserController.updateUserInfo);

// subCategory routers
router.get("/sub-category", requireAuth, SubCategoryController.list);
router.post("/sub-category", requireAuth, SubCategoryController.create);
router.put("/sub-category", requireAuth, SubCategoryController.update);

// transaction routers
router.get("/transactions", requireAuth, TransactionController.list);
router.post("/transactions", requireAuth, TransactionController.create);
router.put("/transactions", requireAuth, TransactionController.update);
router.delete("/transactions", requireAuth, TransactionController.delete);

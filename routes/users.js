const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const userController = require("../controllers/userController");

router.get("/me", auth, userController.getCurrentUser);
router.post("/", [auth, role(["admin", "master"])], userController.createUser);
router.put("/:id", [auth, role(["admin", "master"])], userController.updateUser);
router.get("/", [auth, role(["admin", "master"])], userController.getUsers);
router.get("/:id", [auth, role(["admin", "master"])], userController.getUserById);
router.delete("/:id", [auth, role(["admin", "master"])], userController.deleteUser);

module.exports = router;

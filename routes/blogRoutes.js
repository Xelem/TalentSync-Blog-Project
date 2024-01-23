const express = require("express");
const authController = require("../controllers/authController");
const blogController = require("../controllers/blogController");
const router = express.Router();

router.get("/", blogController.readAllBlogs);
router.get("/:id", blogController.readBlog);

router.use(authController.verifyJwtToken);
router.post("/", blogController.createBlog);
router.patch("/:id", blogController.updateBlog);
router.delete("/:id", blogController.deleteBlog);

module.exports = router;

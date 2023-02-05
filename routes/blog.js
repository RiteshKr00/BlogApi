const express = require("express");
const Blog = require("../models/blogModel");
const isAuthenticated = require("../middlewares/authJwt");
const router = express.Router();

router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(422)
        .send({ message: "failure", error: "Enter Both tilte and descriptio" });
    }
    const blog = await new Blog({
      title,
      description,
      createdBy: req.user._id,
    }).save();

    res.status(200).send({ message: "success", blog_created: blog });
  } catch (error) {
    res.status(500).send(`Something went wrong ${error}`);
  }
});
//get all blog
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const blog = await Blog.find();
    return res.status(200).send(blog);
  } catch (error) {
    res.status(500).send(`Something Went Wrong: ${error}`);
  }
});
//get by Id
router.get("/:blogId", isAuthenticated, async (req, res) => {
  try {
    const blog_id = req.params.blogId;
    const blog = await Blog.findById(blog_id);
    return res.status(200).send(blog);
  } catch (error) {
    res.status(500).send(`Something Went Wrong: ${error}`);
  }
});
//update blog
router.put("/:blogId", isAuthenticated, async (req, res) => {
  try {
    const blog_id = req.params.blogId;
    const updatedBlog = await Blog.findOneAndUpdate(
      { _id: blog_id },
      req.body,
      { new: true }
    );
    if (!updatedBlog)
      return res.status(404).json({ message: "Blog Not Found" });

    res.status(200).json({ message: "Blog Updated", updatedBlog });
  } catch (error) {
    res.status(500).json({ message: `Server Error + ${error}` });
  }
});
//delete blog
router.delete("/:blogId", isAuthenticated, async (req, res) => {
  try {
    const blog_id = req.params.blogId;
    const deletedBlog = await Blog.findOneAndDelete({
      _id: blog_id,
    });
    if (!deletedBlog)
      return res.status(404).json({ message: "Blog to be deleted Not Found" });
    res
      .status(200)
      .json({ message: "Blog Deleted", Deleted_playlist: deletedBlog });
  } catch (error) {
    res.status(500).json({ message: `Server Error + ${error}` });
  }
});
module.exports = router;

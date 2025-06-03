const bcrypt = require("bcryptjs");
const _ = require("lodash");
const { User, validate } = require("../models/user");

// GET /me
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// POST /
exports.createUser = async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    let user = await User.findOne({
      $or: [{ email: req.body.email }, { name: req.body.name }],
    });
    if (user)
      return res
        .status(400)
        .send("User with this email or name already registered.");

    if (req.body.role === "master" || (req.user.role === "admin" && req.body.role === "master"))
      return res.status(403).send("Access denied. Cannot create master user.");

    user = new User({
      ..._.pick(req.body, ["name", "email", "password", "role"]),
      createdByUserId: req.user._id,
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    res.send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// PUT /:id
exports.updateUser = async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found.");

    if (req.user.role === "admin") {
      if (user.role === "master" || req.body.role === "master")
        return res.status(403).send("Access denied. Cannot edit or assign master role.");
    }

    if (req.user.role === "master") {
      if (user.role === "master" && req.body.role !== "master")
        return res.status(403).send("Cannot downgrade master user.");
      if (user.role === "admin" && req.body.role === "master")
        return res.status(403).send("Cannot upgrade admin to master.");
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.updatedByUserId = req.user._id;
    user.updatedDate = new Date();

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();
    res.send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// GET /
exports.getUsers = async (req, res) => {
  try {
    const query = {
      isDeleted: false,
      ...(req.user.role === "admin" && { role: { $in: ["user", "admin"] } }),
    };
    const users = await User.find(query).select("-password");
    res.send(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// GET /:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).send("User not found.");

    if (req.user.role === "admin" && user.role === "master")
      return res.status(403).send("Access denied.");

    res.send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// DELETE /:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found.");

    if (user.role === "master")
      return res.status(403).send("Cannot delete master user.");

    if (req.user.role === "admin" && user.role === "admin")
      return res.status(403).send("Access denied. Cannot delete another admin.");

    user.isDeleted = true;
    user.deletedByUserId = req.user._id;
    user.deletionDate = new Date();

    await user.save();
    res.send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

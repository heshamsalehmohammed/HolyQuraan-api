const Joi = require("joi");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const { User } = require("../models/user");

// Login handler
exports.login = async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const user = await User.findOne({
      $or: [{ email: req.body.emailOrName }, { name: req.body.emailOrName }],
    });
    if (!user) return res.status(400).send("Invalid email, name, or password.");

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send("Invalid email, name, or password.");

    const token = user.generateAuthToken();
    res.send({
      token,
      user: _.pick(user, ["_id", "name", "email", "role"]),
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Logout handler
exports.logout = (req, res) => {
  try {
    res.send({ message: "Logged out successfully." });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Register handler
exports.register = async (req, res) => {
  const { error } = validateRegister(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    let user = await User.findOne({
      $or: [{ email: req.body.email }, { name: req.body.name }],
    });
    if (user) return res.status(400).send("User with this email or name already registered.");

    user = new User(_.pick(req.body, ["name", "email", "password", "role"]));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = user.generateAuthToken();
    res.header("x-auth-token", token).send({
      token,
      user: _.pick(user, ["_id", "name", "email", "role"]),
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Validation helpers
function validateLogin(req) {
  const schema = Joi.object({
    emailOrName: Joi.string().min(2).max(255).required(),
    password: Joi.string().min(5).max(255).required(),
  });
  return schema.validate(req);
}

function validateRegister(req) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    role: Joi.string().valid("user", "admin", "master").default("user"),
  });
  return schema.validate(req);
}

import User from "../models/user.model.js";
// to to  crypto the password at mongodb
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10); // 10 is the salt number for crypting the password
  const newUser = new User({ username, email, password: hashedPassword });
  try {
    await newUser.save();
    res.status(201).json("newUser created");
  } catch (error) {
    next(error);
  }
};

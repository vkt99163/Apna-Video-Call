import { StatusCodes } from "http-status-codes";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Meeting from "../models/meeting.model.js" 
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide username and password" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found" }); // StatusCodes use kiya
    }

    // 2. FIX: bcrypt.compare ek asynchronous function hai, yahan 'await' lagana zaroori hai
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (isPasswordMatch) {
      let token = crypto.randomBytes(20).toString("hex");
      user.token = token;
      await user.save();
      return res.status(StatusCodes.OK).json({ token: token });
    } else {
      // Agar password galat ho toh error response
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });
    }
  } catch (e) {
    return res.status(500).json({ Message: `Something went wrong ${e}` });
  }
};




const register = async (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({
      message: "Please provide name, username and password",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully",
    });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    if (e.name === "ValidationError") {
      return res.status(400).json({
        message: e.message,
      });
    }

    return res.status(500).json({
      message: e.message,
    });
  }
};


const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });
        const meetings = await Meeting.find({ user_id: user.username })
        res.json(meetings)
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token: token });

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        })

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" })
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}

export { login, register, getUserHistory, addToHistory};

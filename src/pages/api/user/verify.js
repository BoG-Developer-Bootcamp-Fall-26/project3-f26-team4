import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";
import argon2 from "argon2";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Please provide email and password." });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials." });
      }

      const isMatch = await argon2.verify(user.password, password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials." });
      }

      return res.status(200).json({
        userId: user._id,
        fullName: user.fullName,
        admin: user.admin,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Internal server error." });
    }
  }

  res.setHeader("Allow", ["POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

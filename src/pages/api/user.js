import dbConnect from "../../lib/dbConnect";
import User from "../../models/User";
import argon2 from "argon2";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const { fullName, email, password, admin } = req.body;

      if (!fullName || !email || !password) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email." });
      }

      const hashedPassword = await argon2.hash(password);

      const user = await User.create({
        fullName,
        email,
        password: hashedPassword,
        admin: admin || false,
      });

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

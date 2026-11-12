import dbConnect from "../../lib/dbConnect";
import Animal from "../../models/Animal";
import User from "../../models/User";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const { name, breed, owner, hoursTrained, profilePicture } = req.body;

      if (!name || !breed || !owner) {
        return res.status(400).json({ error: "Missing required fields (name, breed, owner)." });
      }

      const userExists = await User.findById(owner);
      if (!userExists) {
        return res.status(400).json({ error: "Owner user does not exist." });
      }

      const animal = await Animal.create({
        name,
        breed,
        owner,
        hoursTrained: hoursTrained || 0,
        profilePicture: profilePicture || "",
      });

      return res.status(200).json(animal);
    } catch (error) {
      return res.status(500).json({ error: error.message || "Internal server error." });
    }
  }

  if (req.method === "GET") {
    try {
      const animals = await Animal.find({}).populate("owner", "fullName email");
      return res.status(200).json(animals);
    } catch (error) {
      return res.status(500).json({ error: error.message || "Internal server error." });
    }
  }

  res.setHeader("Allow", ["POST", "GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

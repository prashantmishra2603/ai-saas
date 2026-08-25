import sql from "../configs/db.js";

export const getUserCreations = async (req, res) => {
  try {
    const authData = typeof req.auth === "function" ? req.auth() : req.auth;
    const userId = authData?.userId;

    if (!userId) {
      return res.json({ success: true, creations: [] });
    }

    let creations = [];
    try {
      creations = await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;
    } catch (dbErr) {
      console.warn("Could not query user creations from DB:", dbErr.message);
    }

    res.json({ success: true, creations: Array.isArray(creations) ? creations : [] });
  } catch (error) {
    console.error("getUserCreations error:", error.message);
    res.json({ success: false, message: error.message, creations: [] });
  }
};

export const getPublishedCreations = async (req, res) => {
  try {
    let creations = [];
    try {
      creations = await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;
    } catch (dbErr) {
      console.warn("Could not query published creations:", dbErr.message);
    }

    res.json({ success: true, creations: Array.isArray(creations) ? creations : [] });
  } catch (error) {
    console.error("getPublishedCreations error:", error.message);
    res.json({ success: false, message: error.message, creations: [] });
  }
};

export const toggleLikeCreation = async (req, res) => {
  try {
    const authData = typeof req.auth === "function" ? req.auth() : req.auth;
    const userId = authData?.userId;
    const { id } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`;

    if (!creation) {
      return res.json({ success: false, message: "Creation not found." });
    }

    const currentLikes = Array.isArray(creation.likes) ? creation.likes : [];
    const userIdStr = userId.toString();
    let updatedLikes;
    let message;

    if (currentLikes.includes(userIdStr)) {
      updatedLikes = currentLikes.filter((user) => user !== userIdStr);
      message = "Creation Unliked";
    } else {
      updatedLikes = [...currentLikes, userIdStr];
      message = "Creation Liked";
    }

    const formattedArray = `{${updatedLikes.join(", ")}}`;

    await sql`UPDATE creations SET likes = ${formattedArray}::text[] WHERE id = ${id}`;

    res.json({ success: true, message });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const deleteCreation = async (req, res) => {
  try {
    const authData = typeof req.auth === "function" ? req.auth() : req.auth;
    const userId = authData?.userId;
    const { id } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const [creation] = await sql`SELECT * FROM creations WHERE id = ${id} AND user_id = ${userId}`;

    if (!creation) {
      return res.json({ success: false, message: "Creation not found or unauthorized." });
    }

    await sql`DELETE FROM creations WHERE id = ${id} AND user_id = ${userId}`;

    res.json({ success: true, message: "Creation deleted successfully." });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
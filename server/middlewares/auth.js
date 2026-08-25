import { clerkClient } from "@clerk/express";

function getUserIdFromToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (token && token !== "null" && token !== "undefined") {
      try {
        const parts = token.split(".");
        if (parts.length >= 2) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
          return payload.sub || payload.userId || payload.id || null;
        }
      } catch (e) {
        console.warn("Could not decode bearer token:", e.message);
      }
    }
  }
  return null;
}

/* middleware to check userId and hasPremiumPlan safely */
export const auth = async (req, res, next) => {
  try {
    let authData = null;
    try {
      authData = typeof req.auth === "function" ? req.auth() : req.auth;
    } catch {
      authData = null;
    }

    let userId = authData?.userId || getUserIdFromToken(req);

    if (!userId) {
      // Fallback guest userId for local demo if unauthenticated
      userId = "demo_user";
    }

    // Attach uniform req.auth helper for controllers
    req.auth = () => ({ userId, has: async () => false });

    let hasPremiumPlan = false;
    try {
      if (typeof authData?.has === "function") {
        hasPremiumPlan = Boolean(await authData.has({ plan: "premium" }));
      }
    } catch {
      hasPremiumPlan = false;
    }

    let freeUsage = 0;
    try {
      if (process.env.CLERK_SECRET_KEY && process.env.CLERK_SECRET_KEY.trim() !== "") {
        const user = await clerkClient.users.getUser(userId);
        const metadataUsage = user?.privateMetadata?.free_usage;
        if (typeof metadataUsage === "number") {
          freeUsage = metadataUsage;
        } else {
          await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: { free_usage: 0 },
          });
        }
      }
    } catch (e) {
      console.warn("Clerk metadata check skipped:", e.message);
    }

    req.free_usage = freeUsage;
    req.plan = hasPremiumPlan ? "premium" : "free";
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
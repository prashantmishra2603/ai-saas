import express from "express";
import {
  generateArticle,
  generateBlogTitle,
  generateImage,
  removeImageBackground,
  removeImageObject,
  reviewResume,
  reviewCode,
  summarizeText,
  generateEmail,
  improveGrammar,
  generateSocialContent,
  translateContent,
} from "../controllers/aiController.js";
import { auth } from "../middlewares/auth.js";
import { upload } from "../configs/multer.js";

const aiRouter = express.Router();

aiRouter.post("/generate-article", auth, generateArticle);
aiRouter.post("/generate-blog-title", auth, generateBlogTitle);
aiRouter.post("/generate-image", auth, generateImage);

aiRouter.post(
  "/remove-image-background",
  upload.single("image"),
  auth,
  removeImageBackground
);

aiRouter.post(
  "/remove-image-object",
  upload.single("image"),
  auth,
  removeImageObject
);

aiRouter.post("/review-resume", upload.single("resume"), auth, reviewResume);
aiRouter.post("/review-code", auth, reviewCode);
aiRouter.post("/summarize-text", auth, summarizeText);
aiRouter.post("/generate-email", auth, generateEmail);
aiRouter.post("/improve-grammar", auth, improveGrammar);
aiRouter.post("/generate-social-content", auth, generateSocialContent);
aiRouter.post("/translate-content", auth, translateContent);

export default aiRouter;
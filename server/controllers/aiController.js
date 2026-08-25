import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import Groq from "groq-sdk";
import { HfInference } from "@huggingface/inference";

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

import pdf from "pdf-parse/lib/pdf-parse.js";

const AI = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const saveCreationSafely = async (saveFn) => {
  try {
    await saveFn();
  } catch (err) {
    console.warn("⚠️ DB save creation skipped:", err.message);
  }
};

export const generateArticle = async (req, res) => {
  try {
    const authData = typeof req.auth === "function" ? req.auth() : req.auth;
    const userId = authData?.userId;
    const { prompt, length } = req.body;
    const plan = req.plan || "free";
    const free_usage = req.free_usage || 0;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Free usage limit reached. Upgrade to premium for more usage.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: length || 800,
    });

    const content = response.choices[0].message.content;

    await saveCreationSafely(() => sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'article')`);

    if (plan !== "premium" && process.env.CLERK_SECRET_KEY) {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: {
            free_usage: free_usage + 1,
          },
        });
      } catch (err) {
        console.warn("Could not update metadata:", err.message);
      }
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("generateArticle error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const authData = typeof req.auth === "function" ? req.auth() : req.auth;
    const userId = authData?.userId;
    const { prompt } = req.body;
    const plan = req.plan || "free";
    const free_usage = req.free_usage || 0;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Free usage limit reached. Upgrade to premium for more usage.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;

    await saveCreationSafely(() => sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`);

    if (plan !== "premium" && process.env.CLERK_SECRET_KEY) {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: {
            free_usage: free_usage + 1,
          },
        });
      } catch (err) {
        console.warn("Could not update metadata:", err.message);
      }
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("generateBlogTitle error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateImage = async (req, res) => {
  try {
    const authData = typeof req.auth === "function" ? req.auth() : req.auth;
    const userId = authData?.userId;
    const { prompt, publish } = req.body;
    const plan = req.plan || "free";

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium users.",
      });
    }

    if (!prompt || !prompt.trim()) {
      return res.json({
        success: false,
        message: "Please enter a prompt to generate an image.",
      });
    }

    // Modern Hugging Face Inference using FLUX.1-schnell
    const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);
    const imageBlob = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: prompt,
    });

    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // If Cloudinary is configured, upload to Cloudinary
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        async (error, result) => {
          if (error) {
            const base64Image = `data:${imageBlob.type || "image/png"};base64,${buffer.toString("base64")}`;
            await saveCreationSafely(() => sql`INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${base64Image}, 'image', ${publish ?? false})`);
            return res.json({ success: true, content: base64Image });
          }

          await saveCreationSafely(() => sql`INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${result.secure_url}, 'image', ${publish ?? false})`);
          res.json({ success: true, content: result.secure_url });
        }
      );
      uploadStream.end(buffer);
    } else {
      // Direct high-resolution data URI if Cloudinary is not yet filled
      const base64Image = `data:${imageBlob.type || "image/png"};base64,${buffer.toString("base64")}`;
      await saveCreationSafely(() => sql`INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${base64Image}, 'image', ${publish ?? false})`);
      res.json({ success: true, content: base64Image });
    }
  } catch (error) {
    console.error("generateImage error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const authData = typeof req.auth === "function" ? req.auth() : req.auth;
    const userId = authData?.userId;
    const image = req.file;
    const plan = req.plan || "free";

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium users.",
      });
    }

    if (!image) {
      return res.json({ success: false, message: "Please upload an image." });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          background_removal: "remove_the_background",
        },
      ],
    });

    await saveCreationSafely(() => sql`INSERT INTO creations (user_id, prompt, content, type)
              VALUES (${userId}, 'Remove Background from image', ${secure_url}, 'image')`);

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("removeImageBackground error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const authData = typeof req.auth === "function" ? req.auth() : req.auth;
    const userId = authData?.userId;
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan || "free";

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium users.",
      });
    }

    if (!image) {
      return res.json({ success: false, message: "Please upload an image." });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    await saveCreationSafely(() => sql`INSERT INTO creations (user_id, prompt, content, type)
              VALUES (${userId}, ${`remove ${object} from image`}, ${imageUrl}, 'image')`);

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    console.error("removeImageObject error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const reviewResume = async (req, res) => {
  try {
    const authData = typeof req.auth === "function" ? req.auth() : req.auth;
    const userId = authData?.userId;
    const resume = req.file;
    const plan = req.plan || "free";
    const free_usage = req.free_usage || 0;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Free usage limit reached. Upgrade to premium for more usage.",
      });
    }

    if (!resume) {
      return res.json({
        success: false,
        message: "Please upload a resume file.",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds 5MB limit.",
      });
    }

    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    const prompt = `Review the following resume and provide a structured evaluation.
Break feedback into three sections:
(1) Strengths
(2) Weaknesses
(3) Areas for Improvement + Overall ATS Score (0-100) with key keywords to add.

Resume Content:
\n\n${pdfData.text}`;

    const response = await AI.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    });

    const content = response.choices[0].message.content;

    await saveCreationSafely(() => sql`INSERT INTO creations (user_id, prompt, content, type)
              VALUES (${userId}, 'Review uploaded resume', ${content}, 'resume-review')`);

    if (plan !== "premium" && process.env.CLERK_SECRET_KEY) {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: {
            free_usage: free_usage + 1,
          },
        });
      } catch (err) {
        console.warn("Could not update metadata:", err.message);
      }
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("reviewResume error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const reviewCode = async (req, res) => {
  try {
    const authData = typeof req.auth === "function" ? req.auth() : req.auth;
    const userId = authData?.userId;
    const { code, language = "JavaScript", focus = "Full Code Audit" } = req.body;
    const plan = req.plan || "free";
    const free_usage = req.free_usage || 0;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Free usage limit reached. Upgrade to premium for more usage.",
      });
    }

    if (!code || !code.trim()) {
      return res.json({
        success: false,
        message: "Please provide code to review.",
      });
    }

    const systemPrompt = `You are a Principal Software Architect and Senior Code Reviewer. Review the provided ${language} code with a focus on "${focus}".
Format your response in Markdown with clear sections:
1. **Summary & Overall Quality Score (1-10)**
2. **Key Findings & Issues (Bugs, Security, Performance, Best Practices)**
3. **Refactored & Optimized Code** (enclosed in appropriate markdown code fence)
4. **Explanation of Improvements & Next Steps**`;

    const response = await AI.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Language: ${language}\nFocus: ${focus}\n\nCode to review:\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\`` },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content;

    await saveCreationSafely(() => sql`INSERT INTO creations (user_id, prompt, content, type)
              VALUES (${userId}, ${`Code Review (${language} - ${focus}): ${code.slice(0, 80)}...`}, ${content}, 'code-review')`);

    if (plan !== "premium" && process.env.CLERK_SECRET_KEY) {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: {
            free_usage: free_usage + 1,
          },
        });
      } catch (err) {
        console.warn("Could not update metadata:", err.message);
      }
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("reviewCode error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const summarizeText = async (req, res) => {
  try {
    const authData = typeof req.auth === "function" ? req.auth() : req.auth;
    const userId = authData?.userId;
    const { text, format = "Key Bullet Points", length = "Medium" } = req.body;
    const plan = req.plan || "free";
    const free_usage = req.free_usage || 0;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Free usage limit reached. Upgrade to premium for more usage.",
      });
    }

    if (!text || !text.trim()) {
      return res.json({
        success: false,
        message: "Please enter text to summarize.",
      });
    }

    const prompt = `Summarize the following text in format "${format}" with length level "${length}".
Make it well-structured, clear, actionable, and formatted in clean Markdown.

Text:
${text}`;

    const response = await AI.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    await saveCreationSafely(() => sql`INSERT INTO creations (user_id, prompt, content, type)
              VALUES (${userId}, ${`Summarize (${format}): ${text.slice(0, 80)}...`}, ${content}, 'summarize')`);

    if (plan !== "premium" && process.env.CLERK_SECRET_KEY) {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: {
            free_usage: free_usage + 1,
          },
        });
      } catch (err) {
        console.warn("Could not update metadata:", err.message);
      }
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("summarizeText error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateEmail = async (req, res) => {
  try {
    const authData = typeof req.auth === "function" ? req.auth() : req.auth;
    const userId = authData?.userId;
    const { topic, goal = "Professional Follow-up", tone = "Professional", recipient = "" } = req.body;
    const plan = req.plan || "free";
    const free_usage = req.free_usage || 0;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Free usage limit reached. Upgrade to premium for more usage.",
      });
    }

    if (!topic || !topic.trim()) {
      return res.json({
        success: false,
        message: "Please provide the email topic or details.",
      });
    }

    const prompt = `Write a high-converting, polished email.
Goal: ${goal}
Tone: ${tone}
${recipient ? `Recipient: ${recipient}` : ""}
Details / Topic: ${topic}

Please format the response in Markdown:
**Subject:** [Eye-catching subject line]

---

[Email body with proper salutation, concise message, clear call to action, and professional sign-off with placeholders like [Your Name] in brackets]`;

    const response = await AI.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = response.choices[0].message.content;

    await saveCreationSafely(() => sql`INSERT INTO creations (user_id, prompt, content, type)
              VALUES (${userId}, ${`Email (${goal} - ${tone}): ${topic.slice(0, 80)}...`}, ${content}, 'email')`);

    if (plan !== "premium" && process.env.CLERK_SECRET_KEY) {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: {
            free_usage: free_usage + 1,
          },
        });
      } catch (err) {
        console.warn("Could not update metadata:", err.message);
      }
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("generateEmail error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const improveGrammar = async (req, res) => {
  try {
    const authData = typeof req.auth === "function" ? req.auth() : req.auth;
    const userId = authData?.userId;
    const { text, mode = "Fix Grammar & Spelling" } = req.body;
    const plan = req.plan || "free";
    const free_usage = req.free_usage || 0;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Free usage limit reached. Upgrade to premium for more usage.",
      });
    }

    if (!text || !text.trim()) {
      return res.json({
        success: false,
        message: "Please enter text to improve.",
      });
    }

    const prompt = `You are an expert editor and writing coach.
Mode: "${mode}"
Task: Rewrite and improve the following text according to the selected mode while preserving its original meaning.

Original Text:
${text}

Format the response in Markdown with:
### ✨ Improved Version
[Your improved text here]

### 📝 Key Changes & Feedback
- List 2-3 brief bullet points explaining what was corrected or enhanced.`;

    const response = await AI.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 900,
    });

    const content = response.choices[0].message.content;

    await saveCreationSafely(() => sql`INSERT INTO creations (user_id, prompt, content, type)
              VALUES (${userId}, ${`Grammar (${mode}): ${text.slice(0, 80)}...`}, ${content}, 'grammar')`);

    if (plan !== "premium" && process.env.CLERK_SECRET_KEY) {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: {
            free_usage: free_usage + 1,
          },
        });
      } catch (err) {
        console.warn("Could not update metadata:", err.message);
      }
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("improveGrammar error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateSocialContent = async (req, res) => {
  try {
    const authData = typeof req.auth === "function" ? req.auth() : req.auth;
    const userId = authData?.userId;
    const { topic, platform = "LinkedIn Post", tone = "Engaging & Professional", includeHashtags = true } = req.body;
    const plan = req.plan || "free";
    const free_usage = req.free_usage || 0;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Free usage limit reached. Upgrade to premium for more usage.",
      });
    }

    if (!topic || !topic.trim()) {
      return res.json({
        success: false,
        message: "Please enter a topic for the social post.",
      });
    }

    const prompt = `Create an optimized, viral-ready ${platform}.
Topic / Context: ${topic}
Tone: ${tone}
Include Hashtags & Call to Action: ${includeHashtags ? "Yes" : "No"}

Formatting instructions:
- For LinkedIn: High hook, short spaced paragraphs, actionable takeaways, engaging discussion question at end.
- For Twitter / X: Thread format (1/n, 2/n) or punchy standalone tweet with high engagement hook.
- For Instagram: Catchy caption, aesthetic formatting, 5-8 targeted hashtags at bottom.
- For YouTube: Video title ideas + SEO-optimized description + timestamp outline.

Format output in clean Markdown.`;

    const response = await AI.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    await saveCreationSafely(() => sql`INSERT INTO creations (user_id, prompt, content, type)
              VALUES (${userId}, ${`Social (${platform}): ${topic.slice(0, 80)}...`}, ${content}, 'social')`);

    if (plan !== "premium" && process.env.CLERK_SECRET_KEY) {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: {
            free_usage: free_usage + 1,
          },
        });
      } catch (err) {
        console.warn("Could not update metadata:", err.message);
      }
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("generateSocialContent error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const translateContent = async (req, res) => {
  try {
    const authData = typeof req.auth === "function" ? req.auth() : req.auth;
    const userId = authData?.userId;
    const { text, targetLanguage = "Spanish", tone = "Natural & Fluent" } = req.body;
    const plan = req.plan || "free";
    const free_usage = req.free_usage || 0;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Free usage limit reached. Upgrade to premium for more usage.",
      });
    }

    if (!text || !text.trim()) {
      return res.json({
        success: false,
        message: "Please enter text to translate.",
      });
    }

    const prompt = `You are a professional multilingual translator and cultural localization expert.
Translate the following text into ${targetLanguage} with a "${tone}" tone.
Ensure accurate phrasing, natural idioms, and preserve the original intent and markdown structure.

Text to translate:
${text}

Provide the translated text directly in clean Markdown.`;

    const response = await AI.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1200,
    });

    const content = response.choices[0].message.content;

    await saveCreationSafely(() => sql`INSERT INTO creations (user_id, prompt, content, type)
              VALUES (${userId}, ${`Translate (${targetLanguage}): ${text.slice(0, 80)}...`}, ${content}, 'translate')`);

    if (plan !== "premium" && process.env.CLERK_SECRET_KEY) {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: {
            free_usage: free_usage + 1,
          },
        });
      } catch (err) {
        console.warn("Could not update metadata:", err.message);
      }
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("translateContent error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

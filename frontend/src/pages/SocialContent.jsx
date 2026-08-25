import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { Share2, Sparkles, Copy, Check, Download } from "lucide-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const SocialContent = () => {
  const platforms = [
    "LinkedIn Post",
    "Twitter / X Thread",
    "Instagram Caption",
    "YouTube Description",
  ];

  const toneOptions = [
    "Viral & Engaging",
    "Professional & Thought-Leader",
    "Educational & Informative",
    "Storytelling & Inspiring",
    "Humorous & Casual",
  ];

  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
  const [selectedTone, setSelectedTone] = useState(toneOptions[0]);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!topic.trim()) {
      return toast.error("Please enter a topic for your social post.");
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        "/api/ai/generate-social-content",
        {
          topic,
          platform: selectedPlatform,
          tone: selectedTone,
          includeHashtags,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Post copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPost = () => {
    if (!content) return;
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `social-post-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Post saved as text!");
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left Column */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#F59E0B]" />
          <h1 className="text-xl font-semibold">Social Media Creator</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Target Platform</p>
        <div className="mt-2 flex gap-2 flex-wrap">
          {platforms.map((platform) => (
            <span
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`text-xs px-3 py-1 border rounded-full cursor-pointer transition-colors ${
                selectedPlatform === platform
                  ? "bg-amber-50 border-amber-500 text-amber-700 font-medium"
                  : "text-gray-500 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {platform}
            </span>
          ))}
        </div>

        <p className="mt-4 text-sm font-medium">Tone & Style</p>
        <div className="mt-2 flex gap-2 flex-wrap">
          {toneOptions.map((tone) => (
            <span
              key={tone}
              onClick={() => setSelectedTone(tone)}
              className={`text-xs px-3 py-1 border rounded-full cursor-pointer transition-colors ${
                selectedTone === tone
                  ? "bg-amber-50 border-amber-500 text-amber-700 font-medium"
                  : "text-gray-500 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {tone}
            </span>
          ))}
        </div>

        <p className="mt-4 text-sm font-medium">Post Topic / Story / Announcement</p>
        <textarea
          onChange={(e) => setTopic(e.target.value)}
          value={topic}
          rows={5}
          className="w-full p-3 mt-1.5 outline-none text-sm rounded-md border border-gray-300 focus:border-amber-500 resize-y"
          placeholder="e.g. Launched our new AI product today, 5 lessons learned while building SaaS from scratch, why remote work is the future..."
          required
        />

        <div className="my-4 flex items-center gap-2">
          <label className="relative cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => setIncludeHashtags(e.target.checked)}
              checked={includeHashtags}
              className="sr-only peer"
            />
            <div className="w-9 h-5 rounded-full bg-slate-300 peer-checked:bg-amber-500 transition"></div>
            <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4"></span>
          </label>
          <p className="text-sm">Include relevant hashtags & call to action</p>
        </div>

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white px-4 py-2 mt-2 text-sm rounded-lg cursor-pointer hover:opacity-95 transition"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Share2 className="w-5" />
          )}
          Generate Social Post
        </button>
      </form>

      {/* Right Column */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 flex flex-col min-h-96 max-h-[600px]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5 text-[#F59E0B]" />
            <h1 className="text-xl font-semibold">Ready to Post</h1>
          </div>
          {content && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-md transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={downloadPost}
                className="flex items-center gap-1.5 text-xs text-white bg-gradient-to-r from-[#F59E0B] to-[#D97706] px-2.5 py-1.5 rounded-md transition"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          )}
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-4 text-gray-300 text-center">
              <Share2 className="w-10 h-10" />
              <p>Enter your topic on the left and click 'Generate Social Post'</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 h-full overflow-y-scroll text-sm text-slate-700 pr-1">
            <div className="reset-tw">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialContent;

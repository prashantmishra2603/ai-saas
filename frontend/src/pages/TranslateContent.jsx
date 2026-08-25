import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { Languages, Sparkles, Copy, Check, Download } from "lucide-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const TranslateContent = () => {
  const languages = [
    "Spanish",
    "French",
    "German",
    "Hindi",
    "Japanese",
    "Chinese (Simplified)",
    "Arabic",
    "Portuguese",
    "Italian",
    "Russian",
    "Korean",
    "Dutch",
  ];

  const toneOptions = [
    "Natural & Fluent",
    "Professional & Formal",
    "Casual & Conversational",
    "Literary & Expressive",
  ];

  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [selectedTone, setSelectedTone] = useState(toneOptions[0]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      return toast.error("Please enter text to translate.");
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        "/api/ai/translate-content",
        {
          text,
          targetLanguage: selectedLanguage,
          tone: selectedTone,
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
    toast.success("Translation copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTranslation = () => {
    if (!content) return;
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `translated-${selectedLanguage.toLowerCase()}-${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Translation downloaded!");
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left Column */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#6366F1]" />
          <h1 className="text-xl font-semibold">AI Multilingual Translator</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Target Language</p>
        <div className="mt-2 flex gap-2 flex-wrap">
          {languages.map((lang) => (
            <span
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`text-xs px-3 py-1 border rounded-full cursor-pointer transition-colors ${
                selectedLanguage === lang
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-medium"
                  : "text-gray-500 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {lang}
            </span>
          ))}
        </div>

        <p className="mt-4 text-sm font-medium">Translation Tone</p>
        <div className="mt-2 flex gap-2 flex-wrap">
          {toneOptions.map((tone) => (
            <span
              key={tone}
              onClick={() => setSelectedTone(tone)}
              className={`text-xs px-3 py-1 border rounded-full cursor-pointer transition-colors ${
                selectedTone === tone
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-medium"
                  : "text-gray-500 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {tone}
            </span>
          ))}
        </div>

        <p className="mt-4 text-sm font-medium">Source Text</p>
        <textarea
          onChange={(e) => setText(e.target.value)}
          value={text}
          rows={7}
          className="w-full p-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-indigo-500 resize-y"
          placeholder="Paste or write any text to translate naturally..."
          required
        />

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white px-4 py-2 mt-5 text-sm rounded-lg cursor-pointer hover:opacity-95 transition"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Languages className="w-5" />
          )}
          Translate to {selectedLanguage}
        </button>
      </form>

      {/* Right Column */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 flex flex-col min-h-96 max-h-[600px]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Languages className="w-5 h-5 text-[#6366F1]" />
            <h1 className="text-xl font-semibold">{selectedLanguage} Translation</h1>
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
                onClick={downloadTranslation}
                className="flex items-center gap-1.5 text-xs text-white bg-gradient-to-r from-[#6366F1] to-[#4F46E5] px-2.5 py-1.5 rounded-md transition"
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
              <Languages className="w-10 h-10" />
              <p>Enter text on the left and click 'Translate'</p>
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

export default TranslateContent;

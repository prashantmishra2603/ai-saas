import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { SpellCheck, Sparkles, Copy, Check, Download } from "lucide-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GrammarImprover = () => {
  const modes = [
    "Fix Grammar & Spelling",
    "Make More Professional",
    "Simplify & Clarify",
    "Engaging & Persuasive",
    "Shorten & Condense",
  ];

  const [selectedMode, setSelectedMode] = useState(modes[0]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      return toast.error("Please enter text to enhance.");
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        "/api/ai/improve-grammar",
        {
          text,
          mode: selectedMode,
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
    toast.success("Improved text copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = () => {
    if (!content) return;
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `improved-text-${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Downloaded as Markdown!");
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left Column */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#10B981]" />
          <h1 className="text-xl font-semibold">Grammar & Tone Improver</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Enhancement Mode</p>
        <div className="mt-2 flex gap-2 flex-wrap">
          {modes.map((mode) => (
            <span
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`text-xs px-3 py-1 border rounded-full cursor-pointer transition-colors ${
                selectedMode === mode
                  ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-medium"
                  : "text-gray-500 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {mode}
            </span>
          ))}
        </div>

        <p className="mt-4 text-sm font-medium">Your Text</p>
        <textarea
          onChange={(e) => setText(e.target.value)}
          value={text}
          rows={7}
          className="w-full p-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-emerald-500 resize-y"
          placeholder="Paste drafts, emails, essays, or rough notes with typos here..."
          required
        />

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-4 py-2 mt-5 text-sm rounded-lg cursor-pointer hover:opacity-95 transition"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <SpellCheck className="w-5" />
          )}
          Enhance & Perfect Text
        </button>
      </form>

      {/* Right Column */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 flex flex-col min-h-96 max-h-[600px]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SpellCheck className="w-5 h-5 text-[#10B981]" />
            <h1 className="text-xl font-semibold">Improved Output</h1>
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
                onClick={downloadText}
                className="flex items-center gap-1.5 text-xs text-white bg-gradient-to-r from-[#10B981] to-[#059669] px-2.5 py-1.5 rounded-md transition"
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
              <SpellCheck className="w-10 h-10" />
              <p>Enter text on the left and click 'Enhance & Perfect Text'</p>
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

export default GrammarImprover;

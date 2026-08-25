import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { AlignLeft, Sparkles, Copy, Check, Download } from "lucide-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const SummarizeText = () => {
  const formatOptions = [
    "Key Bullet Points",
    "Executive Brief",
    "ELI5 (Simple Explanation)",
    "TL;DR (1 Sentence)",
    "Action Items & Takeaways",
  ];

  const lengthOptions = [
    "Concise (Quick read)",
    "Medium (Balanced)",
    "Comprehensive (Detailed)",
  ];

  const [selectedFormat, setSelectedFormat] = useState(formatOptions[0]);
  const [selectedLength, setSelectedLength] = useState(lengthOptions[1]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      return toast.error("Please enter text to summarize.");
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        "/api/ai/summarize-text",
        {
          text,
          format: selectedFormat,
          length: selectedLength,
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
    toast.success("Summary copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSummary = () => {
    if (!content) return;
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `summary-${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Summary downloaded!");
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left Column */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#8B5CF6]" />
          <h1 className="text-xl font-semibold">AI Text Summarizer</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Summary Format</p>
        <div className="mt-2 flex gap-2 flex-wrap">
          {formatOptions.map((item) => (
            <span
              key={item}
              onClick={() => setSelectedFormat(item)}
              className={`text-xs px-3 py-1 border rounded-full cursor-pointer transition-colors ${
                selectedFormat === item
                  ? "bg-purple-50 border-purple-600 text-purple-700 font-medium"
                  : "text-gray-500 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        <p className="mt-4 text-sm font-medium">Length</p>
        <div className="mt-2 flex gap-2 flex-wrap">
          {lengthOptions.map((item) => (
            <span
              key={item}
              onClick={() => setSelectedLength(item)}
              className={`text-xs px-3 py-1 border rounded-full cursor-pointer transition-colors ${
                selectedLength === item
                  ? "bg-purple-50 border-purple-600 text-purple-700 font-medium"
                  : "text-gray-500 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        <p className="mt-4 text-sm font-medium">Original Content / Article</p>
        <textarea
          onChange={(e) => setText(e.target.value)}
          value={text}
          rows={7}
          className="w-full p-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-purple-500 resize-y"
          placeholder="Paste meeting notes, research paper, article or transcript here..."
          required
        />

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white px-4 py-2 mt-5 text-sm rounded-lg cursor-pointer hover:opacity-95 transition"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <AlignLeft className="w-5" />
          )}
          Generate Summary
        </button>
      </form>

      {/* Right Column */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 flex flex-col min-h-96 max-h-[600px]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlignLeft className="w-5 h-5 text-[#8B5CF6]" />
            <h1 className="text-xl font-semibold">Generated Summary</h1>
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
                onClick={downloadSummary}
                className="flex items-center gap-1.5 text-xs text-white bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] px-2.5 py-1.5 rounded-md transition"
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
              <AlignLeft className="w-10 h-10" />
              <p>Paste text on the left and click 'Generate Summary'</p>
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

export default SummarizeText;

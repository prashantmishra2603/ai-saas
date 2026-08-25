import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { Mail, Sparkles, Copy, Check, Download } from "lucide-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const EmailWriter = () => {
  const emailGoals = [
    "Cold Outreach",
    "Professional Follow-up",
    "Meeting Request",
    "Job Application",
    "Client Proposal",
    "Customer Support",
  ];

  const toneOptions = [
    "Professional",
    "Friendly & Warm",
    "Persuasive & Direct",
    "Urgent",
    "Formal",
  ];

  const [selectedGoal, setSelectedGoal] = useState(emailGoals[0]);
  const [selectedTone, setSelectedTone] = useState(toneOptions[0]);
  const [recipient, setRecipient] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!topic.trim()) {
      return toast.error("Please provide email details or key points.");
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        "/api/ai/generate-email",
        {
          topic,
          goal: selectedGoal,
          tone: selectedTone,
          recipient,
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
    toast.success("Email copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadEmail = () => {
    if (!content) return;
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `email-draft-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Email draft downloaded!");
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left Column */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#EC4899]" />
          <h1 className="text-xl font-semibold">AI Email Generator</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Email Purpose / Goal</p>
        <div className="mt-2 flex gap-2 flex-wrap">
          {emailGoals.map((goal) => (
            <span
              key={goal}
              onClick={() => setSelectedGoal(goal)}
              className={`text-xs px-3 py-1 border rounded-full cursor-pointer transition-colors ${
                selectedGoal === goal
                  ? "bg-pink-50 border-pink-500 text-pink-700 font-medium"
                  : "text-gray-500 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {goal}
            </span>
          ))}
        </div>

        <p className="mt-4 text-sm font-medium">Tone</p>
        <div className="mt-2 flex gap-2 flex-wrap">
          {toneOptions.map((tone) => (
            <span
              key={tone}
              onClick={() => setSelectedTone(tone)}
              className={`text-xs px-3 py-1 border rounded-full cursor-pointer transition-colors ${
                selectedTone === tone
                  ? "bg-pink-50 border-pink-500 text-pink-700 font-medium"
                  : "text-gray-500 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {tone}
            </span>
          ))}
        </div>

        <p className="mt-4 text-sm font-medium">Recipient Name / Company (Optional)</p>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="e.g. Alex, Head of Product at Acme Corp"
          className="w-full p-2.5 px-3 mt-1.5 outline-none text-sm rounded-md border border-gray-300 focus:border-pink-500"
        />

        <p className="mt-4 text-sm font-medium">Key Points / What should the email say?</p>
        <textarea
          onChange={(e) => setTopic(e.target.value)}
          value={topic}
          rows={5}
          className="w-full p-3 mt-1.5 outline-none text-sm rounded-md border border-gray-300 focus:border-pink-500 resize-y"
          placeholder="e.g. Introduce our AI analytics tool, mention 30% time saving, ask for a quick 15-min call next Tuesday..."
          required
        />

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#EC4899] to-[#BE185D] text-white px-4 py-2 mt-5 text-sm rounded-lg cursor-pointer hover:opacity-95 transition"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Mail className="w-5" />
          )}
          Generate Professional Email
        </button>
      </form>

      {/* Right Column */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 flex flex-col min-h-96 max-h-[600px]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-[#EC4899]" />
            <h1 className="text-xl font-semibold">Generated Email</h1>
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
                onClick={downloadEmail}
                className="flex items-center gap-1.5 text-xs text-white bg-gradient-to-r from-[#EC4899] to-[#BE185D] px-2.5 py-1.5 rounded-md transition"
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
              <Mail className="w-10 h-10" />
              <p>Enter email details and click 'Generate Professional Email'</p>
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

export default EmailWriter;

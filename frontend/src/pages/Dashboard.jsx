import React, { useEffect, useState } from "react";
import { Gem, Sparkles, Search, Layers, ArrowUpRight } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import CreationItem from "../components/CreationItem";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const filterCategories = [
  { id: "all", label: "All Items" },
  { id: "article", label: "Articles" },
  { id: "blog-title", label: "Blog Titles" },
  { id: "image", label: "Images" },
  { id: "code-review", label: "Code Reviews" },
  { id: "summarize", label: "Summaries" },
  { id: "email", label: "Emails" },
  { id: "grammar", label: "Grammar" },
  { id: "social", label: "Social Posts" },
  { id: "translate", label: "Translations" },
  { id: "resume-review", label: "Resumes" },
];

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [updatingPlan, setUpdatingPlan] = useState(false);

  const { getToken } = useAuth();
  const { user } = useUser();

  const isPremium = Boolean(
    user?.publicMetadata?.plan === "premium" ||
    user?.publicMetadata?.role === "admin" ||
    user?.unsafeMetadata?.plan === "premium"
  );

  const togglePlanSwitch = async () => {
    if (!user) return;
    try {
      setUpdatingPlan(true);
      const nextPlan = isPremium ? "free" : "premium";
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          plan: nextPlan,
        },
      });
      toast.success(nextPlan === "premium" ? "Switched to Premium Plan! ✨" : "Switched to Free Plan.");
    } catch (error) {
      toast.error(error.message);
    }
    setUpdatingPlan(false);
  };

  const getDashboardData = async () => {
    try {
      const { data } = await axios.get("/api/user/get-user-creations", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        setCreations(data.creations || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleDeleteCreation = async (id) => {
    try {
      const { data } = await axios.post(
        "/api/user/delete-creation",
        { id },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        setCreations((prev) => prev.filter((item) => item.id !== id));
        toast.success("Creation deleted.");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  const filteredCreations = creations.filter((item) => {
    const matchesFilter =
      selectedFilter === "all" || item.type === selectedFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      item.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="h-full overflow-y-scroll p-6">
      {/* Top Metric Cards */}
      <div className="flex justify-start gap-4 flex-wrap">
        {/* Total creations card */}
        <div className="flex justify-between items-center w-72 p-4 px-5 bg-white rounded-xl border border-gray-200 shadow-xs">
          <div className="text-slate-600">
            <p className="text-sm">Total Creations</p>
            <h2 className="text-xl font-semibold text-slate-800">
              {creations.length}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center">
            <Sparkles className="w-5 text-white" />
          </div>
        </div>

        {/* Active plan card */}
        <div className="flex justify-between items-center w-72 p-4 px-5 bg-white rounded-xl border border-gray-200 shadow-xs">
          <div className="text-slate-600">
            <div className="flex items-center gap-2">
              <p className="text-sm">Active Plan</p>
              <button
                type="button"
                disabled={updatingPlan}
                onClick={togglePlanSwitch}
                className="text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full border border-purple-200 cursor-pointer transition flex items-center gap-0.5"
                title="Click to toggle between Free & Premium"
              >
                {updatingPlan ? "..." : isPremium ? "Switch Free" : "Upgrade"}
                <ArrowUpRight className="w-2.5 h-2.5" />
              </button>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mt-0.5">
              {isPremium ? (
                <span className="text-purple-600 font-bold">Premium ✨</span>
              ) : (
                "Free"
              )}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center">
            <Gem className="w-5 text-white" />
          </div>
        </div>

        {/* Tools Available card */}
        <div className="flex justify-between items-center w-72 p-4 px-5 bg-white rounded-xl border border-gray-200 shadow-xs">
          <div className="text-slate-600">
            <p className="text-sm">AI Tools Ready</p>
            <h2 className="text-xl font-semibold text-slate-800">12 Tools</h2>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] text-white flex justify-center items-center">
            <Layers className="w-5 text-white" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Your Creations & History
          </h3>
          <p className="text-xs text-gray-500">
            Manage, search, copy, and export your past generations
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creations..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-2 flex-wrap pb-2">
        {filterCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedFilter(cat.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition cursor-pointer ${
              selectedFilter === cat.id
                ? "bg-slate-800 text-white border-slate-800 shadow-xs"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Recent Creations List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="w-10 h-10 my-1 rounded-full border-3 border-blue-500 border-t-transparent animate-spin"></span>
        </div>
      ) : filteredCreations.length === 0 ? (
        <div className="mt-6 p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center flex flex-col items-center justify-center">
          <Sparkles className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-600">
            No creations found
          </p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            {searchQuery || selectedFilter !== "all"
              ? "Try adjusting your search query or filter category."
              : "Generate articles, titles, code reviews, emails, or images using the sidebar tools to see them here!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {filteredCreations.map((item) => (
            <CreationItem
              key={item.id}
              item={item}
              onDelete={handleDeleteCreation}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
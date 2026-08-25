import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Layout from "./pages/Layout";
import RemoveObject from "./pages/RemoveObject";
import WriteArticle from "./pages/WriteArticle";
import ReviewResume from "./pages/ReviewResume";
import Community from "./pages/Community";
import GenerateImages from "./pages/GenerateImages";
import BlogTitles from "./pages/BlogTitles";
import Dashboard from "./pages/Dashboard";
import RemoveBackground from "./pages/RemoveBackground";
import CodeReview from "./pages/CodeReview";
import SummarizeText from "./pages/SummarizeText";
import EmailWriter from "./pages/EmailWriter";
import GrammarImprover from "./pages/GrammarImprover";
import SocialContent from "./pages/SocialContent";
import TranslateContent from "./pages/TranslateContent";
import { useAuth } from "@clerk/clerk-react";

const App = () => {
  const { getToken } = useAuth();
  useEffect(() => {
    getToken().then((token) => {
      if (token) {
        console.log("Auth session initialized");
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Toaster position="top-center" />
      
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Home />} />

        {/* AI Dashboard Section - Nested Routes */}
        <Route path="/ai" element={<Layout />}>
          {/* This makes /ai show the Dashboard by default */}
          <Route index element={<Dashboard />} />
          
          {/* AI Tools Routes */}
          <Route path="write-article" element={<WriteArticle />} />
          <Route path="blog-titles" element={<BlogTitles />} />
          <Route path="generate-images" element={<GenerateImages />} />
          <Route path="remove-background" element={<RemoveBackground />} />
          <Route path="remove-object" element={<RemoveObject />} />
          <Route path="review-resume" element={<ReviewResume />} />
          <Route path="review-code" element={<CodeReview />} />
          <Route path="summarize-text" element={<SummarizeText />} />
          <Route path="email-writer" element={<EmailWriter />} />
          <Route path="grammar-improver" element={<GrammarImprover />} />
          <Route path="social-content" element={<SocialContent />} />
          <Route path="translate" element={<TranslateContent />} />
          <Route path="community" element={<Community />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
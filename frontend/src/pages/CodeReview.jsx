import { useState } from "react";
import axios from "axios";

export default function CodeReview() {
  const [code, setCode] = useState("");
  const [review, setReview] = useState("");

  const handleReview = async () => {
    try {
      setReview("Reviewing...");

      const res = await axios.post(
        "http://localhost:5000/api/code/code-review",
        { code }
      );

      setReview(res.data.review);
    } catch (err) {
      setReview("Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>AI Code Review Tool</h2>

      <textarea
        rows="10"
        cols="60"
        placeholder="Paste your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <br />
      <button onClick={handleReview}>Review Code</button>

      <h3>Review Output:</h3>
      <pre>{review}</pre>
    </div>
  );
}

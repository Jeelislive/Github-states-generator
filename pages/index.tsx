import { useState } from "react";
import { themes, Theme } from "@/lib/themes";

type CardType = "stats" | "top-langs" | "streak" | "additional-stats";

export default function Home() {
  const [username, setUsername] = useState("");
  const [cardType, setCardType] = useState<CardType>("stats");
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [showIcons, setShowIcons] = useState(false);
  const [hideBorder, setHideBorder] = useState(false);
  const [hideProgress, setHideProgress] = useState(false);
  const [layout, setLayout] = useState("default");
  const [show, setShow] = useState<string[]>([]);
  const [bgColor, setBgColor] = useState("");
  const [titleColor, setTitleColor] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const buildUrl = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    let url = "";

    if (cardType === "stats") {
      url = `${baseUrl}/api?username=${username}`;
    } else if (cardType === "top-langs") {
      url = `${baseUrl}/api/top-langs/?username=${username}`;
    } else if (cardType === "streak") {
      url = `${baseUrl}/api/streak?username=${username}`;
    } else if (cardType === "additional-stats") {
      url = `${baseUrl}/api/additional-stats?username=${username}`;
    }

    const params = new URLSearchParams();
    if (selectedTheme !== "default") params.append("theme", selectedTheme);
    if (showIcons) params.append("show_icons", "true");
    if (hideBorder) params.append("hide_border", "true");
    if (hideProgress) params.append("hide_progress", "true");
    if (layout !== "default" && cardType === "top-langs") params.append("layout", layout);
    if (show.length > 0 && cardType === "stats") params.append("show", show.join(","));
    if (bgColor) params.append("bg_color", bgColor.replace("#", ""));
    if (titleColor) params.append("title_color", titleColor.replace("#", ""));

    const queryString = params.toString();
    return queryString ? `${url}&${queryString}` : url;
  };

  const generateMarkdown = () => {
    const url = buildUrl();
    return `![${cardType === "stats" ? "Stats" : cardType === "top-langs" ? "Top Langs" : cardType === "streak" ? "Streak" : "Additional Stats"}](${url})`;
  };

  const generatePreview = async () => {
    if (!username.trim()) {
      setError("Please enter a GitHub username");
      return;
    }

    setLoading(true);
    setError("");
    setPreviewUrl("");
    
    try {
      const url = buildUrl();
      // Test if the URL is accessible by creating an image
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          setPreviewUrl(url);
          setLoading(false);
          resolve(true);
        };
        img.onerror = () => {
          setError("Failed to generate preview. Please check your username and try again.");
          setLoading(false);
          reject(new Error("Failed to load image"));
        };
        img.src = url;
      });
    } catch (err) {
      setError("An error occurred while generating the preview");
      setLoading(false);
    }
  };

  const copyMarkdown = async () => {
    const markdown = generateMarkdown();
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const toggleShow = (item: string) => {
    if (show.includes(item)) {
      setShow(show.filter((s) => s !== item));
    } else {
      setShow([...show, item]);
    }
  };

  return (
    <div className="container">
      <h1>GitHub Stats Generator</h1>
      <p className="subtitle">Create beautiful, customizable GitHub statistics cards for your profile README</p>

      <div className="grid">
        <div className="card">
          <h2 style={{ marginBottom: "1.5rem", color: "#333" }}>Configuration</h2>

          <div className="form-group">
            <label htmlFor="username">GitHub Username *</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="octocat"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cardType">Card Type</label>
            <select id="cardType" value={cardType} onChange={(e) => setCardType(e.target.value as CardType)}>
              <option value="stats">Stats Card</option>
              <option value="top-langs">Top Languages</option>
              <option value="streak">Streak Card</option>
              <option value="additional-stats">Additional Stats</option>
            </select>
          </div>

          <div className="form-group">
            <label>Theme</label>
            <div className="theme-grid">
              {Object.entries(themes).map(([key, theme]) => (
                <div
                  key={key}
                  className={`theme-item ${selectedTheme === key ? "selected" : ""}`}
                  onClick={() => setSelectedTheme(key)}
                  style={{
                    borderColor: selectedTheme === key ? `#${theme.title_color}` : undefined,
                  }}
                >
                  {theme.name}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Options</label>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="showIcons"
                checked={showIcons}
                onChange={(e) => setShowIcons(e.target.checked)}
              />
              <label htmlFor="showIcons" style={{ margin: 0, fontWeight: "normal" }}>
                Show Icons
              </label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="hideBorder"
                checked={hideBorder}
                onChange={(e) => setHideBorder(e.target.checked)}
              />
              <label htmlFor="hideBorder" style={{ margin: 0, fontWeight: "normal" }}>
                Hide Border
              </label>
            </div>
            {cardType === "stats" && (
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="hideProgress"
                  checked={hideProgress}
                  onChange={(e) => setHideProgress(e.target.checked)}
                />
                <label htmlFor="hideProgress" style={{ margin: 0, fontWeight: "normal" }}>
                  Hide Progress Bars
                </label>
              </div>
            )}
            {cardType === "top-langs" && (
              <div className="form-group">
                <label htmlFor="layout">Layout</label>
                <select id="layout" value={layout} onChange={(e) => setLayout(e.target.value)}>
                  <option value="default">Default</option>
                  <option value="compact">Compact</option>
                </select>
              </div>
            )}
            {cardType === "stats" && (
              <div className="form-group">
                <label>Additional Metrics</label>
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="showReviews"
                    checked={show.includes("reviews")}
                    onChange={() => toggleShow("reviews")}
                  />
                  <label htmlFor="showReviews" style={{ margin: 0, fontWeight: "normal" }}>
                    Show Reviews
                  </label>
                </div>
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="showPRsMerged"
                    checked={show.includes("prs_merged")}
                    onChange={() => toggleShow("prs_merged")}
                  />
                  <label htmlFor="showPRsMerged" style={{ margin: 0, fontWeight: "normal" }}>
                    Show PRs Merged
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="bgColor">Custom Background Color (optional)</label>
            <input
              type="color"
              id="bgColor"
              value={bgColor || "#ffffff"}
              onChange={(e) => setBgColor(e.target.value)}
              style={{ width: "100%", height: "50px", cursor: "pointer" }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="titleColor">Custom Title Color (optional)</label>
            <input
              type="color"
              id="titleColor"
              value={titleColor || "#2f80ed"}
              onChange={(e) => setTitleColor(e.target.value)}
              style={{ width: "100%", height: "50px", cursor: "pointer" }}
            />
          </div>

          <button 
            className="button" 
            onClick={generatePreview}
            disabled={loading || !username.trim()}
            style={{ marginTop: "1.5rem" }}
          >
            {loading ? "Generating..." : "Generate Preview"}
          </button>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: "1.5rem", color: "#333" }}>Preview</h2>
          <div className="preview-container">
            {loading ? (
              <div className="loading">
                <div style={{ fontSize: "18px", marginBottom: "10px" }}>⏳</div>
                Generating preview...
              </div>
            ) : previewUrl ? (
              <img src={previewUrl} alt="Preview" onError={() => setError("Failed to load preview")} />
            ) : (
              <div className="loading">
                <div style={{ fontSize: "18px", marginBottom: "10px" }}>👆</div>
                Configure your card and click "Generate Preview"
              </div>
            )}
          </div>

          {error && <div className="error">{error}</div>}

          {previewUrl && (
            <>
              <div className="form-group">
                <label>Markdown Code</label>
                <div className="markdown-output">{generateMarkdown()}</div>
                <button className={`button copy-button ${copied ? "copied" : ""}`} onClick={copyMarkdown}>
                  {copied ? "✓ Copied!" : "Copy Markdown"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


import { NextApiRequest, NextApiResponse } from "next";
import { getStreakStats } from "@/lib/github";
import { generateStreakCard } from "@/lib/svg";
import { getTheme } from "@/lib/themes";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, theme = "default", show_icons, hide_border, bg_color, title_color } = req.query;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const streak = await getStreakStats(username);
    let selectedTheme = getTheme(theme as string);

    // Override theme colors if custom colors provided
    if (bg_color && typeof bg_color === "string") {
      selectedTheme = { ...selectedTheme, bg_color: bg_color.replace("#", "") };
    }
    if (title_color && typeof title_color === "string") {
      selectedTheme = { ...selectedTheme, title_color: title_color.replace("#", "") };
    }

    const svg = generateStreakCard(streak, selectedTheme, {
      showIcons: show_icons === "true",
      hideBorder: hide_border === "true",
    });

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    return res.status(200).send(svg);
  } catch (error: any) {
    console.error("Error generating streak card:", error);
    
    const errorSvg = `<svg width="540" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="540" height="200" fill="#f0f0f0" stroke="#d0d0d0" stroke-width="1.5" rx="8"/>
      <text x="270" y="100" font-family="Arial, sans-serif" font-size="16" fill="#666" text-anchor="middle">
        ${error.status === 403 ? "Rate limit exceeded. Please try again later." : "Failed to load stats"}
      </text>
    </svg>`;
    
    res.setHeader("Content-Type", "image/svg+xml");
    return res.status(200).send(errorSvg);
  }
}


import { Theme, getTheme } from "./themes";
import { GitHubStats, LanguageStats, StreakStats } from "./github";
import { getIconPath } from "./svg-icons";

// Helper to escape XML/SVG content
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Helper to ensure valid hex color
function ensureHexColor(color: string): string {
  // Remove # if present
  color = color.replace("#", "");
  // Ensure it's 6 characters
  if (color.length === 3) {
    color = color.split("").map((c) => c + c).join("");
  }
  // Validate hex
  if (!/^[0-9A-Fa-f]{6}$/.test(color)) {
    return "ffffff";
  }
  return color;
}

export function generateStatsCard(
  stats: GitHubStats,
  theme: Theme,
  options: {
    showIcons?: boolean;
    hideBorder?: boolean;
    hideProgress?: boolean;
    show?: string[];
  }
): string {
  const { showIcons = false, hideBorder = false, hideProgress = false, show = [] } = options;

  const items = [
    { label: "Total Commits", value: stats.totalCommits.toLocaleString(), icon: "commits" },
    { label: "Total PRs", value: stats.totalPRs.toLocaleString(), icon: "prs" },
    { label: "Total Issues", value: stats.totalIssues.toLocaleString(), icon: "issues" },
    { label: "Stars Earned", value: stats.totalStars.toLocaleString(), icon: "stars" },
    { label: "Forks", value: stats.totalForks.toLocaleString(), icon: "forks" },
  ];

  if (show.includes("reviews")) {
    items.push({ label: "Reviews", value: stats.totalReviews.toLocaleString(), icon: "reviews" });
  }
  if (show.includes("prs_merged")) {
    items.push({
      label: "PRs Merged",
      value: `${stats.prsMerged.toLocaleString()} (${stats.prsMergedPercentage}%)`,
      icon: "merged",
    });
  }

  const bgColor = ensureHexColor(theme.bg_color);
  const borderColor = ensureHexColor(theme.border_color);
  const titleColor = ensureHexColor(theme.title_color);
  const textColor = ensureHexColor(theme.text_color);
  const iconColor = ensureHexColor(theme.icon_color);

  const borderStyle = hideBorder ? "" : `stroke="#${borderColor}" stroke-width="1"`;
  const iconSize = 20;
  const iconX = 30;
  const itemHeight = 45;
  const startY = 70;
  const cardWidth = 550;
  const padding = 30;
  const headerHeight = 50;
  const cardHeight = headerHeight + items.length * itemHeight + 30;

  // Calculate opacity for border color
  const borderOpacity = hideBorder ? "0" : "0.3";

  let svg = `<svg width="${cardWidth}" height="${cardHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        .title { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; opacity: 0.9; }
        .value { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 700; }
      </style>
    </defs>
    <!-- Card background with shadow effect -->
    <rect width="${cardWidth}" height="${cardHeight}" fill="#${bgColor}" ${borderStyle} rx="10" opacity="1"/>
    ${!hideBorder ? `<rect x="0.5" y="0.5" width="${cardWidth - 1}" height="${cardHeight - 1}" fill="none" stroke="#${borderColor}" stroke-width="1" rx="10" opacity="${borderOpacity}"/>` : ""}
    
    <!-- Header section -->
    <rect width="${cardWidth}" height="${headerHeight}" fill="#${bgColor}" rx="10"/>
    <text x="${padding}" y="32" class="title" fill="#${titleColor}">GitHub Stats</text>
    
    <!-- Separator line -->
    <line x1="${padding}" y1="${headerHeight + 5}" x2="${cardWidth - padding}" y2="${headerHeight + 5}" stroke="#${borderColor}" stroke-width="1" opacity="0.2"/>
`;

  items.forEach((item, index) => {
    const y = startY + index * itemHeight;
    const labelX = showIcons ? iconX + iconSize + 15 : iconX;
    const isLast = index === items.length - 1;
    
    if (showIcons) {
      const iconY = y - 10;
      const iconPath = getIconPath(item.icon);
      svg += `<g transform="translate(${iconX}, ${iconY}) scale(${iconSize / 24})">
        <path d="${iconPath}" fill="#${iconColor}" opacity="0.9"/>
      </g>`;
    }

    svg += `
    <text x="${labelX}" y="${y}" class="label" fill="#${textColor}">${escapeXml(item.label)}</text>
    <text x="${cardWidth - padding}" y="${y}" class="value" fill="#${textColor}" text-anchor="end">${escapeXml(item.value)}</text>
    ${!isLast ? `<line x1="${padding}" y1="${y + 20}" x2="${cardWidth - padding}" y2="${y + 20}" stroke="#${borderColor}" stroke-width="0.5" opacity="0.15"/>` : ""}
`;
  });

  svg += `</svg>`;

  return svg;
}

export function generateTopLangsCard(
  languages: LanguageStats,
  theme: Theme,
  options: {
    showIcons?: boolean;
    hideBorder?: boolean;
    layout?: string;
  }
): string {
  const { showIcons = false, hideBorder = false, layout = "default" } = options;

  const sortedLangs = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (sortedLangs.length === 0) {
    sortedLangs.push(["No languages found", 0]);
  }

  const total = sortedLangs.reduce((sum, [, count]) => sum + count, 0) || 1;

  const bgColor = ensureHexColor(theme.bg_color);
  const borderColor = ensureHexColor(theme.border_color);
  const titleColor = ensureHexColor(theme.title_color);
  const textColor = ensureHexColor(theme.text_color);
  const iconColor = ensureHexColor(theme.icon_color);

  const borderStyle = hideBorder ? "" : `stroke="#${borderColor}" stroke-width="1"`;
  const cardWidth = 550;
  const padding = 30;
  const headerHeight = 50;
  const itemHeight = layout === "compact" ? 38 : 48;
  const cardHeight = headerHeight + sortedLangs.length * itemHeight + 30;
  const borderOpacity = hideBorder ? "0" : "0.3";

  let svg = `<svg width="${cardWidth}" height="${cardHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        .title { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .lang { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; }
        .percent { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 700; }
      </style>
    </defs>
    <rect width="${cardWidth}" height="${cardHeight}" fill="#${bgColor}" ${borderStyle} rx="10" opacity="1"/>
    ${!hideBorder ? `<rect x="0.5" y="0.5" width="${cardWidth - 1}" height="${cardHeight - 1}" fill="none" stroke="#${borderColor}" stroke-width="1" rx="10" opacity="${borderOpacity}"/>` : ""}
    
    <!-- Header section -->
    <rect width="${cardWidth}" height="${headerHeight}" fill="#${bgColor}" rx="10"/>
    <text x="${padding}" y="32" class="title" fill="#${titleColor}">Top Languages</text>
    <line x1="${padding}" y1="${headerHeight + 5}" x2="${cardWidth - padding}" y2="${headerHeight + 5}" stroke="#${borderColor}" stroke-width="1" opacity="0.2"/>
`;

  sortedLangs.forEach(([lang, count], index) => {
    const percentage = Math.round((count / total) * 100);
    const y = 70 + index * itemHeight;
    const barWidth = (count / total) * (cardWidth - padding * 2 - 100);
    const barY = y + 22;
    const barHeight = 10;
    const isLast = index === sortedLangs.length - 1;

    svg += `
    <text x="${padding}" y="${y}" class="lang" fill="#${textColor}">${escapeXml(lang)}</text>
    <text x="${cardWidth - padding}" y="${y}" class="percent" fill="#${textColor}" text-anchor="end">${percentage}%</text>
    <rect x="${padding}" y="${barY}" width="${barWidth}" height="${barHeight}" fill="#${iconColor}" rx="5" opacity="0.85"/>
    ${!isLast ? `<line x1="${padding}" y1="${y + 30}" x2="${cardWidth - padding}" y2="${y + 30}" stroke="#${borderColor}" stroke-width="0.5" opacity="0.15"/>` : ""}
`;
  });

  svg += `</svg>`;

  return svg;
}

export function generateStreakCard(
  streak: StreakStats,
  theme: Theme,
  options: {
    showIcons?: boolean;
    hideBorder?: boolean;
  }
): string {
  const { showIcons = false, hideBorder = false } = options;

  const bgColor = ensureHexColor(theme.bg_color);
  const borderColor = ensureHexColor(theme.border_color);
  const titleColor = ensureHexColor(theme.title_color);
  const textColor = ensureHexColor(theme.text_color);
  const iconColor = ensureHexColor(theme.icon_color);

  const borderStyle = hideBorder ? "" : `stroke="#${borderColor}" stroke-width="1"`;
  const cardWidth = 550;
  const cardHeight = 210;
  const padding = 30;
  const headerHeight = 50;
  const iconSize = 20;
  const itemHeight = 50;
  const borderOpacity = hideBorder ? "0" : "0.3";

  const items = [
    { label: "Current Streak", value: `${streak.currentStreak} days`, icon: "streak" },
    { label: "Best Streak", value: `${streak.bestStreak} days`, icon: "streak" },
    { label: "Total Contributions", value: streak.totalContributions.toLocaleString(), icon: "contributions" },
  ];

  let svg = `<svg width="${cardWidth}" height="${cardHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        .title { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; opacity: 0.9; }
        .value { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 700; }
      </style>
    </defs>
    <rect width="${cardWidth}" height="${cardHeight}" fill="#${bgColor}" ${borderStyle} rx="10" opacity="1"/>
    ${!hideBorder ? `<rect x="0.5" y="0.5" width="${cardWidth - 1}" height="${cardHeight - 1}" fill="none" stroke="#${borderColor}" stroke-width="1" rx="10" opacity="${borderOpacity}"/>` : ""}
    
    <!-- Header section -->
    <rect width="${cardWidth}" height="${headerHeight}" fill="#${bgColor}" rx="10"/>
    <text x="${padding}" y="32" class="title" fill="#${titleColor}">GitHub Streak</text>
    <line x1="${padding}" y1="${headerHeight + 5}" x2="${cardWidth - padding}" y2="${headerHeight + 5}" stroke="#${borderColor}" stroke-width="1" opacity="0.2"/>
`;

  items.forEach((item, index) => {
    const y = 75 + index * itemHeight;
    const labelX = showIcons ? padding + iconSize + 15 : padding;
    const isLast = index === items.length - 1;
    
    if (showIcons) {
      const iconY = y - 10;
      const iconPath = getIconPath(item.icon);
      svg += `<g transform="translate(${padding}, ${iconY}) scale(${iconSize / 24})">
        <path d="${iconPath}" fill="#${iconColor}" opacity="0.9"/>
      </g>`;
    }

    svg += `
    <text x="${labelX}" y="${y}" class="label" fill="#${textColor}">${escapeXml(item.label)}</text>
    <text x="${cardWidth - padding}" y="${y}" class="value" fill="#${textColor}" text-anchor="end">${escapeXml(item.value)}</text>
    ${!isLast ? `<line x1="${padding}" y1="${y + 25}" x2="${cardWidth - padding}" y2="${y + 25}" stroke="#${borderColor}" stroke-width="0.5" opacity="0.15"/>` : ""}
`;
  });

  svg += `</svg>`;

  return svg;
}

export function generateAdditionalStatsCard(
  stats: GitHubStats,
  theme: Theme,
  options: {
    showIcons?: boolean;
    hideBorder?: boolean;
  }
): string {
  const { showIcons = false, hideBorder = false } = options;

  const bgColor = ensureHexColor(theme.bg_color);
  const borderColor = ensureHexColor(theme.border_color);
  const titleColor = ensureHexColor(theme.title_color);
  const textColor = ensureHexColor(theme.text_color);
  const iconColor = ensureHexColor(theme.icon_color);

  const borderStyle = hideBorder ? "" : `stroke="#${borderColor}" stroke-width="1"`;
  const cardWidth = 550;
  const cardHeight = 210;
  const padding = 30;
  const headerHeight = 50;
  const iconSize = 20;
  const itemHeight = 50;
  const borderOpacity = hideBorder ? "0" : "0.3";

  const items = [
    { label: "Reviews", value: stats.totalReviews.toLocaleString(), icon: "reviews" },
    { label: "Discussions", value: stats.totalDiscussions.toLocaleString(), icon: "discussions" },
    { label: "PR Merge Rate", value: `${stats.prsMergedPercentage}%`, icon: "merged" },
  ];

  let svg = `<svg width="${cardWidth}" height="${cardHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        .title { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; opacity: 0.9; }
        .value { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 700; }
      </style>
    </defs>
    <rect width="${cardWidth}" height="${cardHeight}" fill="#${bgColor}" ${borderStyle} rx="10" opacity="1"/>
    ${!hideBorder ? `<rect x="0.5" y="0.5" width="${cardWidth - 1}" height="${cardHeight - 1}" fill="none" stroke="#${borderColor}" stroke-width="1" rx="10" opacity="${borderOpacity}"/>` : ""}
    
    <!-- Header section -->
    <rect width="${cardWidth}" height="${headerHeight}" fill="#${bgColor}" rx="10"/>
    <text x="${padding}" y="32" class="title" fill="#${titleColor}">Additional Stats</text>
    <line x1="${padding}" y1="${headerHeight + 5}" x2="${cardWidth - padding}" y2="${headerHeight + 5}" stroke="#${borderColor}" stroke-width="1" opacity="0.2"/>
`;

  items.forEach((item, index) => {
    const y = 75 + index * itemHeight;
    const labelX = showIcons ? padding + iconSize + 15 : padding;
    const isLast = index === items.length - 1;
    
    if (showIcons) {
      const iconY = y - 10;
      const iconPath = getIconPath(item.icon);
      svg += `<g transform="translate(${padding}, ${iconY}) scale(${iconSize / 24})">
        <path d="${iconPath}" fill="#${iconColor}" opacity="0.9"/>
      </g>`;
    }

    svg += `
    <text x="${labelX}" y="${y}" class="label" fill="#${textColor}">${escapeXml(item.label)}</text>
    <text x="${cardWidth - padding}" y="${y}" class="value" fill="#${textColor}" text-anchor="end">${escapeXml(item.value)}</text>
    ${!isLast ? `<line x1="${padding}" y1="${y + 25}" x2="${cardWidth - padding}" y2="${y + 25}" stroke="#${borderColor}" stroke-width="0.5" opacity="0.15"/>` : ""}
`;
  });

  svg += `</svg>`;

  return svg;
}

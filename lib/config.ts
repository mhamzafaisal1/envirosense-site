// Everything deploy-specific lives here. Set these in Vercel → Project → Settings → Environment Variables.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
export const GITHUB = {
  ml: process.env.NEXT_PUBLIC_GITHUB_ML || "https://github.com/",
  site: process.env.NEXT_PUBLIC_GITHUB_SITE || "https://github.com/",
  app: process.env.NEXT_PUBLIC_GITHUB_APP || "https://github.com/",
};
export const PAPER_PDF = "/EnviroSense.pdf";
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "mhamzafaisal020@gmail.com";
export const PAPER_URL = "https://link.springer.com/chapter/10.1007/978-3-031-92608-2_19";
export const PORTFOLIO_URL = process.env.NEXT_PUBLIC_PORTFOLIO_URL || "";

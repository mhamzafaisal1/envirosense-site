import { Github, Mail } from "lucide-react";
import { CONTACT_EMAIL, GITHUB, PAPER_PDF } from "@/lib/config";

export default function Footer() {
  const links = [
    ["Try the app", "#app"],
    ["Model", "#demo"],
    ["Results", "#results"],
    ["How it's built", "#architecture"],
    ["Paper", "#paper"],
    ["About", "#about"]
  ];

  return (
    <footer className="bg-[#08100d] px-6 pt-24">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-lg bg-[radial-gradient(ellipse_at_center,rgba(74,222,128,0.12),transparent_70%)] py-20 text-center">
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-bold">It&apos;s all open source.</h2>
          <p className="mt-4 text-textMuted">Model, API, app and this site. Read the code, run it yourself, or get in touch.</p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <a href={GITHUB.ml} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg bg-accent px-7 py-3 font-semibold text-bg"><Github size={18} /> Model &amp; API</a>
            <a href={GITHUB.app} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg border border-accent px-7 py-3 font-semibold text-accent"><Github size={18} /> Mobile app</a>
            <a href={PAPER_PDF} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border px-7 py-3 font-semibold text-textMuted hover:text-accent">Paper (PDF)</a>
          </div>
        </div>
        <div className="grid gap-8 border-t border-border py-10 md:grid-cols-3 md:items-center">
          <div>
            <p className="text-lg font-bold text-accent">EnviroSense</p>
            <p className="mt-2 text-sm text-textMuted">Muhammad Hamza Faisal &amp; Haydar Cukurtepe</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-textMuted md:justify-center">
            {links.map(([label, href]) => <a key={label} href={href} className="hover:text-accent">{label}</a>)}
          </div>
          <div className="flex items-center gap-3 text-sm text-textMuted md:justify-end">
            <Mail size={16} />
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-accent">{CONTACT_EMAIL}</a>
          </div>
        </div>
        <p className="border-t border-border py-10 text-center font-mono text-xs text-textMuted">Research project, not agronomic advice. Trained on public data from Indian agriculture; validate locally before acting on it.</p>
      </div>
    </footer>
  );
}

import type { ReactNode } from "react";

/** Modern phone chassis drawn in CSS: titanium band, glass bezel, dynamic island, side keys. */
export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto h-[760px] w-[372px] shrink-0">
      {/* side keys */}
      <span aria-hidden className="absolute -left-[3px] top-[118px] h-8 w-[3px] rounded-l bg-[#2a302d]" />
      <span aria-hidden className="absolute -left-[3px] top-[172px] h-14 w-[3px] rounded-l bg-[#2a302d]" />
      <span aria-hidden className="absolute -left-[3px] top-[238px] h-14 w-[3px] rounded-l bg-[#2a302d]" />
      <span aria-hidden className="absolute -right-[3px] top-[196px] h-20 w-[3px] rounded-r bg-[#2a302d]" />
      {/* chassis */}
      <div
        className="h-full w-full rounded-[58px] p-[11px]"
        style={{
          background: "linear-gradient(145deg, #3a413d 0%, #1a1e1c 38%, #2b312e 100%)",
          boxShadow: "0 40px 80px -20px rgba(0,0,0,.75), 0 18px 36px -18px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.08)",
        }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[47px] bg-black ring-1 ring-black">
          {/* dynamic island */}
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-[11px] z-20 h-[30px] w-[104px] -translate-x-1/2 rounded-full bg-black" />
          {children}
          {/* home indicator */}
          <div aria-hidden className="pointer-events-none absolute bottom-[7px] left-1/2 z-20 h-[5px] w-[124px] -translate-x-1/2 rounded-full bg-white/70" />
        </div>
      </div>
    </div>
  );
}

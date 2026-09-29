"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function PageScan() {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed left-0 top-0 z-[9999] h-[2px] w-full bg-[linear-gradient(to_right,transparent,#4ade80,transparent)]"
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: "100vh", opacity: [1, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          onAnimationComplete={() => setVisible(false)}
        />
      )}
    </AnimatePresence>
  );
}

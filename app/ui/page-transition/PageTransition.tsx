"use client";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  return (
    <AnimatePresence>
      <div key={pathname}>
        <motion.div
          initial={{ opacity: 1 }}
          animate={{
            opacity: 0,
            transition: { delay: 0.5, duration: 0.2, ease: "easeInOut" },
          }}
          className="h-screen w-screen fixed bg-white top-0 pointer-events-none z-10"
        />
        {children}
      </div>
    </AnimatePresence>
  );
};

export default PageTransition;

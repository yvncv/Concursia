"use client";

import { motion } from "framer-motion";

const stairAnimation = {
    initial: { top: "0%" },
    animate: { top: "100%" },
    exit: { top: ["100%", "0%"] },
};

const reverseIndex = (index: number) => 6 - index - 1;

const Stairs = () => {
    return (
        <>
            {[...Array(6)].map((_, index) => {
                return (
                    <motion.div
                        key={index}
                        className="h-full w-full bg-rojo relative"
                        variants={stairAnimation}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{
                            duration: 0.2,
                            ease: "easeInOut",
                            delay: reverseIndex(index) * 0.05,
                        }}
                    />
                )
            })}
        </>
    );
};

export default Stairs;

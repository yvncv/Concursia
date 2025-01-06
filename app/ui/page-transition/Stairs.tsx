"use client";

import { motion } from "framer-motion";

const stairAnimation = {
    initial: { bottom: "0%" },
    animate: { bottom: "100%" },
    exit: { bottom: ["100%", "0%"] },
};

const reverseIndex = (index: number) => 5 - index - 1;

const Stairs = () => {
    return (
        <>
            {[...Array(5)].map((_, index) => {
                return (
                    <motion.div
                        key={index}
                        className="h-full w-full bg-rojo relative"
                        variants={stairAnimation}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{
                            duration: 0.4,
                            ease: "easeInOut",
                            delay: reverseIndex(index) * 0.1,
                        }}
                    />
                )
            })}
        </>
    );
};

export default Stairs;

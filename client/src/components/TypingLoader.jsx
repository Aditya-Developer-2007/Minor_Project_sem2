import { motion } from 'framer-motion';
const TypingLoader = () => (
  <div className="flex gap-1 items-center p-2 h-6">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-1.5 h-1.5 bg-zinc-500 rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
      />
    ))}
  </div>
);
export default TypingLoader;
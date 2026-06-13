// src/components/SkeletonBookCard.tsx
import { motion } from "framer-motion";

export default function SkeletonBookCard() {
  return (
    <motion.div 
      className="card bg-base-100 shadow"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Cover Skeleton */}
      <figure className="aspect-[2/3] w-full">
        <div className="skeleton w-full h-full rounded-none"></div>
      </figure>
      
      {/* Body Skeleton */}
      <div className="card-body p-4 space-y-3">
        {/* Title Skeleton */}
        <div className="skeleton h-5 w-full"></div>
        <div className="skeleton h-5 w-3/4"></div>
        
        {/* Author Skeleton */}
        <div className="skeleton h-4 w-1/2 opacity-70"></div>
        
        {/* Year Skeleton */}
        <div className="flex items-center justify-between pt-2">
          <div className="skeleton h-4 w-12"></div>
        </div>
      </div>
    </motion.div>
  );
}

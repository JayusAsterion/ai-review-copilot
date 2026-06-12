"use client";

import { motion } from "motion/react";
import { useState } from "react";

import { CodeReviewForm } from "@/components/review-input/code-review-form";
import { ReviewResultPanel } from "@/components/review-result/review-result-panel";
import type { ReviewResult } from "@/types/review";

export function ReviewWorkspace() {
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="grid flex-1 gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
    >
      <CodeReviewForm
        onResult={setResult}
        onAnalyzingChange={setIsAnalyzing}
      />
      <ReviewResultPanel result={result} isLoading={isAnalyzing} />
    </motion.div>
  );
}

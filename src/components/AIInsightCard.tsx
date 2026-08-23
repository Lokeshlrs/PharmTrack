import { Brain } from "lucide-react";

interface AIInsightCardProps {
  insights: string[];
}

export default function AIInsightCard({ insights }: AIInsightCardProps) {
  return (
    <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
          <Brain size={14} className="text-white" />
        </div>
        <span className="text-sm font-semibold text-violet-900 font-display">AI Insights</span>
        <span className="ml-auto text-xs text-violet-500 font-mono">Updated just now</span>
      </div>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <div key={i} className="flex gap-2 text-sm text-violet-800">
            <span className="text-violet-400 mt-0.5 shrink-0">›</span>
            <span>{insight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

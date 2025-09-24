"use client";

import { useRouter } from "next/navigation";
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProgressTrackerProps {
  completedDays: number;
  overallProgress: number;
}

export default function ProgressTracker({ completedDays, overallProgress }: ProgressTrackerProps) {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6 border">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Your Progress</h3>
          <p className="text-sm text-muted-foreground">
            Keep going! You're making great progress.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{completedDays}/5</div>
            <div className="text-xs text-muted-foreground">Days Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-chart-3">{overallProgress}%</div>
            <div className="text-xs text-muted-foreground">Overall Progress</div>
          </div>
          <Button
            onClick={() => router.push('/certificate')}
            disabled={completedDays < 5}
            size="sm"
          >
            <Award className="w-4 h-4 mr-2" />
            Get Certificate
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Course Progress</span>
          <span>{overallProgress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary to-chart-3 rounded-full h-2 transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
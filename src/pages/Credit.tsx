import { TrendingUp } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const Credit = () => {
  const creditScore = 720;
  const maxScore = 900;
  const scorePercentage = (creditScore / maxScore) * 100;

  const getScoreRating = (score: number) => {
    if (score >= 750) return { label: "Excellent", color: "text-success" };
    if (score >= 650) return { label: "Good", color: "text-primary" };
    if (score >= 550) return { label: "Fair", color: "text-warning" };
    return { label: "Poor", color: "text-destructive" };
  };

  const rating = getScoreRating(creditScore);

  const factors = [
    { label: "Payment History", score: 85, impact: "High" },
    { label: "Credit Utilization", score: 70, impact: "High" },
    { label: "Credit Age", score: 60, impact: "Medium" },
    { label: "Credit Mix", score: 75, impact: "Low" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Credit Score</h1>
        <p className="text-sm opacity-90">Your creditworthiness overview</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Credit Score Card */}
        <Card className="p-6 text-center">
          <div className="mb-4">
            <TrendingUp className="h-12 w-12 text-primary mx-auto mb-2" />
            <h2 className="text-sm text-muted-foreground mb-2">Your Credit Score</h2>
            <div className="flex items-baseline justify-center gap-2">
              <span className={`text-5xl font-bold ${rating.color}`}>{creditScore}</span>
              <span className="text-xl text-muted-foreground">/ {maxScore}</span>
            </div>
            <p className={`text-lg font-semibold mt-2 ${rating.color}`}>{rating.label}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={scorePercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>
        </Card>

        {/* Score Factors */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 text-foreground">Credit Factors</h3>
          <div className="space-y-4">
            {factors.map((factor, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{factor.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">{factor.impact} Impact</span>
                    <span className="font-semibold text-primary">{factor.score}%</span>
                  </div>
                </div>
                <Progress value={factor.score} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Tips Card */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-2 text-foreground">💡 How to Improve</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Pay all bills on time every month</li>
            <li>Keep credit utilization below 30%</li>
            <li>Avoid opening too many new accounts</li>
            <li>Maintain a diverse credit mix</li>
          </ul>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Credit;

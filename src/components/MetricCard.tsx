import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: "positive" | "negative" | "neutral";
}

const MetricCard = ({ title, value, icon: Icon, trend = "neutral" }: MetricCardProps) => {
  const trendColors = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-foreground",
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className={`text-2xl font-bold ${trendColors[trend]}`}>{value}</p>
        </div>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;

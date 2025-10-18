import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import BottomNav from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  // Sample data for the cashflow chart
  const cashflowData = [
    { month: "Jan", income: 45000, expenses: 32000 },
    { month: "Feb", income: 52000, expenses: 38000 },
    { month: "Mar", income: 48000, expenses: 35000 },
    { month: "Apr", income: 61000, expenses: 42000 },
    { month: "May", income: 55000, expenses: 39000 },
    { month: "Jun", income: 67000, expenses: 45000 },
  ];

  const totalIncome = 328000;
  const totalExpenses = 231000;
  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold mb-1">KhaataKitab</h1>
        <p className="text-sm opacity-90">Your Business Dashboard</p>
      </div>

      {/* Metrics */}
      <div className="p-4 space-y-3">
        <MetricCard
          title="Total Income"
          value={`₹${totalIncome.toLocaleString()}`}
          icon={TrendingUp}
          trend="positive"
        />
        <MetricCard
          title="Total Expenses"
          value={`₹${totalExpenses.toLocaleString()}`}
          icon={TrendingDown}
          trend="negative"
        />
        <MetricCard
          title="Net Profit"
          value={`₹${netProfit.toLocaleString()}`}
          icon={DollarSign}
          trend="positive"
        />
      </div>

      {/* Cashflow Chart */}
      <div className="p-4">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Cashflow Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cashflowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }} 
              />
              <Bar dataKey="income" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;

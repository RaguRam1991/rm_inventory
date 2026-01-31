import { useItems } from "@/hooks/use-items";
import { useBills } from "@/hooks/use-bills";
import { StatsCard } from "@/components/StatsCard";
import { DollarSign, AlertTriangle, Package, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { data: items = [] } = useItems();
  const { data: bills = [] } = useBills();

  // Calculations
  const lowStockItems = items.filter(i => i.quantity <= (i.minQuantity || 5));
  const totalStockValue = items.reduce((acc, i) => acc + (parseFloat(i.price) * i.quantity), 0);
  
  // Today's Sales
  const today = new Date().toISOString().split('T')[0];
  const todaysBills = bills.filter(b => b.createdAt && new Date(b.createdAt).toISOString().split('T')[0] === today);
  const todaysRevenue = todaysBills.reduce((acc, b) => acc + parseFloat(b.totalAmount), 0);

  // Chart Data (Last 7 bills for simplicity, ideally would be last 7 days)
  const chartData = bills.slice(0, 7).map(bill => ({
    name: format(new Date(bill.createdAt || new Date()), 'HH:mm'),
    amount: parseFloat(bill.totalAmount)
  })).reverse();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold text-primary">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-1">Welcome back to your command center.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Today's Revenue" 
          value={`${todaysRevenue.toFixed(2)}`} 
          icon={DollarSign}
          className="border-l-4 border-l-green-500"
        />
        <StatsCard 
          title="Low Stock Alerts" 
          value={lowStockItems.length} 
          icon={AlertTriangle}
          trend={lowStockItems.length > 0 ? "Action Needed" : "All Good"}
          trendUp={lowStockItems.length === 0}
          className="border-l-4 border-l-amber-500"
        />
        <StatsCard 
          title="Total Inventory Value" 
          value={`${totalStockValue.toFixed(0)}`} 
          icon={Package}
          className="border-l-4 border-l-blue-500"
        />
        <StatsCard 
          title="Total Transactions" 
          value={bills.length} 
          icon={TrendingUp}
          className="border-l-4 border-l-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions Chart */}
        <Card className="lg:col-span-2 border-none shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle>Recent Sales Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      cursor={{fill: '#f3f4f6'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No sales data yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock List */}
        <Card className="border-none shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">All items are well stocked.</p>
              ) : (
                lowStockItems.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div>
                      <p className="font-medium text-amber-900">{item.name}</p>
                      <p className="text-xs text-amber-700">Min: {item.minQuantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-900">{item.quantity}</p>
                      <p className="text-xs text-amber-700">In Stock</p>
                    </div>
                  </div>
                ))
              )}
              {lowStockItems.length > 5 && (
                <p className="text-xs text-center text-muted-foreground pt-2">
                  +{lowStockItems.length - 5} more items
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

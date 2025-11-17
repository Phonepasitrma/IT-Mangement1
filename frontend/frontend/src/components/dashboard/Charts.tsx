// frontend/src/components/dashboard/Charts.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// Define chart data type
interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number; 
}

interface LocationData {
  locationName: string;
  department: string;
  totalAssets: number;
}

interface ChartsProps {
  assetsByLocation?: LocationData[];
  budgetForecast?: ChartData[]; // Changed from BudgetPlan[] to ChartData[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Charts: React.FC<ChartsProps> = ({ assetsByLocation, budgetForecast }) => {
  return (
    <div>
      {assetsByLocation && (
        <div className="mb-4">
          <h3>Assets by Location</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={assetsByLocation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="locationName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalAssets" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {budgetForecast && (
        <div>
          <h3>Budget Forecast by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={budgetForecast}
                cx="50%"
                cy="50%"
                labelLine={false}
                
label={(entry: any) => 
  `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`
}

                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {budgetForecast.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Charts;
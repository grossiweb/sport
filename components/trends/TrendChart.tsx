'use client'

import { TrendData } from '@/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface TrendChartProps {
  trends: TrendData[]
}

export function TrendChart({ trends }: TrendChartProps) {
  // Prepare data for bar chart (top 10 trends by absolute value)
  const barChartData = trends
    .slice(0, 10)
    .map(trend => ({
      name: trend.description.slice(0, 30) + (trend.description.length > 30 ? '...' : ''),
      value: Math.abs(trend.value),
      impact: trend.impact,
      type: trend.type,
      originalValue: trend.value
    }))

  // Prepare data for pie chart (distribution by type)
  const typeDistribution = trends.reduce((acc, trend) => {
    acc[trend.type] = (acc[trend.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieChartData = Object.entries(typeDistribution).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
    type
  }))

  // Prepare data for impact distribution
  const impactDistribution = trends.reduce((acc, trend) => {
    acc[trend.impact] = (acc[trend.impact] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const impactChartData = Object.entries(impactDistribution).map(([impact, count]) => ({
    name: impact.charAt(0).toUpperCase() + impact.slice(1),
    value: count,
    impact
  }))

  const COLORS = {
    betting: '#3B82F6',
    team: '#10B981',
    player: '#F59E0B',
    weather: '#8B5CF6',
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#10B981'
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Value: <span className="font-medium">{data.originalValue > 0 ? '+' : ''}{data.originalValue}%</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Impact: <span className="font-medium capitalize">{data.impact}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Type: <span className="font-medium capitalize">{data.type}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8">
      {/* Top Trends Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Top Trends by Strength
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                fontSize={12}
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                tick={{ fill: 'currentColor' }}
                label={{ value: 'Trend Strength (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Type Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Trends by Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.type as keyof typeof COLORS] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Impact Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Impact Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={impactChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {impactChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.impact as keyof typeof COLORS] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trend Strength Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Trend Analysis Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {trends.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Trends</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {trends.filter(t => t.impact === 'high').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">High Impact</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {Math.round((trends.reduce((sum, t) => sum + Math.abs(t.value), 0) / trends.length) || 0)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Strength</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {Object.keys(typeDistribution).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
          </div>
        </div>
      </div>
    </div>
  )
}
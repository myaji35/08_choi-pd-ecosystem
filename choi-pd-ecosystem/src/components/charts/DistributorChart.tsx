'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MonthlySignupChartProps {
  data: Record<string, number>;
}

export function MonthlySignupChart({ data }: MonthlySignupChartProps) {
  const chartData = Object.entries(data).map(([month, count]) => ({
    month,
    signups: count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="signups" stroke="#3b82f6" strokeWidth={2} name="가입자" />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface PlanDistributionChartProps {
  data: {
    basic: number;
    premium: number;
    enterprise: number;
    none: number;
  };
}

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#6b7280'];

export function PlanDistributionChart({ data }: PlanDistributionChartProps) {
  const chartData = [
    { name: 'Basic', value: data.basic },
    { name: 'Premium', value: data.premium },
    { name: 'Enterprise', value: data.enterprise },
    { name: '없음', value: data.none },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }: any) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface RegionDistributionChartProps {
  data: Record<string, number>;
}

export function RegionDistributionChart({ data }: RegionDistributionChartProps) {
  const chartData = Object.entries(data)
    .map(([region, count]) => ({
      region,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 regions

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="region" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#10b981" name="분포" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface TopResourcesChartProps {
  data: Array<{
    id: number;
    title: string;
    category: string;
    downloads: number | null;
  }>;
}

export function TopResourcesChart({ data }: TopResourcesChartProps) {
  const chartData = data.map((resource) => ({
    title: resource.title.length > 20 ? resource.title.substring(0, 20) + '...' : resource.title,
    downloads: resource.downloads || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="title" type="category" width={150} />
        <Tooltip />
        <Legend />
        <Bar dataKey="downloads" fill="#f59e0b" name="다운로드" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ActivityStatsChartProps {
  data: {
    login: number;
    content_access: number;
    download: number;
    payment: number;
    support_request: number;
  };
}

export function ActivityStatsChart({ data }: ActivityStatsChartProps) {
  const chartData = [
    { name: '로그인', value: data.login },
    { name: '콘텐츠 접근', value: data.content_access },
    { name: '다운로드', value: data.download },
    { name: '결제', value: data.payment },
    { name: '지원요청', value: data.support_request },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8b5cf6" name="활동" />
      </BarChart>
    </ResponsiveContainer>
  );
}

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
    revenue: {
        label: 'Revenue',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

const compactCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'TZS',
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);

const fullCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'TZS',
        minimumFractionDigits: 0,
    }).format(value);

interface RevenueTrendChartProps {
    data: {
        month: string;
        label: string;
        total_revenue: number;
        payment_count: number;
    }[];
    title?: string;
}

export function RevenueTrendChart({
    data,
    title = 'Revenue Trend',
}: RevenueTrendChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>No revenue data available</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    Monthly revenue collected over the last {data.length} months
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[260px] w-full">
                    <AreaChart
                        data={data}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-revenue)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-revenue)"
                                    stopOpacity={0.05}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="hsl(var(--border) / 0.5)" />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={56}
                            tickFormatter={(value) => compactCurrency(Number(value))}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                        />
                        <ChartTooltip
                            cursor={{
                                stroke: 'hsl(var(--muted-foreground) / 0.3)',
                                strokeWidth: 1,
                                strokeDasharray: '3 3',
                            }}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => value}
                                    formatter={(value) => [
                                        fullCurrency(Number(value)),
                                        'Revenue',
                                    ]}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area
                            dataKey="total_revenue"
                            type="natural"
                            fill="url(#fillRevenue)"
                            stroke="var(--color-revenue)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

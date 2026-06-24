import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
    paid: {
        label: 'Paid',
        color: 'var(--chart-1)',
    },
    pending: {
        label: 'Pending',
        color: 'var(--chart-5)',
    },
    overdue: {
        label: 'Overdue',
        color: 'var(--destructive)',
    },
    partial: {
        label: 'Partial',
        color: 'var(--chart-3)',
    },
    waived: {
        label: 'Waived',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig;

interface PaymentCollectionChartProps {
    data: {
        month: string;
        label: string;
        paid: number;
        pending: number;
        overdue: number;
        partial: number;
        waived: number;
        total: number;
    }[];
    title?: string;
}

export function PaymentCollectionChart({
    data,
    title = 'Payment Collection',
}: PaymentCollectionChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>No collection data available</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    Monthly bill status breakdown over the last {data.length}{' '}
                    months
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[260px] w-full"
                >
                    <BarChart
                        data={data}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid
                            vertical={false}
                            stroke="var(--color-border)"
                            strokeOpacity={0.5}
                        />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tick={{
                                fill: 'var(--color-muted-foreground)',
                                fontSize: 11,
                            }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={32}
                            tick={{
                                fill: 'var(--color-muted-foreground)',
                                fontSize: 11,
                            }}
                            allowDecimals={false}
                        />
                        <ChartTooltip
                            cursor={{
                                fill: 'var(--color-muted)',
                                fillOpacity: 0.4,
                            }}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <ChartLegend
                            content={<ChartLegendContent verticalAlign="top" />}
                            verticalAlign="top"
                            align="right"
                        />
                        <Bar
                            dataKey="paid"
                            fill="var(--color-paid)"
                            radius={[4, 4, 0, 0]}
                            stackId="a"
                        />
                        <Bar
                            dataKey="pending"
                            fill="var(--color-pending)"
                            radius={[4, 4, 0, 0]}
                            stackId="a"
                        />
                        <Bar
                            dataKey="overdue"
                            fill="var(--color-overdue)"
                            radius={[4, 4, 0, 0]}
                            stackId="a"
                        />
                        <Bar
                            dataKey="partial"
                            fill="var(--color-partial)"
                            radius={[4, 4, 0, 0]}
                            stackId="a"
                        />
                        <Bar
                            dataKey="waived"
                            fill="var(--color-waived)"
                            radius={[4, 4, 0, 0]}
                            stackId="a"
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

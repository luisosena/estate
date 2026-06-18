import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts';

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
  paid: {
    label: 'Paid',
    color: 'hsl(142, 76%, 36%)',
  },
  pending: {
    label: 'Pending',
    color: 'hsl(45, 93%, 47%)',
  },
  overdue: {
    label: 'Overdue',
    color: 'hsl(0, 84%, 60%)',
  },
  partial: {
    label: 'Partial',
    color: 'hsl(217, 91%, 60%)',
  },
  waived: {
    label: 'Waived',
    color: 'hsl(0, 0%, 65%)',
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
      <Card className="border border-gray-300 shadow-none dark:border-gray-600">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No collection data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-300 shadow-none dark:border-gray-600">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Monthly bill status breakdown over the last {data.length} months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
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
              width={32}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Legend
              verticalAlign="top"
              align="right"
              height={32}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                fontSize: 11,
                color: 'hsl(var(--muted-foreground))',
              }}
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

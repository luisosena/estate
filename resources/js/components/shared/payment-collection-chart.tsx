import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  paid: {
    label: "Paid",
    color: "hsl(142, 76%, 36%)",
  },
  pending: {
    label: "Pending",
    color: "hsl(45, 93%, 47%)",
  },
  overdue: {
    label: "Overdue",
    color: "hsl(0, 84%, 60%)",
  },
  partial: {
    label: "Partial",
    color: "hsl(217, 91%, 60%)",
  },
} satisfies ChartConfig

interface PaymentCollectionChartProps {
  data: {
    month: string
    label: string
    paid: number
    pending: number
    overdue: number
    partial: number
    waived: number
    total: number
  }[]
  title?: string
}

export function PaymentCollectionChart({ data, title = "Payment Collection" }: PaymentCollectionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No collection data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Monthly bill status breakdown over the last {data.length} months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => value}
                  indicator="dot"
                />
              }
            />
            <Bar dataKey="paid" fill="var(--color-paid)" radius={[4, 4, 0, 0]} stackId="a" />
            <Bar dataKey="pending" fill="var(--color-pending)" radius={[4, 4, 0, 0]} stackId="a" />
            <Bar dataKey="overdue" fill="var(--color-overdue)" radius={[4, 4, 0, 0]} stackId="a" />
            <Bar dataKey="partial" fill="var(--color-partial)" radius={[4, 4, 0, 0]} stackId="a" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

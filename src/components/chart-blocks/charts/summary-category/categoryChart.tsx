"use client";

import { useMemo, useEffect, useState } from "react";
import { VChart } from "@visactor/react-vchart";
import type { ICirclePackingChartSpec } from "@visactor/vchart";
import { addThousandsSeparator } from "@/lib/utils";
import { useTheme } from "next-themes";
import { chartDataAtom } from "@/atoms/balanceAtom";
import { useAtomValue } from "jotai";

interface Props {
  filter: "EXPENSE" | "INCOME";
}

export default function CategoryChart({ filter }: Props) {
  // 2. Consumo do átomo (Jotai suspende automaticamente se estiver dentro de <Suspense>)
  const chartDt = useAtomValue(chartDataAtom);

  // 3. Filtro dos dados baseado na prop filter
  const chartData = useMemo(() => {
    return (chartDt || []).filter((item) => item.tipo === filter);
  }, [chartDt, filter]);

  const { theme } = useTheme();
  const isDark = theme === "dark";


  const spec: ICirclePackingChartSpec = useMemo(() => ({
    type: "circlePacking",
    data: [{ id: "data", values: chartData }],
    categoryField: "name",
    valueField: "value",
    drill: true,
    padding: 0,
    layoutPadding: 5,

    theme: {
      fontFamily: "Gabarito, sans-serif",
      background: "transparent",
    },

    color: {
      type: 'ordinal',
      domain: ['INCOME', 'EXPENSE'],
      range: ['#1664FF', '#3CC780', '#60C2FB', '#FF8A00']
    },

    legends: [
      {
        visible: true,
        orient: "top",
        position: "start",
        padding: 0,
        label: {
          style: {
            hoverFill: isDark ? "#83878F" : "oklch(0.1363 0.0364 259.2)",
          }
        }
      },
    ],

    tooltip: {
      trigger: ["click", "hover"],
      style: {
        panel: {
          backgroundColor: isDark ? "oklch(0.2077 0.0398 265.75)" : "white",
          shadow: {
            x: 0, y: 4, blur: 12, spread: 0,
            color: isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.1)"
          }
        },
        titleLabel: {
          fill: isDark ? "oklch(0.98 0.02 230)" : "oklch(0.1363 0.0364 259.2)",
          fontWeight: 'bold'
        },
        keyLabel: { fill: "#83878F" },
        valueLabel: {
          fill: isDark ? "oklch(0.98 0.02 230)" : "oklch(0.1363 0.0364 259.2)",
          fontWeight: 'bold'
        }
      },
      mark: {
        title: { value: (d) => d?.name },
        content: [
          {
            key: "Valor",
            value: (d) => `R$ ${addThousandsSeparator(d?.value)}`,
          },
          {
            key: "Tipo",
            value: (d) => d?.tipo === "INCOME" ? "Receita" : "Despesa",
          }
        ],
      },
    },

    circlePacking: {
      state: {
        hover: {
          outerBorder: { distance: 2, lineWidth: 2 },
        },
      },
      style: { lineWidth: 0, stroke: "none" }
    },

    label: {
      style: {
        fill: "white",
        stroke: false,
        visible: (d) => d.depth === 0,
        text: (d) => addThousandsSeparator(d.value),
        fontSize: (d) => Math.max(d.radius / 2.5, 10),
        dy: (d) => d.radius / 8,
      },
    },

    animationEnter: { easing: "cubicInOut" },
    animationExit: { easing: "cubicInOut" },
    animationUpdate: { easing: "cubicInOut" },
  }), [chartDt, chartData, isDark]);


  return (
    <div className="w-full h-full min-h-75">
      <VChart spec={spec} />
    </div>
  );
}
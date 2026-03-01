"use client";

import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { VChart } from "@visactor/react-vchart";
import type { IBarChartSpec } from "@visactor/vchart";
import { useTheme } from "next-themes";
import { dayHistoryAtom } from "@/atoms/dayHistoryAtom";
import { addThousandsSeparator } from "@/lib/utils";

export default function HistoryChart() {
  // Obtém os dados do histórico via Jotai
  const chartData = useAtomValue(dayHistoryAtom);

  // Hook para detectar o tema atual (Light/Dark) do Next.js
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // useMemo evita que o gráfico seja recalculado desnecessariamente
  const spec: IBarChartSpec = useMemo(() => ({
    type: "bar",
    data: [{ id: "barData", values: chartData }],
    xField: "date",
    yField: "value",
    seriesField: "category", // Define a separação entre Receita e Despesa
    stack: false,            // Desativa o empilhamento para permitir sobreposição
    padding: [10, 0, 10, 0],

    // --- CONFIGURAÇÃO VISUAL GLOBAL ---
    theme: {
      fontFamily: "Gabarito, sans-serif",
      background: "transparent",
    },

    // Definição das cores das barras (Ciano para Receita, Azul para Despesa)
    color: ["#1AC6FF", "#1664FF"],

    // --- CONFIGURAÇÃO DOS EIXOS ---
    axes: [
      {
        orient: "left",
        label: { style: { fill: "#83878F" } },
        grid: {
          style: {
            // Linhas de grade horizontais sutis usando tokens OKLCH
            stroke: isDark ? "oklch(0.2418 0.03 259.05)" : "oklch(0.9535 0.008 253.85)",
            lineDash: [0], // Linha sólida
            lineWidth: 1
          }
        },
        domainLine: { style: { stroke: isDark ? "oklch(0.2418 0.03 259.05)" : "oklch(0.9535 0.008 253.85)" } }
      },
      {
        orient: "bottom",
        label: { style: { fill: "#83878F" } },
        domainLine: { style: { stroke: isDark ? "oklch(0.2418 0.03 259.05)" : "oklch(0.9535 0.008 253.85)" } }
      }
    ],

    // --- LEGENDA ---
    legends: {
      visible: true,
      orient: "bottom",
      label: {
        style: { fill: isDark ? "oklch(0.98 0.02 230)" : "oklch(0.1363 0.0364 259.2)" }
      }
    },

    // --- TOOLTIP (BALÃO DE INFORMAÇÕES) ---
    tooltip: {
      style: {
        panel: {
          backgroundColor: isDark ? "oklch(0.2077 0.0398 265.75)" : "white",
          shadow: {
            x: 0,
            y: 4,
            blur: 12,
            spread: 0,
            color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
          }
        },
        titleLabel: {
          fill: isDark ? "oklch(0.98 0.02 230)" : "oklch(0.1363 0.0364 259.2)",
          fontWeight: 'bold',
          fontSize: 14
        },
        keyLabel: { fill: "#83878F", fontSize: 12 },
        valueLabel: {
          fill: isDark ? "oklch(0.98 0.02 230)" : "oklch(0.1363 0.0364 259.2)",
          fontSize: 12,
          fontWeight: 'bold'
        }
      },
      mark: {
        title: {
          value: (d) => d?.date,
        },
        content: [
          {
            key: (d) => d?.category,
            // Formata o valor dentro do balão que aparece ao passar o mouse
            value: (d) => `R$ ${addThousandsSeparator(d?.value)}`,
          }
        ]
      },
    },

    // --- EFEITO DE HOVER NO FUNDO (CROSSHAIR) ---
    crosshair: {
      xField: {
        visible: true,
        line: {
          type: 'rect', // Retângulo de destaque atrás das barras
          style: {
            fill: isDark ? "#2e313a5a" : "#f5f5f85e",
            opacity: 1,
          }
        }
      }
    },

    // --- CONFIGURAÇÃO INDIVIDUAL DAS BARRAS ---
    bar: {
      state: {
        hover: {
          // Borda externa com padding transparente no hover
          outerBorder: {
            distance: 2,  // Espaço entre a barra e a borda
            lineWidth: 2, // Grossura da borda
          },
        },
      },
      style: {
        cornerRadius: [12, 12, 12, 12], // Barras arredondadas (estilo pill)

        // LÓGICA DE Z-INDEX:
        // Garante que a barra menor sempre fique na frente da maior
        // Ex: -50 (frente) > -200 (trás)
        zIndex: (datum) => {
          return -datum.value;
        },
      }
    }
  }), [chartData, isDark]);

  return (
    <div className="h-full w-full">
      <VChart spec={spec} />
    </div>
  );
}
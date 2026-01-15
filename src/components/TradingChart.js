'use client';

import { createChart, ColorType } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

export default function TradingChart({ 
  data, 
  colors = {
    backgroundColor: 'transparent',
    lineColor: '#2962FF',
    textColor: '#d1d5db', // gray-300
    areaTopColor: '#2962FF',
    areaBottomColor: 'rgba(41, 98, 255, 0.28)',
  } 
}) {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    if (!chartRef.current) {
        chartRef.current = createChart(chartContainerRef.current, {
            layout: {
              background: { type: ColorType.Solid, color: colors.backgroundColor },
              textColor: colors.textColor,
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
            grid: {
              vertLines: { color: 'rgba(42, 46, 57, 0.1)' },
              horzLines: { color: 'rgba(42, 46, 57, 0.1)' },
            },
            timeScale: {
              timeVisible: true,
              secondsVisible: false,
            },
        });

        seriesRef.current = chartRef.current.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);
    }

    // Format data and update series
    const formattedData = data
      .map(d => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
      .sort((a, b) => a.time - b.time);

    const uniqueData = [];
    const seenTimes = new Set();
    for (const item of formattedData) {
      if (!seenTimes.has(item.time)) {
        seenTimes.add(item.time);
        uniqueData.push(item);
      }
    }

    if (seriesRef.current) {
        seriesRef.current.setData(uniqueData);
    }
    if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
    }

    return () => {
      // We don't necessarily want to destroy the chart on every sub-update
      // but if the component unmounts, we should.
    };
  }, [data, colors]);

  useEffect(() => {
    return () => {
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }
    };
  }, []);

  return (
    <div ref={chartContainerRef} className="w-full h-[300px]" />
  );
}

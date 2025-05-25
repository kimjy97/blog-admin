import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useMemo, useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchChartVisits } from "@/lib/api";
import { ArrowsRightLeftIcon, ChevronDownIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ChartDataLabels);

const DAY_ABBREVIATIONS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

function lightenHex(hex: string, percent: number): string {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * percent);

  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0x00FF) + amt;
  let b = (num & 0x0000FF) + amt;

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

export default function VisitorLogChart() {
  const [showContent, setShowContent] = useState(false);
  const [themeVars, setThemeVars] = useState({
    primary: '',
    mutedFg: '',
    muted: '',
    card: '',
    border: '',
    foreground: '',
    accent: '',
  });

  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [range, setRange] = useState<'dayOfWeek' | 'daily' | 'month'>('dayOfWeek');
  const [includeLocalIps] = useState(false);

  const { startDateString, endDateString } = useMemo(() => {
    const today = new Date();
    const currentEndDate = new Date(today);
    const edString = `${currentEndDate.getFullYear()}-${String(currentEndDate.getMonth() + 1).padStart(2, '0')}-${String(currentEndDate.getDate()).padStart(2, '0')}`;
    let sdString = '';

    if (range === 'dayOfWeek') {
      const currentStartDate = new Date(today);
      currentStartDate.setDate(today.getDate() - 6);
      sdString = `${currentStartDate.getFullYear()}-${String(currentStartDate.getMonth() + 1).padStart(2, '0')}-${String(currentStartDate.getDate()).padStart(2, '0')}`;
    } else if (range === 'daily') {
      const currentStartDate = new Date(today);
      currentStartDate.setDate(today.getDate() - 13);
      sdString = `${currentStartDate.getFullYear()}-${String(currentStartDate.getMonth() + 1).padStart(2, '0')}-${String(currentStartDate.getDate()).padStart(2, '0')}`;
    } else if (range === 'month') {
      const currentStartDate = new Date(today);
      currentStartDate.setMonth(today.getMonth() - 11);
      currentStartDate.setDate(1);
      sdString = `${currentStartDate.getFullYear()}-${String(currentStartDate.getMonth() + 1).padStart(2, '0')}-${String(currentStartDate.getDate()).padStart(2, '0')}`;
    }
    return { startDateString: sdString, endDateString: edString };
  }, [range]);

  const {
    data: visitStatsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dashboard', 'chartVisits', range, startDateString, endDateString, includeLocalIps],
    queryFn: () => fetchChartVisits(startDateString, endDateString, includeLocalIps),
    select: (response) => {
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch chart visit data');
    }
  });

  const visitStats = visitStatsResponse || [];

  useEffect(() => {
    setShowContent(!isLoading);
  }, [isLoading]);

  useEffect(() => {
    function updateVars() {
      const root = document.documentElement;
      setThemeVars({
        primary: getComputedStyle(root).getPropertyValue('--color-primary').trim() || getComputedStyle(root).getPropertyValue('--primary').trim() || '#712cda',
        mutedFg: getComputedStyle(root).getPropertyValue('--color-muted-foreground').trim() || getComputedStyle(root).getPropertyValue('--muted-foreground').trim() || '#8a94a6',
        muted: getComputedStyle(root).getPropertyValue('--color-muted').trim() || getComputedStyle(root).getPropertyValue('--muted').trim() || '#f8f9fb',
        card: getComputedStyle(root).getPropertyValue('--color-card').trim() || getComputedStyle(root).getPropertyValue('--card').trim() || '#fff',
        border: getComputedStyle(root).getPropertyValue('--color-border').trim() || getComputedStyle(root).getPropertyValue('--border').trim() || '#ececec',
        foreground: getComputedStyle(root).getPropertyValue('--color-foreground').trim() || getComputedStyle(root).getPropertyValue('--foreground').trim() || '#111',
        accent: getComputedStyle(root).getPropertyValue('--accent').trim() || getComputedStyle(root).getPropertyValue('--color-accent').trim() || '#a259f7',
      });
    }
    updateVars();
    window.addEventListener('themechange', updateVars);
    const observer = new window.MutationObserver(updateVars);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      window.removeEventListener('themechange', updateVars);
      observer.disconnect();
    };
  }, []);

  const chartRef = useRef<any>(null);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    if (chartType === 'bar') {
      const timer = setTimeout(() => {
        if (chartRef.current && chartRef.current.chartArea) {
          setChartReady((v) => !v);
        }
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [chartType, themeVars, visitStats]);

  const chartData = useMemo(() => {
    if (visitStats.length === 0 && isLoading) {
      return { labels: [], datasets: [{ label: "방문자 수", data: [] }], yMax: 10 };
    }
    if (error) {
      return { labels: [], datasets: [{ label: "방문자 수", data: [] }], yMax: 10 };
    }

    const todayKst = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    const todayYear = todayKst.getFullYear();
    const todayMonth = (todayKst.getMonth() + 1).toString().padStart(2, '0');
    const todayDay = todayKst.getDate().toString().padStart(2, '0');
    const todayKstString = `${todayYear}-${todayMonth}-${todayDay}`;

    let processedLabels: string[] = [];
    let processedData: number[] = [];
    let originalDates: string[] = [];

    if (visitStats && visitStats.length > 0 && !isLoading && !error) {
      if (range === 'dayOfWeek') {
        processedLabels = visitStats.map(item => DAY_ABBREVIATIONS[new Date(item.date).getUTCDay()]);
        processedData = visitStats.map(item => item.views);
        originalDates = visitStats.map(item => item.date);
      } else if (range === 'daily') {
        processedLabels = visitStats.map(item => `${new Date(item.date).getUTCDate()}일`);
        processedData = visitStats.map(item => item.views);
        originalDates = visitStats.map(item => item.date);
      } else if (range === 'month') {
        const monthlyViews: { [month: string]: { views: number, originalDateForMonth?: string } } = {};
        const monthKeys: string[] = [];
        const currentYear = todayKst.getFullYear();
        const currentMonth = todayKst.getMonth();

        for (let i = 11; i >= 0; i--) {
          const d = new Date(currentYear, currentMonth - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          monthKeys.push(key);
          monthlyViews[key] = { views: 0 };
        }

        visitStats.forEach(item => {
          const itemDate = new Date(item.date);
          const monthKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
          if (monthlyViews.hasOwnProperty(monthKey)) {
            monthlyViews[monthKey].views += item.views;
            if (!monthlyViews[monthKey].originalDateForMonth || new Date(item.date) < new Date(monthlyViews[monthKey].originalDateForMonth!)) {
              monthlyViews[monthKey].originalDateForMonth = item.date;
            }
          }
        });
        processedLabels = monthKeys.map(key => MONTH_NAMES[parseInt(key.split('-')[1]) - 1]);
        processedData = monthKeys.map(key => monthlyViews[key]?.views || 0);
        originalDates = monthKeys.map(key => monthlyViews[key]?.originalDateForMonth || `${key}-01`);
      }
    } else if (!isLoading && !error) {
      const today = new Date();
      if (range === 'dayOfWeek') {
        for (let i = 6; i >= 0; i--) {
          const pastDate = new Date(today);
          pastDate.setDate(today.getDate() - i);
          processedLabels.push(DAY_ABBREVIATIONS[pastDate.getDay()]);
          originalDates.push(`${pastDate.getFullYear()}-${(pastDate.getMonth() + 1).toString().padStart(2, '0')}-${pastDate.getDate().toString().padStart(2, '0')}`);
        }
      } else if (range === 'daily') {
        for (let i = 13; i >= 0; i--) {
          const pastDate = new Date(today);
          pastDate.setDate(today.getDate() - i);
          processedLabels.push(`${pastDate.getDate()}일`);
          originalDates.push(`${pastDate.getFullYear()}-${(pastDate.getMonth() + 1).toString().padStart(2, '0')}-${pastDate.getDate().toString().padStart(2, '0')}`);
        }
      } else if (range === 'month') {
        for (let i = 11; i >= 0; i--) {
          const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
          processedLabels.push(MONTH_NAMES[d.getMonth()]);
          originalDates.push(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-01`);
        }
      }
      processedData = new Array(processedLabels.length).fill(0);
    }

    const todayHighlightColor = themeVars.accent;
    const defaultColor = themeVars.primary;

    const barChartBackgroundColors = originalDates.map(dateStr => {
      if (range === 'dayOfWeek' || range === 'daily') {
        return dateStr === todayKstString ? todayHighlightColor : defaultColor;
      } else if (range === 'month') {
        const d = new Date(dateStr);
        return d.getFullYear() === todayYear && d.getMonth() === todayKst.getMonth() ? todayHighlightColor : defaultColor;
      }
      return defaultColor;
    });

    const chartBackgroundColor: any = (ctx: any) => {
      const index = ctx.dataIndex;
      const baseColorForGradient = (barChartBackgroundColors[index] || defaultColor).substring(0, 7);
      const finalColor = barChartBackgroundColors[index] || defaultColor;

      if (chartType === 'bar' && chartRef.current && chartRef.current.ctx && chartRef.current.chartArea) {
        const gradient = chartRef.current.ctx.createLinearGradient(0, chartRef.current.chartArea.bottom, 0, chartRef.current.chartArea.top);
        gradient.addColorStop(0, baseColorForGradient + '22');
        gradient.addColorStop(0.7, baseColorForGradient + 'cc');
        gradient.addColorStop(1, finalColor);
        return gradient;
      }
      return finalColor;
    };

    const lineChartBorderColors = originalDates.map(dateStr => {
      if (range === 'dayOfWeek' || range === 'daily') {
        return dateStr === todayKstString ? todayHighlightColor : defaultColor;
      } else if (range === 'month') {
        const d = new Date(dateStr);
        return d.getFullYear() === todayYear && d.getMonth() === todayKst.getMonth() ? todayHighlightColor : defaultColor;
      }
      return defaultColor;
    });

    const maxValue = Math.max(...processedData, 0);
    let yMax;
    if (maxValue === 0) {
      yMax = 10;
    } else if (maxValue <= 8) {
      yMax = Math.ceil(maxValue * 1.25);
      if (yMax <= maxValue) yMax = maxValue + 1;
    } else {
      yMax = Math.ceil(maxValue * 1.25 / 10) * 10;
    }
    if (maxValue > 0 && yMax < 5) yMax = 5;


    return {
      labels: processedLabels,
      datasets: [
        {
          label: "방문자 수",
          data: processedData,
          backgroundColor: chartType === 'bar' ? chartBackgroundColor : undefined,
          hoverBackgroundColor: chartType === 'bar' ? (ctx: any) => {
            const index = ctx.dataIndex;
            const baseColor = (barChartBackgroundColors[index] || defaultColor).substring(0, 7);
            const finalColor = barChartBackgroundColors[index] || defaultColor;

            if (chartRef.current && chartRef.current.ctx && chartRef.current.chartArea) {
              const gradient = chartRef.current.ctx.createLinearGradient(0, chartRef.current.chartArea.bottom, 0, chartRef.current.chartArea.top);
              const hoverBaseColorLightened = lightenHex(baseColor, 10);

              gradient.addColorStop(0, hoverBaseColorLightened + '33');
              gradient.addColorStop(0.7, hoverBaseColorLightened + 'dd');
              gradient.addColorStop(1, hoverBaseColorLightened);
              return gradient;
            }
            return finalColor + 'dd';
          } : undefined,
          borderColor: chartType === 'bar' ? 'rgba(0,0,0,0)' : lineChartBorderColors,
          borderWidth: chartType === 'bar' ? 0 : 3,
          pointBackgroundColor: chartType === 'line' ? (context: any) => {
            const index = context.dataIndex;
            const dateStr = originalDates[index];
            if (range === 'dayOfWeek' || range === 'daily') {
              return dateStr === todayKstString ? todayHighlightColor : themeVars.card;
            } else if (range === 'month') {
              const d = new Date(dateStr);
              return d.getFullYear() === todayYear && d.getMonth() === todayKst.getMonth() ? todayHighlightColor : themeVars.card;
            }
            return themeVars.card;
          } : themeVars.card,
          pointBorderColor: chartType === 'line' ? lineChartBorderColors : themeVars.primary,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: chartType === 'line',
          tension: 0.4,
          borderRadius: chartType === 'bar' ? { topLeft: 8, topRight: 8, bottomLeft: 0, bottomRight: 0 } : undefined,
          barPercentage: chartType === 'bar' ? 0.85 : undefined,
          categoryPercentage: chartType === 'bar' ? 0.9 : undefined,
          borderSkipped: chartType === 'bar' ? false : undefined,
        },
      ],
      yMax,
    };
  }, [themeVars, chartRef.current, chartType, chartReady, range, visitStats, isLoading, error]);

  const commonOptions = useMemo(() => {
    let yAxisStepSize;
    if (chartData.yMax <= 10) {
      yAxisStepSize = 1;
    } else if (chartData.yMax <= 50) {
      yAxisStepSize = 10;
    } else if (chartData.yMax <= 200) {
      yAxisStepSize = 50;
    } else {
      yAxisStepSize = (range === 'month' ? Math.ceil(chartData.yMax / 5 / 100) * 100 : 50);
    }
    if (yAxisStepSize === 0 && chartData.yMax > 0) yAxisStepSize = Math.ceil(chartData.yMax / 5) || 1;
    if (chartData.yMax === 0) yAxisStepSize = 1;


    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: {
          enabled: true,
          backgroundColor: themeVars.card,
          titleColor: themeVars.primary,
          bodyColor: themeVars.foreground,
          borderColor: themeVars.border,
          borderWidth: 1,
          padding: 10,
          caretSize: 6,
          cornerRadius: 6,
          callbacks: {
            title: function (tooltipItems: any) {
              return tooltipItems[0].label;
            },
            label: function (tooltipItem: any) {
              return `방문자: ${tooltipItem.raw}`;
            }
          }
        },
        datalabels: {
          anchor: 'end' as const,
          align: chartType === 'bar' ? 'end' as const : 'top' as const,
          color: themeVars.foreground,
          font: function (context: { chart: { width: any; }; }) {
            const width = context.chart.width;
            const calculatedSize = Math.round(width / 48);
            const size = Math.max(12, Math.min(calculatedSize, 16));
            return { size: size, weight: 500 };
          },
          formatter: (value: number) => value > 0 ? value : '',
          clamp: true,
          offset: 8,
          display: true,
          padding: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
      layout: { padding: { top: 20, bottom: 8, left: 8, right: 8 } },
      scales: {
        x: {
          grid: { display: false },
          offset: true,
          ticks: {
            color: themeVars.mutedFg,
            font: function (context: { chart: { width: any; }; }) {
              const width = context.chart.width;
              const calculatedSize = Math.round(width / 44);
              const size = Math.max(10, Math.min(calculatedSize, 12));
              return { size: size, weight: 500 };
            },
            padding: 0,
          },
        },
        y: {
          grid: { color: themeVars.muted, drawBorder: false },
          ticks: {
            color: themeVars.mutedFg,
            font: { size: 13, family: 'inherit', weight: 500 },
            stepSize: yAxisStepSize,
            padding: 6,
          },
          beginAtZero: true,
          border: { display: false },
          max: chartData.yMax,
          offset: chartType === 'line',
        },
      },
    };
  }, [themeVars, chartReady, chartRef.current, chartData.yMax, range, chartType]);


  return (
    <Card className={cn("py-3 gap-4 flex flex-col group h-[25rem]", isLoading && !showContent ? "items-center justify-center" : "")}>
      {isLoading && !showContent ? (
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <CardHeader className={cn("transition-opacity duration-300 ease-in-out w-full", showContent ? "opacity-100" : "opacity-0")}>
            <div className="flex items-center justify-between h-full">
              <CardTitle className="flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2 text-muted-foreground" aria-hidden="true" />
                방문자 그래프
              </CardTitle>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" aria-label="범위 선택" className="flex items-center gap-1 cursor-pointer">
                      {range === 'dayOfWeek' ? '요일별 (최근 7일)' : range === 'daily' ? '일별 (최근 14일)' : '월별 (지난 12개월)'}
                      <ChevronDownIcon className="size-4 ml-1 opacity-70" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setRange('dayOfWeek')}>
                      요일별 (최근 7일)
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setRange('daily')}>
                      일별 (최근 14일)
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setRange('month')}>
                      월별 (지난 12개월)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  onClick={() => setChartType(chartType === 'bar' ? 'line' : 'bar')}
                  aria-pressed={chartType === 'bar'}
                  className="cursor-pointer"
                >
                  {chartType === 'bar' ? (
                    <>
                      선
                      <ArrowsRightLeftIcon className="w-4 h-4 ml-1 inline-block align-text-bottom opacity-70" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      막대
                      <ArrowsRightLeftIcon className="w-4 h-4 ml-1 inline-block align-text-bottom opacity-70" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className={cn("flex-1 overflow-y-auto hover-scrollbar w-full transition-opacity duration-300 ease-in-out", showContent ? "opacity-100" : "opacity-0")}>
            <div className="w-full h-full min-h-[300px]">
              {error && !isLoading && <div className="flex items-center justify-center h-full text-destructive">{error.message}</div>}
              {!error && visitStats.length === 0 && !isLoading && <div className="flex items-center justify-center h-full">표시할 데이터가 없습니다.</div>}
              {!error && visitStats.length > 0 && !isLoading && (
                chartType === 'bar' ? (
                  <Bar
                    ref={chartRef}
                    data={chartData}
                    options={commonOptions as any}
                    style={{ width: '100%', height: '100%' }}
                    plugins={[ChartDataLabels]}
                  />
                ) : (
                  <Line
                    data={chartData}
                    options={commonOptions as any}
                    style={{ width: '100%', height: '100%' }}
                    plugins={[ChartDataLabels]}
                  />
                )
              )}
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}

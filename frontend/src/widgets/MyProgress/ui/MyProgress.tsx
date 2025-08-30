import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { getMyStats, type UserStats, type CourseProgressStat } from '../../../shared/api/users';
import { Card } from '../../../shared/ui/Card';
import { motion } from 'framer-motion';

const CourseProgressBar = ({ title, percentage, completed, total, xp_earned }: CourseProgressStat) => (
    <div>
        <div className="flex justify-between mb-1 text-sm">
            <span className="font-bold text-text-primary">{title}</span>
            <span className="font-semibold text-primary">{percentage}%</span>
        </div>
        <div className="w-full bg-surface rounded-full h-2.5 border border-border">
            <motion.div 
                className="bg-primary h-2.5 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
            />
        </div>
        <div className="flex justify-between mt-1 text-xs text-text-secondary">
            <span>{completed} / {total} уроков</span>
            <span>{xp_earned} XP</span>
        </div>
    </div>
);

export const MyProgress = () => {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const data = await getMyStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return <p className="text-center p-10">Загрузка статистики...</p>;
    }
    if (!stats) {
        return <p className="text-center text-danger p-10">Не удалось загрузить статистику.</p>;
    }

    const radarOption = {
        color: ['#58A6FF'],
        tooltip: { trigger: 'item' },
        radar: {
            indicator: stats.radar_chart.length > 0
                ? stats.radar_chart.map(item => ({ name: item.name, max: Math.max(...stats.radar_chart.map(i => i.value), 50) }))
                : [{name: 'Начните учиться', max: 100}],
            shape: 'circle', center: ['50%', '55%'], radius: '70%',
            axisName: { color: '#8B949E', fontSize: 12 },
            splitArea: { areaStyle: { color: ['rgba(22, 27, 34, 0.7)', 'rgba(31, 111, 235, 0.1)'], shadowColor: 'rgba(0, 0, 0, 0.2)', shadowBlur: 10 } },
            splitLine: { lineStyle: { color: 'rgba(139, 148, 158, 0.2)' } },
            axisLine: { lineStyle: { color: 'rgba(139, 148, 158, 0.2)' } }
        },
        series: [{
            name: 'XP по направлениям', type: 'radar',
            data: [{ value: stats.radar_chart.length > 0 ? stats.radar_chart.map(item => item.value) : [0], name: 'XP', areaStyle: { color: 'rgba(88, 166, 255, 0.4)' } }]
        }]
    };

    const last7DaysData = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toISOString().slice(0, 10);
        const activity = stats.heatmap.find(h => h[0] === dateString);
        return {
            day: d.toLocaleDateString('ru-RU', { weekday: 'short' }),
            count: activity ? activity[1] : 0,
        };
    }).reverse();

    const barChartOption = {
        tooltip: { trigger: 'axis', backgroundColor: 'rgb(var(--color-surface))', borderColor: 'rgb(var(--color-border))', textStyle: { color: 'rgb(var(--color-text-primary))' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
            type: 'category',
            data: last7DaysData.map(d => d.day),
            axisTick: { show: false },
            axisLine: { lineStyle: { color: 'rgb(var(--color-border))' } },
            axisLabel: { color: 'rgb(var(--color-text-secondary))' }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: 'rgb(var(--color-border))', type: 'dashed' } },
            axisLabel: { color: 'rgb(var(--color-text-secondary))' }
        },
        series: [{
            name: 'Уроков пройдено',
            type: 'bar',
            barWidth: '40%',
            data: last7DaysData.map(d => d.count),
            itemStyle: { color: 'rgb(var(--color-primary))', borderRadius: [4, 4, 0, 0] },
            emphasis: { itemStyle: { color: 'rgb(var(--color-secondary))' } }
        }]
    };

    return (
        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="space-y-8">
            <Card>
                <h3 className="text-xl font-bold mb-6 text-primary">Прогресс по курсам</h3>
                <div className="space-y-6">
                    {stats.courses_progress.length > 0 ? (
                        stats.courses_progress.map(p => <CourseProgressBar key={p.id} {...p} />)
                    ) : (
                        <p className="text-text-secondary">Начните проходить курсы, чтобы увидеть свой прогресс!</p>
                    )}
                </div>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h3 className="text-xl font-bold mb-4 text-primary">Владение направлениями</h3>
                    <ReactECharts option={radarOption} style={{ height: '350px' }} theme="dark" />
                </Card>
                <Card>
                    <h3 className="text-xl font-bold mb-4 text-primary">Активность за неделю</h3>
                    <ReactECharts option={barChartOption} style={{ height: '350px' }} />
                </Card>
            </div>
        </motion.div>
    );
};
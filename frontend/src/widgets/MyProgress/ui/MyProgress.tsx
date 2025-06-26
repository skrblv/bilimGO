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
            shape: 'circle',
            center: ['50%', '55%'],
            radius: '70%',
            axisName: { color: '#8B949E', fontSize: 12 },
            splitArea: { areaStyle: { color: ['rgba(22, 27, 34, 0.7)', 'rgba(31, 111, 235, 0.1)'], shadowColor: 'rgba(0, 0, 0, 0.2)', shadowBlur: 10 } },
            splitLine: { lineStyle: { color: 'rgba(139, 148, 158, 0.2)' } },
            axisLine: { lineStyle: { color: 'rgba(139, 148, 158, 0.2)' } }
        },
        series: [{
            name: 'XP по направлениям',
            type: 'radar',
            data: [{ 
                value: stats.radar_chart.length > 0 ? stats.radar_chart.map(item => item.value) : [0], 
                name: 'XP',
                areaStyle: {
                    color: 'rgba(88, 166, 255, 0.4)'
                }
            }]
        }]
    };

    const getVirtulData = (year: string) => {
        const startDate = new Date(Number(year), 0, 1);
        const endDate = new Date(Number(year) + 1, 0, 1);
        const dayTime = 3600 * 24 * 1000;
        let data: [string, number][] = [];
        for (let time = startDate.getTime(); time < endDate.getTime(); time += dayTime) {
            const formattedDate = new Date(time).toISOString().slice(0, 10);
            const activity = stats.heatmap.find(d => d[0] === formattedDate);
            data.push([
                formattedDate,
                activity ? activity[1] : 0
            ]);
        }
        return data;
    }

    const heatmapOption = {
        tooltip: {
            position: 'top',
            formatter: (p: any) => `${p.data[0]}: ${p.data[1]} уроков`
        },
        visualMap: {
            show: false,
            min: 0,
            max: Math.max(...stats.heatmap.map(item => item[1]), 5),
            inRange: { color: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'] }
        },
        calendar: {
            top: 60,
            left: 30,
            right: 30,
            cellSize: ['auto', 13],
            range: new Date().getFullYear().toString(),
            itemStyle: { borderWidth: 2.5, borderColor: '#0D1117', color: '#161b22' },
            yearLabel: { show: false },
            monthLabel: { color: '#C9D1D9', nameMap: 'ru' },
            dayLabel: { color: '#8B949E', nameMap: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'] },
            splitLine: { show: false }
        },
        series: {
            type: 'heatmap',
            coordinateSystem: 'calendar',
            data: getVirtulData(new Date().getFullYear().toString())
        }
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
                    <h3 className="text-xl font-bold mb-4 text-primary">Календарь активности</h3>
                    <ReactECharts option={heatmapOption} style={{ height: '170px' }} theme="dark" />
                </Card>
            </div>
        </motion.div>
    );
};
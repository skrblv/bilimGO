import { useLocation, Link, useParams } from 'react-router-dom';
import type { TestResult } from '../shared/api/testing';
import { Button } from '../shared/ui/Button';
import ReactECharts from 'echarts-for-react';

export const TestResultPage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const location = useLocation();
    const result: TestResult | undefined = location.state?.result;

    if (!result) {
        return (
            <div className="text-center p-10 flex flex-col items-center">
                <p className="text-xl">Результаты не найдены.</p>
                <Link to={`/courses/${courseId}`}><Button className="mt-4 !w-auto">Вернуться к курсу</Button></Link>
            </div>
        );
    }

    const gaugeOption = {
        series: [{
            type: 'gauge',
            startAngle: 90,
            endAngle: -270,
            pointer: { show: false },
            progress: { show: true, overlap: false, clip: false, itemStyle: {
                borderWidth: 1.5, borderColor: '#484F58'
            }},
            axisLine: { lineStyle: { width: 40 }},
            splitLine: { show: false },
            axisTick: { show: false },
            axisLabel: { show: false },
            data: [{
                value: result.score,
                name: 'Ваш результат',
                title: { offsetCenter: ['0%', '-30%'], color: '#8B949E' },
                detail: { valueAnimation: true, offsetCenter: ['0%', '10%'], color: 'auto' }
            }],
            title: { fontSize: 14 },
            detail: {
                width: 50, height: 14,
                fontSize: 40,
                color: 'auto',
                formatter: '{value}%'
            }
        }]
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
            {result.is_passed ? (
                <>
                    <p className="text-7xl mb-4">🎉</p>
                    <h1 className="text-4xl font-bold text-success">Поздравляем! Тест пройден!</h1>
                </>
            ) : (
                <>
                    <p className="text-7xl mb-4">😔</p>
                    <h1 className="text-4xl font-bold text-danger">Попробуйте еще раз</h1>
                    <p className="text-text-secondary mt-2">Для успешной сдачи необходимо 80%.</p>
                </>
            )}
            
            <div className="w-64 h-64 my-4">
                <ReactECharts option={gaugeOption} style={{ height: '100%' }}/>
            </div>
            
            <div className="flex gap-4">
                <Link to={`/courses/${courseId}/test`}><Button variant="secondary" className="!w-auto">Пройти тест снова</Button></Link>
                <Button className="!w-auto" disabled>Скачать сертификат</Button>
            </div>
        </div>
    );
};
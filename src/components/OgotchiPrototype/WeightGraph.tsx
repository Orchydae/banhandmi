import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeightEntry } from '../../hooks/useDogProfile';
import './OgotchiPrototype.css';

interface WeightGraphProps {
    data: WeightEntry[];
    onBack?: () => void;
    onClose?: () => void;
}

interface TooltipPayload {
    value: number | string;
    payload?: {
        weight: number;
        date: string;
    };
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
    if (active && payload && payload.length && label) {
        return (
            <div className="ogotchi-graph__tooltip">
                <p className="ogotchi-graph__tooltip-date">{new Date(label).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p>
                <p className="ogotchi-graph__tooltip-weight">{`${payload[0].value} kg`}</p>
            </div>
        );
    }
    return null;
};

export const WeightGraph: React.FC<WeightGraphProps> = ({ data, onBack, onClose }) => {
    const sortedData = React.useMemo(
        () => [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        [data]
    );

    if (!sortedData || sortedData.length === 0) {
        return (
            <div className="ogotchi-graph__container">
                {onBack && <button className="ogotchi-graph__back" onClick={onBack}>&larr; Back</button>}
                <div className="ogotchi-menu__loading">No weight data available.</div>
            </div>
        );
    }

    return (
        <div className="ogotchi-graph__container">
            <h3 className="ogotchi-graph__title" onClick={onClose}>Weight History</h3>

            <div className="ogotchi-graph__chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={sortedData}
                        margin={{
                            top: 10,
                            right: 10,
                            left: -25,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#fff" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.2)" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString(undefined, { month: 'short' })}
                            stroke="rgba(255,255,255,0.6)"
                            tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            domain={['dataMin - 1', 'dataMax + 1']}
                            stroke="rgba(255,255,255,0.6)"
                            tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="weight"
                            stroke="#fff"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorWeight)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

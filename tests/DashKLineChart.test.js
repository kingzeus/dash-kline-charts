/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashKLineChart from '../src/lib/components/DashKLineChart.react';

// Mock KLineChart library
const mockChart = {
    setSymbol: jest.fn(),
    setPeriod: jest.fn(),
    setDataLoader: jest.fn(),
    setStyles: jest.fn(),
    removeIndicator: jest.fn(),
    createIndicator: jest.fn(),
};

const mockKLineCharts = {
    init: jest.fn(() => mockChart),
    dispose: jest.fn(),
};

// Mock window.klinecharts
Object.defineProperty(window, 'klinecharts', {
    value: mockKLineCharts,
    writable: true,
});

describe('DashKLineChart', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        // Reset window.klinecharts
        window.klinecharts = mockKLineCharts;
    });

    const sampleData = [
        {
            timestamp: 1609459200000,
            open: 100,
            high: 110,
            low: 90,
            close: 105,
            volume: 1000
        },
        {
            timestamp: 1609545600000,
            open: 105,
            high: 115,
            low: 100,
            close: 110,
            volume: 1200
        }
    ];

    test('renders without crashing', () => {
        render(<DashKLineChart id="test-chart" />);
        const chartContainer = document.getElementById('test-chart');
        expect(chartContainer).toBeInTheDocument();
    });

    test('renders with custom id and className', () => {
        render(<DashKLineChart id="test-chart" className="custom-chart" />);
        const chartElement = document.getElementById('test-chart');
        expect(chartElement).toBeInTheDocument();
        expect(chartElement).toHaveClass('custom-chart');
    });

    test('renders with custom style', () => {
        const customStyle = { height: '500px', width: '100%' };
        render(<DashKLineChart id="style-chart" style={customStyle} />);
        const chartContainer = document.getElementById('style-chart');
        expect(chartContainer).toHaveStyle('height: 500px');
        expect(chartContainer).toHaveStyle('width: 100%');
    });

    test('renders with data prop', () => {
        render(<DashKLineChart id="data-chart" data={sampleData} />);
        expect(document.getElementById('data-chart')).toBeInTheDocument();
    });

    test('renders with config prop', () => {
        const config = { theme: 'dark' };
        render(<DashKLineChart id="config-chart" config={config} />);
        expect(document.getElementById('config-chart')).toBeInTheDocument();
    });

    test('renders with indicators prop', () => {
        const indicators = [
            { name: 'MA', params: [5, 10, 20] },
            { name: 'RSI', params: [14] }
        ];
        render(<DashKLineChart id="indicators-chart" indicators={indicators} />);
        expect(document.getElementById('indicators-chart')).toBeInTheDocument();
    });

    test('renders with symbol prop', () => {
        render(<DashKLineChart id="symbol-chart" symbol="AAPL" />);
        expect(document.getElementById('symbol-chart')).toBeInTheDocument();
    });

    test('renders with all props', () => {
        const config = { theme: 'dark' };
        const indicators = [{ name: 'MA', params: [5, 10, 20] }];
        const style = { height: '600px' };

        render(
            <DashKLineChart
                id="full-chart"
                className="full-chart-class"
                data={sampleData}
                config={config}
                indicators={indicators}
                symbol="AAPL"
                style={style}
                responsive={false}
            />
        );

        const chartElement = document.getElementById('full-chart');
        expect(chartElement).toBeInTheDocument();
        expect(chartElement).toHaveClass('full-chart-class');
        expect(chartElement).toHaveStyle('height: 600px');
    });

    test('has correct default props', () => {
        expect(DashKLineChart.defaultProps).toEqual({
            data: [],
            config: {},
            indicators: [],
            style: {},
            className: '',
            responsive: true
        });
    });

    test('has correct prop types', () => {
        const propTypes = DashKLineChart.propTypes;
        expect(propTypes).toHaveProperty('id');
        expect(propTypes).toHaveProperty('data');
        expect(propTypes).toHaveProperty('config');
        expect(propTypes).toHaveProperty('indicators');
        expect(propTypes).toHaveProperty('symbol');
        expect(propTypes).toHaveProperty('style');
        expect(propTypes).toHaveProperty('className');
        expect(propTypes).toHaveProperty('responsive');
        expect(propTypes).toHaveProperty('setProps');
    });

    test('handles empty data gracefully', () => {
        render(<DashKLineChart id="empty-chart" data={[]} />);
        // 验证组件能正确渲染，不会崩溃
        expect(document.getElementById('empty-chart')).toBeInTheDocument();
    });

    test('handles missing volume in data', () => {
        const dataWithoutVolume = [{
            timestamp: 1609459200000,
            open: 100,
            high: 110,
            low: 90,
            close: 105
        }];

        render(<DashKLineChart id="no-volume-chart" data={dataWithoutVolume} />);
        expect(document.getElementById('no-volume-chart')).toBeInTheDocument();
    });

    test('handles complex config object', () => {
        const complexConfig = {
            theme: 'dark',
            grid: {
                show: true,
                horizontal: { show: true },
                vertical: { show: true }
            },
            candle: {
                type: 'candle_solid'
            },
            crosshair: {
                show: true,
                horizontal: { show: true },
                vertical: { show: true }
            }
        };

        render(<DashKLineChart id="complex-chart" config={complexConfig} />);
        expect(document.getElementById('complex-chart')).toBeInTheDocument();
    });

    test('handles multiple indicators', () => {
        const indicators = [
            { name: 'MA', params: [5, 10, 20], visible: true },
            { name: 'RSI', params: [14], visible: false },
            { name: 'MACD', params: [12, 26, 9] }
        ];

            render(<DashKLineChart id="multi-indicators-chart" indicators={indicators} />);
            expect(document.getElementById('multi-indicators-chart')).toBeInTheDocument();
    });
});
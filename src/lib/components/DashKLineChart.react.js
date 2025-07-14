import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// 使用全局的klinecharts对象（通过UMD加载）
// const getKlineCharts = () => {
//     if (typeof window !== 'undefined' && window.klinecharts) {
//         return window.klinecharts;
//     }
//     console.error('KLineCharts not found. Make sure klinecharts.min.js is loaded.');
//     return null;
// };

// 延迟获取klinecharts，因为它可能还没有加载
// const getInit = () => {
//     const lib = getKlineCharts();
//     return lib ? lib.init : null;
// };

// const getDispose = () => {
//     const lib = getKlineCharts();
//     return lib ? lib.dispose : null;
// };

// 深度比较工具函数 - 暂时注释，未来可能使用
// const deepEqual = (obj1, obj2) => {
//     if (obj1 === obj2) return true;
//
//     if (obj1 == null || obj2 == null) return obj1 === obj2;
//
//     if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
//
//     if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
//
//     const keys1 = Object.keys(obj1);
//     const keys2 = Object.keys(obj2);
//
//     if (keys1.length !== keys2.length) return false;
//
//     for (let key of keys1) {
//         if (!keys2.includes(key)) return false;
//         if (!deepEqual(obj1[key], obj2[key])) return false;
//     }
//
//     return true;
// };

// 防抖函数 - 暂时注释，未来可能使用
// const debounce = (func, wait) => {
//     let timeout;
//     return function executedFunction(...args) {
//         const later = () => {
//             clearTimeout(timeout);
//             func(...args);
//         };
//         clearTimeout(timeout);
//         timeout = setTimeout(later, wait);
//     };
// };

// 节流函数 - 暂时注释，未来可能使用
// const throttle = (func, limit) => {
//     let inThrottle;
//     return function executedFunction(...args) {
//         if (!inThrottle) {
//             func.apply(this, args);
//             inThrottle = true;
//             setTimeout(() => inThrottle = false, limit);
//         }
//     };
// };

// 工具函数：数据验证
const validateKLineData = (data, chartType = 'candle') => {
    if (!Array.isArray(data)) return false;

    // 允许空数组
    if (data.length === 0) return true;

    // 获取图表类型，支持通过 config.candle.type 传递
    const type = typeof chartType === 'object' && chartType.candle?.type ? chartType.candle.type : chartType;

    return data.every(item => {
        if (item === null || typeof item !== 'object' || !('timestamp' in item) || typeof item.timestamp !== 'number') {
            return false;
        }

        // 对于面积图（area），只需要 timestamp 和 close
        if (type === 'area') {
            return 'close' in item && typeof item.close === 'number';
        }

        // 对于蜡烛图（candle）和其他类型，需要完整的 OHLC 数据
        return 'open' in item &&
            'high' in item &&
            'low' in item &&
            'close' in item &&
            typeof item.open === 'number' &&
            typeof item.high === 'number' &&
            typeof item.low === 'number' &&
            typeof item.close === 'number' &&
            item.high >= item.low &&
            item.open >= item.low && item.open <= item.high &&
            item.close >= item.low && item.close <= item.high &&
            (!('volume' in item) || typeof item.volume === 'number');
    });
};

// 工具函数：获取主题配置
const getThemeConfig = (theme) => {
    const themes = {
        light: {
            background: '#ffffff',
            text: '#333333',
            grid: '#e0e0e0',
            candle: {
                up: '#26A69A',
                down: '#EF5350',
                noChange: '#888888',
            },
        },
        dark: {
            background: '#1e1e1e',
            text: '#ffffff',
            grid: '#444444',
            candle: {
                up: '#4caf50',
                down: '#f44336',
                noChange: '#888888',
            },
        },
    };
    return themes[theme] || themes.light;
};

// 工具函数：合并配置
const mergeConfig = (defaultConfig, userConfig) => {
    return { ...defaultConfig, ...userConfig };
};

// ResizeObserver Hook
const useResizeObserver = (callback) => {
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new ResizeObserver(callback);
        observer.observe(ref.current);

        return () => observer.disconnect();
    }, [callback]);

    return ref;
};

/**
 * DashKLineChart is a Dash component for displaying financial charts using KLineChart v10.
 * It takes data in OHLC format and renders a beautiful, interactive candlestick chart.
 *
 * Performance optimizations:
 * - useMemo and useCallback for performance optimization
 * - Separated initialization, data updates, config updates, and indicator updates
 * - ResizeObserver for responsive design
 * - Improved error handling and lifecycle management
 * - Better memory management and resource cleanup
 */
const DashKLineChart = ({
    id,
    data = [],
    config = {},
    indicators = [],
    style = {},
    className = '',
    responsive = true,
    symbol
}) => {
    const containerRef = useRef(null);
    const chartRef = useRef(null);

    // 规范化数据：确保 null 和 undefined 被转换为空数组
    const normalizedData = useMemo(() => {
        if (data === null || data === undefined) {
            return [];
        }
        return Array.isArray(data) ? data : [];
    }, [data]);

    // 默认配置
    const defaultConfig = useMemo(() => ({
        theme: 'light',
        grid: {
            show: true,
            horizontal: { show: true },
            vertical: { show: true },
        },
        candle: {
            type: 'candle_solid',
        },
        crosshair: {
            show: true,
            horizontal: { show: true },
            vertical: { show: true },
        },
        yAxis: {
            show: true,
            position: 'right',
        },
        xAxis: {
            show: true,
            position: 'bottom',
        },
    }), []);

    // 合并配置
    const mergedConfig = useMemo(
        () => mergeConfig(defaultConfig, config),
        [defaultConfig, config]
    );

    // 获取主题
    const theme = useMemo(
        () => getThemeConfig(mergedConfig.theme),
        [mergedConfig.theme]
    );

    // 验证数据（使用规范化后的数据）
    const isValidData = useMemo(() => validateKLineData(normalizedData, mergedConfig), [normalizedData, mergedConfig]);

    // 初始化图表
    const initializeChart = useCallback(() => {
        if (!containerRef.current || !isValidData) return;

        try {
            // 检查klinecharts是否可用
            if (!window.klinecharts) {
                console.error('KLineCharts library not available');
                return;
            }

            // 销毁旧图表
            if (chartRef.current) {
                klinecharts.dispose(containerRef.current);
                chartRef.current = null;
            }

            // 创建新图表
            const chartInstance = klinecharts.init(containerRef.current);

            if (!chartInstance) {
                console.error('Failed to initialize chart instance');
                return;
            }

            chartRef.current = chartInstance;

            // 设置Symbol和Period（v10必需配置）
            chartInstance.setSymbol({
                ticker: symbol || 'DASH-KLINE',
                pricePrecision: 2,
                volumePrecision: 0,
            });

            chartInstance.setPeriod({
                type: 'day',
                span: 1,
            });

            // 设置数据加载器（v10新API）
            chartInstance.setDataLoader({
                getBars: (params) => {
                    // 根据参数类型处理数据
                    if (params.type === 'init' || params.type === 'update') {
                        params.callback(normalizedData, false);
                    } else if (params.type === 'forward' || params.type === 'backward') {
                        // 对于前向/后向加载，返回空数组表示没有更多数据
                        params.callback([], false);
                    }
                },
            });

            // 应用样式配置
            updateChartStyles(chartInstance, mergedConfig, theme);

            // 添加技术指标
            updateChartIndicators(chartInstance, indicators);

        } catch (error) {
            console.error('Failed to initialize chart:', error);
        }
    }, [normalizedData, mergedConfig, indicators, isValidData, theme, symbol, updateChartStyles, updateChartIndicators]);

    // 更新图表数据
    const updateChartData = useCallback(() => {
        if (!chartRef.current || !isValidData) return;

        try {
            // 使用v10新API更新数据
            chartRef.current.setDataLoader({
                getBars: (params) => {
                    if (params.type === 'init' || params.type === 'update') {
                        params.callback(normalizedData, false);
                    } else if (params.type === 'forward' || params.type === 'backward') {
                        params.callback([], false);
                    }
                },
            });
        } catch (error) {
            console.error('Failed to update chart data:', error);
        }
    }, [normalizedData, isValidData]);

    // 更新图表样式
    const updateChartStyles = useCallback((chartInstance, config, themeConfig) => {
        if (!chartInstance) return;

        try {
            const styles = {
                grid: {
                    show: config.grid?.show ?? true,
                    horizontal: {
                        show: config.grid?.horizontal?.show ?? true,
                        color: themeConfig.grid,
                        style: 'dash'
                    },
                    vertical: {
                        show: config.grid?.vertical?.show ?? true,
                        color: themeConfig.grid,
                        style: 'dash'
                    }
                },
                candle: {
                    type: config.candle?.type ?? 'candle_solid',
                    bar: {
                        upColor: themeConfig.candle.up,
                        downColor: themeConfig.candle.down,
                        noChangeColor: themeConfig.candle.noChange,
                        upBorderColor: themeConfig.candle.up,
                        downBorderColor: themeConfig.candle.down,
                        noChangeBorderColor: themeConfig.candle.noChange,
                        upWickColor: themeConfig.candle.up,
                        downWickColor: themeConfig.candle.down,
                        noChangeWickColor: themeConfig.candle.noChange
                    }
                },
                crosshair: {
                    show: config.crosshair?.show ?? true,
                    horizontal: {
                        show: config.crosshair?.horizontal?.show ?? true,
                        line: {
                            color: themeConfig.text,
                            style: 'dash'
                        }
                    },
                    vertical: {
                        show: config.crosshair?.vertical?.show ?? true,
                        line: {
                            color: themeConfig.text,
                            style: 'dash'
                        }
                    }
                },
                yAxis: {
                    show: config.yAxis?.show ?? true,
                    position: config.yAxis?.position ?? 'right',
                    axisLine: {
                        show: true,
                        color: themeConfig.grid
                    },
                    tickLine: {
                        show: true,
                        color: themeConfig.grid
                    },
                    tickText: {
                        show: true,
                        color: themeConfig.text
                    }
                },
                xAxis: {
                    show: config.xAxis?.show ?? true,
                    position: config.xAxis?.position ?? 'bottom',
                    axisLine: {
                        show: true,
                        color: themeConfig.grid
                    },
                    tickLine: {
                        show: true,
                        color: themeConfig.grid
                    },
                    tickText: {
                        show: true,
                        color: themeConfig.text
                    }
                }
            };

            chartInstance.setStyles(styles);

            // 设置容器背景色
            if (containerRef.current) {
                containerRef.current.style.backgroundColor = themeConfig.background;
            }
        } catch (error) {
            console.error('Failed to update chart styles:', error);
        }
    }, []);

    // 更新技术指标
    const updateChartIndicators = useCallback((chartInstance, indicatorList) => {
        if (!chartInstance) return;

        try {
            // 清除现有指标
            chartInstance.removeIndicator();

            // 添加新指标
            if (indicatorList && indicatorList.length > 0) {
                indicatorList.forEach((indicator) => {
                    if (indicator.visible !== false) {
                        try {
                            chartInstance.createIndicator(
                                indicator.name,
                                true,
                                { params: indicator.params }
                            );
                        } catch (error) {
                            console.warn(`Failed to create indicator ${indicator.name}:`, error);
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Failed to update indicators:', error);
        }
    }, []);

    // 更新主题样式
    const updateTheme = useCallback(() => {
        if (!chartRef.current) return;

        updateChartStyles(chartRef.current, mergedConfig, theme);
    }, [mergedConfig, theme, updateChartStyles]);

    // 更新指标
    const updateIndicators = useCallback(() => {
        if (!chartRef.current) return;

        updateChartIndicators(chartRef.current, indicators);
    }, [indicators, updateChartIndicators]);

    // 初始化图表
    useEffect(() => {
        if (!isValidData || normalizedData.length === 0) {
            return;
        }

        const timer = setTimeout(() => {
            initializeChart();
        }, 100);

        return () => {
            clearTimeout(timer);
        };
    }, [initializeChart, isValidData, normalizedData.length]);

    // 更新数据
    useEffect(() => {
        updateChartData();
    }, [updateChartData]);

    // 更新主题
    useEffect(() => {
        updateTheme();
    }, [updateTheme]);

    // 更新指标
    useEffect(() => {
        updateIndicators();
    }, [updateIndicators]);

    // 组件卸载时清理
    useEffect(() => {
        const container = containerRef.current; // 在 effect 中保存 ref 值
        return () => {
            if (chartRef.current && container) {
                try {
                    klinecharts.dispose(container);
                    chartRef.current = null;
                } catch (error) {
                    console.error('Failed to dispose chart:', error);
                }
            }
        };
    }, []);

    // 响应式处理
    const handleResize = useCallback(() => {
        if (!chartRef.current || !responsive) return;

        try {
            // 重新调整图表大小
            chartRef.current.resize();
        } catch (error) {
            console.error('Failed to resize chart:', error);
        }
    }, [responsive]);

    const resizeRef = useResizeObserver(handleResize);

    // 错误处理：数据格式错误
    if (!isValidData && normalizedData.length > 0) {
        return (
            <div
                id={id}
                className={`dash-kline-chart-error ${className}`}
                style={{
                    ...style,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.background,
                    color: theme.text,
                    border: `1px solid ${theme.grid}`,
                    borderRadius: '4px',
                    padding: '20px',
                    minHeight: '400px',
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <h3>数据格式错误</h3>
                    <p>
                        请确保数据格式正确，包含 timestamp、open、high、low、close 字段
                    </p>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                        数据验证失败：请检查价格关系 (high ≥ low, open/close 在 high-low 范围内)
                    </p>
                </div>
            </div>
        );
    }

    // 空数据状态
    if (!normalizedData || normalizedData.length === 0) {
        return (
            <div
                id={id}
                className={`dash-kline-chart-empty ${className}`}
                style={{
                    ...style,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fafafa',
                    color: '#999',
                    border: '1px dashed #ccc',
                    borderRadius: '4px',
                    padding: '20px',
                    minHeight: '400px',
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📈</div>
                    <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>暂无数据</h3>
                    <p style={{ margin: 0, fontSize: '14px' }}>请提供K线数据以显示图表</p>
                </div>
            </div>
        );
    }

    return (
        <div
            id={id}
            className={`dash-kline-chart ${className}`}
            style={{
                ...style,
                backgroundColor: theme.background,
                minHeight: '400px'
            }}
            ref={responsive ? resizeRef : undefined}
        >
            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '400px',
                }}
            />
        </div>
    );
};

DashKLineChart.defaultProps = {
    data: [],
    config: {},
    indicators: [],
    style: {},
    className: '',
    responsive: true
};

DashKLineChart.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,

    /**
     * The K-line data in OHLC format. Each item should be an object with:
     * - timestamp (number): Timestamp in milliseconds
     * - open (number): Opening price
     * - high (number): Highest price
     * - low (number): Lowest price
     * - close (number): Closing price
     * - volume (number, optional): Trading volume
     */
    data: PropTypes.arrayOf(PropTypes.shape({
        timestamp: PropTypes.number.isRequired,
        open: PropTypes.number.isRequired,
        high: PropTypes.number.isRequired,
        low: PropTypes.number.isRequired,
        close: PropTypes.number.isRequired,
        volume: PropTypes.number
    })),

    /**
     * Chart configuration options including:
     * - theme (string): Chart theme ('light' or 'dark')
     * - grid (object): Grid configuration
     * - candle (object): Candle configuration
     * - crosshair (object): Crosshair configuration
     * - yAxis (object): Y-axis configuration
     * - xAxis (object): X-axis configuration
     */
    config: PropTypes.object,

    /**
     * Technical indicators configuration. Each item should be an object with:
     * - name (string): Indicator name (e.g., 'MA', 'RSI', 'MACD')
     * - params (array): Indicator parameters
     * - visible (boolean, optional): Whether the indicator is visible
     */
    indicators: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        params: PropTypes.array,
        visible: PropTypes.bool
    })),

    /**
     * Symbol information for the chart
     */
    symbol: PropTypes.string,

    /**
     * CSS style properties
     */
    style: PropTypes.object,

    /**
     * CSS class name
     */
    className: PropTypes.string,

    /**
     * Whether to enable responsive design
     */
    responsive: PropTypes.bool
};

export default DashKLineChart;
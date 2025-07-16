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
 * DashKLineChart 是一个使用 KLineChart v10 显示金融图表的 Dash 组件。
 * 它接受 OHLC 格式的数据，并渲染出美观的交互式蜡烛图。
 *
 * 功能特性：
 * - 多种图表类型：蜡烛图、面积图、线图
 * - 技术指标：MA、RSI、MACD 等
 * - 交互式十字线和缩放功能
 * - 明暗主题
 * - 响应式设计，自动调整大小
 * - 实时数据更新
 *
 * @example
 * ```python
 * import dash_kline_charts as dkc
 *
 * dkc.DashKLineChart(
 *     id='my-chart',
 *     data=[
 *         {'timestamp': 1609459200000, 'open': 100, 'high': 110, 'low': 90, 'close': 105, 'volume': 1000},
 *         # ... more data
 *     ],
 *     config={'theme': 'dark', 'grid': {'show': True}},
 *     indicators=[{'name': 'MA', 'params': [5, 10, 20]}]
 * )
 * ```
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
                // 交易对唯一标识
                ticker: symbol || 'DASH-KLINE',
                // 价格精度
                pricePrecision: 2,
                // 数量精度
                volumePrecision: 0,
            });

            chartInstance.setPeriod({
                // 类型 支持 second ， minute ， hour ， day ， week ， month 和 year
                type: 'day',
                // 时间跨度
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
            const candleType = config.candle?.type ?? 'candle_solid';
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
                    type: candleType,
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
                    },
                    tooltip: {
                        title: {
                            show: config.candle?.tooltip?.title?.show ?? true,
                        },
                        legend: {
                            template: config.candle?.tooltip?.legend?.template ?? [
                                { title: 'time', value: '{time}' },
                                { title: 'open', value: '{open}' },
                                { title: 'high', value: '{high}' },
                                { title: 'low', value: '{low}' },
                                { title: 'close', value: '{close}' },
                                { title: 'volume', value: '{volume}' }
                            ]
                        }
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
                                {
                                    name: indicator.name,
                                    calcParams: indicator?.calcParams,
                                    styles: indicator?.styles,
                                },
                                indicator?.isStack,
                                {
                                    id: indicator?.paneOptions?.id,
                                }
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
                    <p style={{ margin: 0, fontSize: '14px' }}>请提供数据以显示图表</p>
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
     * 用于在 Dash 回调中识别此组件的 ID。
     */
    id: PropTypes.string,

        /**
     * OHLC 格式的 K 线数据。每个数据项应该是一个包含以下字段的对象：<br/>
     * - timestamp (number): 时间戳（毫秒）<br/>
     * - open (number): 开盘价, 面积图时可忽略<br/>
     * - high (number): 最高价, 面积图时可忽略<br/>
     * - low (number): 最低价, 面积图时可忽略<br/>
     * - close (number): 收盘价<br/>
     * - volume (number, 可选): 交易量
     */
    data: PropTypes.arrayOf(PropTypes.shape({
        timestamp: PropTypes.number.isRequired,
        open: PropTypes.number,
        high: PropTypes.number,
        low: PropTypes.number,
        close: PropTypes.number.isRequired,
        volume: PropTypes.number
    })),

        /**
     * 图表配置选项。此对象允许您自定义图表外观和行为。<br/><br/>
     * 可用选项：<br/>
     * - theme (string): 图表主题（'light' 或 'dark'）。默认：'light'<br/>
     * - grid (object): 网格配置<br/>
     *   - show (boolean): 是否显示网格线<br/>
     *   - horizontal (object): 水平网格线设置<br/>
     *   - vertical (object): 垂直网格线设置<br/>
     * - candle (object): 蜡烛图/图表类型配置<br/>
     *   - type (string): 图表类型（'candle_solid', 'area', 'line'）<br/>
     *   - tooltip (object): 图例提示<br/>
     *     - title (object): 标题配置<br/>
     *       - show (boolean): 是否显示标题<br/>
     *     - legend (object): 图例设置<br/>
     *       - template (array): 图例模板，包含多个对象，每个对象有 title 和 value 字段<br/>
     * - crosshair (object): 十字线配置<br/>
     *   - show (boolean): 是否显示十字线<br/>
     *   - horizontal/vertical (object): 十字线设置<br/>
     * - yAxis (object): Y 轴配置<br/>
     *   - show (boolean): 是否显示 Y 轴<br/>
     *   - position (string): Y 轴位置（'left' 或 'right'）<br/>
     * - xAxis (object): X 轴配置<br/>
     *   - show (boolean): 是否显示 X 轴<br/>
     *   - position (string): X 轴位置（'top' 或 'bottom'）<br/><br/>
     * @example
     * config={
     *   'theme': 'dark',
     *   'grid': {'show': True, 'horizontal': {'show': True}},
     *   'candle': {'type': 'area'},
     *   'crosshair': {'show': True}
     * }
     */
    config: PropTypes.object,

        /**
     * 技术指标配置。每个指标项应该是一个包含以下字段的对象：<br/>
     * - name (string): 指标名称（例如：'MA', 'RSI', 'MACD'）<br/>
     * - calcParams (array): 指标参数<br/>
     * - isStack (boolean, 可选): 是否堆叠<br/>
     * - paneOptions (object, 可选): 指标面板选项<br/>
     *      - id (string, 可选): 指标面板 ID<br/>
     * - styles (object, 可选): 指标样式<br/>
     *      - lines (array, 可选): 指标线样式<br/>
     *          - color (string, 可选): 指标线颜色<br/>
     *          - style (string, 可选): 指标线样式（'solid' 或 'dashed'）<br/>
     * - visible (boolean, 可选): 指标是否可见
     */
    indicators: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        isStack: PropTypes.bool,
        paneOptions: PropTypes.object,
        calcParams: PropTypes.array,
        styles: PropTypes.object,
        visible: PropTypes.bool
    })),

    /**
     * 图表的交易品种信息
     */
    symbol: PropTypes.string,

    /**
     * CSS 样式属性
     */
    style: PropTypes.object,

    /**
     * CSS 类名
     */
    className: PropTypes.string,

    /**
     * 是否启用响应式设计。启用后，当窗口或容器大小发生变化时，
     * 图表将自动调整大小以适应其容器。
     *
     * @default true
     */
    responsive: PropTypes.bool,

    /**
     * Dash 分配的回调函数，应该被调用以向 Dash 报告属性更改，
     * 使它们可用于回调。
     */
    setProps: PropTypes.func
};

export default DashKLineChart;
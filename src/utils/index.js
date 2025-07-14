export const defaultLightTheme = {
  background: "#ffffff",
  grid: "#f0f0f0",
  candle: {
    up: "#26A69A",
    down: "#EF5350",
    noChange: "#888888",
  },
  text: "#333333",
  axis: "#666666",
};

export const defaultDarkTheme = {
  background: "#1e1e1e",
  grid: "#333333",
  candle: {
    up: "#4CAF50",
    down: "#F44336",
    noChange: "#888888",
  },
  text: "#ffffff",
  axis: "#cccccc",
};

export const getTheme = (theme) => {
  return theme === "dark" ? defaultDarkTheme : defaultLightTheme;
};

export const mergeConfig = (defaultConfig, userConfig) => {
  if (!userConfig) return defaultConfig;

  return {
    ...defaultConfig,
    ...userConfig,
    grid: {
      ...defaultConfig.grid,
      ...userConfig.grid,
      horizontal: {
        ...defaultConfig.grid?.horizontal,
        ...userConfig.grid?.horizontal,
      },
      vertical: {
        ...defaultConfig.grid?.vertical,
        ...userConfig.grid?.vertical,
      },
    },
    candle: {
      ...defaultConfig.candle,
      ...userConfig.candle,
      bar: {
        ...defaultConfig.candle?.bar,
        ...userConfig.candle?.bar,
      },
    },
    crosshair: {
      ...defaultConfig.crosshair,
      ...userConfig.crosshair,
      horizontal: {
        ...defaultConfig.crosshair?.horizontal,
        ...userConfig.crosshair?.horizontal,
      },
      vertical: {
        ...defaultConfig.crosshair?.vertical,
        ...userConfig.crosshair?.vertical,
      },
    },
    yAxis: {
      ...defaultConfig.yAxis,
      ...userConfig.yAxis,
    },
    xAxis: {
      ...defaultConfig.xAxis,
      ...userConfig.xAxis,
    },
  };
};

export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

export const validateKLineData = (data) => {
  if (!Array.isArray(data) || data.length === 0) return false;

  return data.every(
    (item) =>
      item !== null &&
      typeof item === "object" &&
      "timestamp" in item &&
      "open" in item &&
      "high" in item &&
      "low" in item &&
      "close" in item &&
      typeof item.timestamp === "number" &&
      typeof item.open === "number" &&
      typeof item.high === "number" &&
      typeof item.low === "number" &&
      typeof item.close === "number" &&
      (!("volume" in item) || typeof item.volume === "number")
  );
};

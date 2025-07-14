import {
  getTheme,
  mergeConfig,
  validateKLineData,
  formatTimestamp,
  defaultLightTheme,
  defaultDarkTheme,
} from "../utils";

describe("Utils", () => {
  describe("getTheme", () => {
    it("returns light theme by default", () => {
      expect(getTheme(undefined)).toEqual(defaultLightTheme);
    });

    it("returns light theme when specified", () => {
      expect(getTheme("light")).toEqual(defaultLightTheme);
    });

    it("returns dark theme when specified", () => {
      expect(getTheme("dark")).toEqual(defaultDarkTheme);
    });
  });

  describe("mergeConfig", () => {
    const defaultConfig = {
      theme: "light",
      grid: {
        show: true,
        horizontal: { show: true },
        vertical: { show: true },
      },
      candle: {
        type: "candle_solid",
        bar: {
          upColor: "#26A69A",
          downColor: "#EF5350",
        },
      },
    };

    it("returns default config when no user config provided", () => {
      expect(mergeConfig(defaultConfig, undefined)).toEqual(defaultConfig);
    });

    it("merges user config with default config", () => {
      const userConfig = {
        theme: "dark",
        grid: {
          show: false,
        },
      };

      const result = mergeConfig(defaultConfig, userConfig);
      expect(result.theme).toBe("dark");
      expect(result.grid?.show).toBe(false);
      expect(result.grid?.horizontal?.show).toBe(true); // Should keep default
    });

    it("deeply merges nested objects", () => {
      const userConfig = {
        candle: {
          bar: {
            upColor: "#00FF00",
          },
        },
      };

      const result = mergeConfig(defaultConfig, userConfig);
      expect(result.candle?.bar?.upColor).toBe("#00FF00");
      expect(result.candle?.bar?.downColor).toBe("#EF5350"); // Should keep default
    });
  });

  describe("validateKLineData", () => {
    it("validates correct data format", () => {
      const validData = [
        {
          timestamp: 1609459200000,
          open: 100,
          high: 110,
          low: 95,
          close: 105,
          volume: 1000,
        },
      ];

      expect(validateKLineData(validData)).toBe(true);
    });

    it("validates data without volume", () => {
      const validData = [
        {
          timestamp: 1609459200000,
          open: 100,
          high: 110,
          low: 95,
          close: 105,
        },
      ];

      expect(validateKLineData(validData)).toBe(true);
    });

    it("rejects non-array data", () => {
      expect(validateKLineData("not an array")).toBe(false);
      expect(validateKLineData(null)).toBe(false);
      expect(validateKLineData(undefined)).toBe(false);
    });

    it("rejects data with missing required fields", () => {
      const invalidData = [
        {
          timestamp: 1609459200000,
          open: 100,
          high: 110,
          // missing low and close
        },
      ];

      expect(validateKLineData(invalidData)).toBe(false);
    });

    it("rejects data with invalid field types", () => {
      const invalidData = [
        {
          timestamp: "not a number",
          open: 100,
          high: 110,
          low: 95,
          close: 105,
        },
      ];

      expect(validateKLineData(invalidData)).toBe(false);
    });

    it("rejects data with invalid volume type", () => {
      const invalidData = [
        {
          timestamp: 1609459200000,
          open: 100,
          high: 110,
          low: 95,
          close: 105,
          volume: "not a number",
        },
      ];

      expect(validateKLineData(invalidData)).toBe(false);
    });

    it("handles empty array", () => {
      expect(validateKLineData([])).toBe(false);
    });
  });

  describe("formatTimestamp", () => {
    it("formats timestamp correctly", () => {
      const timestamp = 1609459200000; // 2021-01-01 00:00:00
      const formatted = formatTimestamp(timestamp);

      // The exact format depends on locale, but should be a string
      expect(typeof formatted).toBe("string");
      expect(formatted.length).toBeGreaterThan(0);
    });

    it("handles different timestamp values", () => {
      const timestamps = [1609459200000, 1609545600000, 1609632000000];

      timestamps.forEach((timestamp) => {
        const formatted = formatTimestamp(timestamp);
        expect(typeof formatted).toBe("string");
        expect(formatted.length).toBeGreaterThan(0);
      });
    });
  });
});

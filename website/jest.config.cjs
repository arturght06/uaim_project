module.exports = {
  testEnvironment: "jest-environment-jsdom", // or 'jsdom'
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"], // If you have a setup file

  moduleNameMapper: {
    // Handle CSS Modules (and regular CSS imports)
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",

    // Handle other static assets like SVGs if you import them as components
    // For example, if you have: import MyIcon from './my-icon.svg';
    // And your svgMock.js is:
    // module.exports = 'div';
    // export const ReactComponent = 'div';
    "\\.(svg)$": "<rootDir>/__mocks__/svgMock.js", // Adjust path if needed

    // You might have other mappings here for absolute imports, etc.
  },

  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },

  // Specify which files to include in coverage reports
  collectCoverage: true, // Keep this true while working on coverage
  collectCoverageFrom: [
    "src/**/*.{js,jsx}", // Target all JS/JSX files in src
    "!src/main.jsx", // Exclude your main entry point for React rendering
    "!src/App.jsx", // Often, App.jsx is mostly routing setup, test routing separately or higher-level integration
    "!src/reportWebVitals.js", // If you have this from CRA
    "!src/**/index.js", // Exclude barrel files if they only re-export
    "!src/vite-env.d.ts", // If you have TypeScript type definitions
    "!src/**/__tests__/**/*.{js,jsx}", // Exclude test files
    "!src/**/__mocks__/**/*.{js,jsx}", // Exclude mocks
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["json", "lcov", "text", "html"],
};

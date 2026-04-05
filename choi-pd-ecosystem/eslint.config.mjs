import nextConfig from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: ["node_modules/", ".next/", "data/", "public/sw.js", "**/._*"],
  },
  ...nextConfig,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;

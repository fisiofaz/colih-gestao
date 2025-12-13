import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Aqui dizemos ao Tailwind: "Olhe todos os arquivos dentro da pasta APP"
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Esta linha deveria pegar tudo
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Garantia extra
  ],
  theme: {
    extend: {
      // Cores personalizadas (opcional, mas bom ter)
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;

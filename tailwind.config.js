/** @type {import('tailwindcss').Config} */
module.exports = {
  // Garante que o Tailwind procure por classes em todos esses arquivos
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      // 💡 MAPEAR CORES PARA AS VARIÁVEIS CSS GLOBAIS
      colors: {
        // Mapeia a classe 'bg-primary' e 'text-primary' para a sua variável
        primary: 'var(--color-primary)', 
        
        // Mapeia o fundo escuro para ser usado com dark:bg-background-dark
        // (útil para elementos que você quer que tenham um fundo muito escuro)
        'background-dark': 'var(--color-background-dark)',
        
        // Se você quiser mapear as cores de texto e fundo base:
        'text-light': 'var(--color-text-light)',
        'text-dark': 'var(--color-text-dark)',
        'bg-light': 'var(--color-background-light)',
      },
      
      // Mapeia a fonte, se você estiver usando Poppins/Inter
      fontFamily: {
        display: ['var(--font-family-display)', 'sans-serif'],
      },
      
      // Mapeia a borda, se você usar 'border-light'
      borderColor: {
        light: 'var(--color-border-light)',
        dark: 'var(--color-border-dark)',
      },
    },
  },
  // 💡 MODO ESCURO
  // Garante que o Dark Mode seja ativado pela classe '.dark' no body ou html (padrão)
  darkMode: 'class', 
  plugins: [],
}
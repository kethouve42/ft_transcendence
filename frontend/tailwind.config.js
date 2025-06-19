/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Couleurs et backgrounds
    "bg-cyan-600", "bg-cyan-400", "bg-cyan-500", "bg-cyan-700/80", "bg-cyan-900/40", "bg-cyan-900/30", "bg-cyan-900/60", "bg-cyan-950/80",
    "bg-cyan-800/60", "bg-cyan-800/30", "bg-cyan-800/40", "bg-white/10", "bg-white", "bg-gray-100", "bg-gradient-to-br", "bg-gradient-to-b",
    "from-[#232526]", "via-[#0f2027]", "to-[#2c5364]", "from-blue-100", "to-blue-300",

    // Textes
    "text-cyan-100", "text-cyan-200", "text-cyan-300", "text-cyan-400", "text-cyan-500", "text-cyan-600", "text-cyan-950",
    "text-red-400", "text-red-700", "text-blue-800", "text-white", "text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl", "text-sm",

    // Borders et radius
    "border", "border-cyan-400", "border-cyan-400/20", "border-cyan-400/30", "border-cyan-500/30", "border-cyan-400/80", "border-2", "border-4",
    "rounded", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-full",

    // Padding, margin, gap, spacing
    "p-2", "p-3", "p-4", "p-6", "p-8", "p-10", "px-4", "px-6", "px-8", "px-10", "px-32", "px-40", "py-1", "py-2", "py-3", "py-4", "py-6", "py-8", "py-10", "mt-2", "mt-4", "mt-6", "mt-8", "mb-1", "mb-2", "mb-4", "mb-6", "mb-8", "mx-auto", "ml-auto", "mt-12", "mt-16", "gap-2", "gap-4", "gap-6", "gap-8", "gap-10", "space-y-1", "space-y-3", "space-y-4", "flex-col", "flex-row",

    // Flex, grid, layout
    "flex", "flex-1", "flex-col", "flex-row", "items-center", "items-start", "items-end", "justify-center", "justify-between", "justify-end", "justify-start", "gap-4", "gap-6", "gap-8", "gap-10", "grid", "grid-cols-2", "col-span-2", "min-h-screen", "min-h-[60vh]", "min-h-[50vh]", "max-w-md", "max-w-xl", "max-w-3xl", "max-w-[1800px]", "w-full", "w-24", "w-20", "w-10", "w-9", "h-full", "h-24", "h-20", "h-10", "h-9", "overflow-hidden", "overflow-y-auto", "max-h-52", "max-h-[600px]",

    // Font, shadow, transition, ring, tracking, uppercase, bold, etc.
    "font-bold", "font-extrabold", "font-semibold", "font-normal", "font-sans", "shadow", "shadow-lg", "shadow-xl", "shadow-md", "shadow-inner",
    "shadow-cyan-400/20", "shadow-cyan-400/30", "shadow-cyan-400/40", "shadow-cyan-400/50", "shadow-cyan-400/80",
    "tracking-widest", "tracking-wider", "uppercase", "italic", "transition", "transition-transform", "hover:scale-[1.03]", "hover:underline", "hover:bg-cyan-400", "hover:bg-cyan-500/80", "hover:bg-red-400", "hover:text-cyan-400", "hover:text-black", "drop-shadow-[0_0_10px_cyan]",

    // Divers
    "cursor-pointer", "object-cover", "backdrop-blur-md", "inline-block", "block", "text-center", "text-end", "text-start", "hidden",
    "disabled:opacity-50", "disabled:pointer-events-none", "focus:outline-none", "focus:ring-2", "focus:ring-cyan-400", "transition-colors",
    "shadow-cyan-400/30", "shadow-cyan-400/20", "shadow-cyan-400/40", "shadow-cyan-400/50", "shadow-cyan-400/80",
    "underline",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

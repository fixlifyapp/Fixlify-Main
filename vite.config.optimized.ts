import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000, // 1MB warning limit
    
    // Rollup options for better code splitting
    rollupOptions: {
      output: {
        // Manual chunks for vendor libraries
        manualChunks: (id) => {
          // Core React dependencies
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          
          // Supabase SDK
          if (id.includes('@supabase/')) {
            return 'supabase';
          }
          
          // UI libraries (Radix UI, etc)
          if (id.includes('@radix-ui/') || 
              id.includes('lucide-react') ||
              id.includes('class-variance-authority')) {
            return 'ui-vendor';
          }
          
          // Form libraries
          if (id.includes('react-hook-form') || 
              id.includes('@hookform/') ||
              id.includes('zod')) {
            return 'forms';
          }
          
          // Chart/visualization libraries
          if (id.includes('recharts') || 
              id.includes('d3-') ||
              id.includes('victory')) {
            return 'charts';
          }
          
          // Date utilities
          if (id.includes('date-fns') || 
              id.includes('dayjs')) {
            return 'date-utils';
          }
          
          // Other utilities
          if (id.includes('lodash') || 
              id.includes('uuid') ||
              id.includes('clsx')) {
            return 'utils';
          }
        },
        
        // Asset naming for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        
        // Chunk naming
        chunkFileNames: 'js/[name]-[hash].js',
        
        // Entry naming
        entryFileNames: 'js/[name]-[hash].js',
      },
    },
    
    // Optimize CSS
    cssCodeSplit: true,
    
    // Source maps for production debugging
    sourcemap: mode === 'production' ? 'hidden' : true,
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react',
      'recharts',
      'date-fns',
    ],
    exclude: ['@supabase/realtime-js'], // Exclude if causing issues
  },
}));

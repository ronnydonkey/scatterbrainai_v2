import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				lg: '2rem',
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1400px',
				'desktop': '1280px', // Professional desktop minimum
				'ultra': '1920px'    // Ultra-wide support
			}
		},
		extend: {
			fontFamily: {
				inter: ['Inter', 'system-ui', 'sans-serif'],
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1rem' }],
				'sm': ['0.875rem', { lineHeight: '1.25rem' }],
				'base': ['1rem', { lineHeight: '1.5rem' }],
				'lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'xl': ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1.1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }],
			},
			spacing: {
				'touch': 'var(--touch-min)',
				'touch-comfortable': 'var(--touch-comfortable)',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				
				// === COSMIC PALETTE ===
				cosmic: {
					purple: 'hsl(var(--cosmic-purple))',
					'purple-light': 'hsl(var(--cosmic-purple-light))',
					'purple-dark': 'hsl(var(--cosmic-purple-dark))',
				},
				neural: {
					blue: 'hsl(var(--neural-blue))',
					'blue-light': 'hsl(var(--neural-blue-light))',
					'blue-dark': 'hsl(var(--neural-blue-dark))',
					gray: 'hsl(var(--neural-gray))',
				},
				stardust: {
					gold: 'hsl(var(--stardust-gold))',
					'gold-light': 'hsl(var(--stardust-gold-light))',
					'gold-dark': 'hsl(var(--stardust-gold-dark))',
				},
				plasma: {
					pink: 'hsl(var(--plasma-pink))',
					'pink-light': 'hsl(var(--plasma-pink-light))',
					'pink-dark': 'hsl(var(--plasma-pink-dark))',
				},
				space: {
					black: 'hsl(var(--space-black))',
					void: 'hsl(var(--space-void))',
				},
				nebula: {
					dark: 'hsl(var(--nebula-dark))',
				},
				synapse: {
					cyan: 'hsl(var(--synapse-cyan))',
				},
				electric: {
					violet: 'hsl(var(--electric-violet))',
				},
				quantum: {
					emerald: 'hsl(var(--quantum-emerald))',
				},
				
				// === SEMANTIC COLORS ===
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				trending: {
					hot: 'hsl(var(--trending-hot))',
					'hot-foreground': 'hsl(var(--trending-hot-foreground))',
					rising: 'hsl(var(--trending-rising))',
					'rising-foreground': 'hsl(var(--trending-rising-foreground))',
					warm: 'hsl(var(--trending-warm))',
					'warm-foreground': 'hsl(var(--trending-warm-foreground))',
					cool: 'hsl(var(--trending-cool))',
					'cool-foreground': 'hsl(var(--trending-cool-foreground))'
				},
				source: {
					reddit: 'hsl(var(--source-reddit))',
					'reddit-muted': 'hsl(var(--source-reddit-muted))',
					'reddit-foreground': 'hsl(var(--source-reddit-foreground))',
					google: 'hsl(var(--source-google))',
					'google-muted': 'hsl(var(--source-google-muted))',
					'google-foreground': 'hsl(var(--source-google-foreground))',
					social: 'hsl(var(--source-social))',
					'social-muted': 'hsl(var(--source-social-muted))',
					'social-foreground': 'hsl(var(--source-social-foreground))',
					perplexity: 'hsl(var(--source-perplexity))',
					'perplexity-muted': 'hsl(var(--source-perplexity-muted))',
					'perplexity-foreground': 'hsl(var(--source-perplexity-foreground))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				neural: '0.75rem',
				organic: '1.5rem',
			},
			boxShadow: {
				'neural': 'var(--neural-glow)',
				'cosmic': 'var(--cosmic-shadow)',
				'plasma': 'var(--plasma-glow)',
				'quantum': 'var(--quantum-shadow)',
				'neural-lg': '0 0 40px hsl(var(--cosmic-purple) / 0.4), 0 16px 64px hsl(var(--space-black) / 0.8)',
				'glow-sm': '0 0 10px hsl(var(--cosmic-purple) / 0.2)',
				'glow-md': '0 0 20px hsl(var(--cosmic-purple) / 0.3)',
				'glow-lg': '0 0 40px hsl(var(--cosmic-purple) / 0.4)',
			},
			backdropBlur: {
				'neural': '24px',
			},
			transitionTimingFunction: {
				'neural': 'cubic-bezier(0.23, 1, 0.32, 1)',
				'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
			},
			animation: {
				// === EXISTING ANIMATIONS ===
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				
				// === NEURAL ANIMATIONS ===
				'neural-pulse': 'pulse-neural 3s ease-in-out infinite',
				'flow': 'flow 25s linear infinite',
				'morph': 'morph 12s ease-in-out infinite',
				'glow-pulse': 'glow-pulse 4s ease-in-out infinite alternate',
				'float': 'float 6s ease-in-out infinite',
				
				// === UI ANIMATIONS ===
				'slide-up': 'slide-up 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
				'slide-down': 'slide-down 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
				'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
				'slide-in-left': 'slide-in-left 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
				'fade-in': 'fade-in 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
				'fade-out': 'fade-out 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
				'scale-in': 'scale-in 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'scale-out': 'scale-out 0.2s cubic-bezier(0.23, 1, 0.32, 1)',
				'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'spark': 'spark 3s linear infinite',
			},
			keyframes: {
				// === EXISTING KEYFRAMES ===
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				
				// === NEURAL KEYFRAMES ===
				'pulse-neural': {
					'0%, 100%': { 
						opacity: '1', 
						transform: 'scale(1)',
						filter: 'brightness(1)'
					},
					'50%': { 
						opacity: '0.8', 
						transform: 'scale(1.02)',
						filter: 'brightness(1.1)'
					}
				},
				'flow': {
					'0%': { backgroundPosition: '0 0' },
					'100%': { backgroundPosition: '120px 120px' }
				},
				'morph': {
					'0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
					'33%': { borderRadius: '70% 30% 50% 50% / 30% 60% 70% 40%' },
					'66%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' }
				},
				'glow-pulse': {
					'0%': { filter: 'brightness(1) saturate(1)' },
					'100%': { filter: 'brightness(1.15) saturate(1.2)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'33%': { transform: 'translateY(-10px) rotate(1deg)' },
					'66%': { transform: 'translateY(-5px) rotate(-1deg)' }
				},
				
				// === UI KEYFRAMES ===
				'slide-up': {
					'0%': { transform: 'translateY(100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-down': {
					'0%': { transform: 'translateY(-100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'slide-in-left': {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(-20px)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'scale-out': {
					'0%': { opacity: '1', transform: 'scale(1)' },
					'100%': { opacity: '0', transform: 'scale(0.95)' }
				},
				'bounce-in': {
					'0%': { opacity: '0', transform: 'scale(0.3)' },
					'50%': { opacity: '1', transform: 'scale(1.05)' },
					'70%': { transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'spark': {
					'0%, 90%, 100%': { opacity: '0', transform: 'scale(0)' },
					'10%, 80%': { opacity: '1', transform: 'scale(1)' },
					'45%': { opacity: '0.7', transform: 'scale(1.5)' }
				}
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		require("@tailwindcss/typography")
	],
} satisfies Config;

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
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
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
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

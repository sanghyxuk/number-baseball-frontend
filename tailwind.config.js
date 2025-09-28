/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            // iPad 최적화 브레이크포인트
            screens: {
                'xs': '475px',
                'sm': '640px',
                'md': '768px',        // iPad 세로
                'lg': '1024px',       // iPad 가로 / iPad Pro 세로
                'xl': '1280px',
                '2xl': '1536px',
                // 커스텀 브레이크포인트
                'ipad': '768px',
                'ipad-pro': '1024px',
                'ipad-pro-lg': '1366px',
                // 방향성 브레이크포인트
                'portrait': { 'raw': '(orientation: portrait)' },
                'landscape': { 'raw': '(orientation: landscape)' },
            },

            // 터치 친화적 사이즈
            spacing: {
                '18': '4.5rem',   // 72px
                '22': '5.5rem',   // 88px
                '88': '22rem',    // 352px
                '128': '32rem',   // 512px
            },

            // 게임 전용 컬러 팔레트
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                    950: '#172554',
                },
                game: {
                    bg: '#f8fafc',
                    card: '#ffffff',
                    strike: '#dc2626',     // 빨간색 - 스트라이크
                    ball: '#ea580c',       // 주황색 - 볼
                    out: '#6b7280',        // 회색 - 아웃
                    success: '#16a34a',    // 성공
                    warning: '#d97706',    // 경고
                    danger: '#dc2626',     // 위험
                },
                // 추가 시맨틱 컬러
                surface: {
                    primary: '#ffffff',
                    secondary: '#f8fafc',
                    tertiary: '#f1f5f9',
                },
                border: {
                    light: '#e2e8f0',
                    medium: '#cbd5e1',
                    dark: '#94a3b8',
                }
            },

            // 게임 전용 폰트 사이즈
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                'base': ['1rem', { lineHeight: '1.5rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
                '5xl': ['3rem', { lineHeight: '1' }],
                '6xl': ['3.75rem', { lineHeight: '1' }],
                // 게임 전용 사이즈
                'game-title': ['2.5rem', { lineHeight: '1.2' }],
                'game-display': ['4rem', { lineHeight: '1' }],
                'game-result': ['1.5rem', { lineHeight: '1.3' }],
            },

            // 폰트 패밀리
            fontFamily: {
                sans: [
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"Segoe UI"',
                    'Roboto',
                    '"Helvetica Neue"',
                    'Arial',
                    'sans-serif',
                    '"Apple Color Emoji"',
                    '"Segoe UI Emoji"',
                    '"Segoe UI Symbol"',
                ],
                mono: [
                    '"SF Mono"',
                    'Monaco',
                    '"Cascadia Code"',
                    '"Roboto Mono"',
                    'Consolas',
                    '"Liberation Mono"',
                    '"Courier New"',
                    'monospace',
                ],
            },

            // 애니메이션
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'bounce-slow': 'bounce 2s infinite',
                'pulse-slow': 'pulse 3s infinite',
                'shake': 'shake 0.5s ease-in-out',
                'spin-slow': 'spin 2s linear infinite',
                'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
            },

            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
                    '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
                },
            },

            // 그림자
            boxShadow: {
                'game': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'game-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                'game-active': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'inner-light': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
            },

            // 둥근 모서리
            borderRadius: {
                'game': '0.75rem',  // 12px
                'card': '1rem',     // 16px
                'button': '0.5rem', // 8px
            },

            // 트랜지션
            transitionDuration: {
                '400': '400ms',
            },

            // z-index
            zIndex: {
                'modal': '1000',
                'overlay': '999',
                'dropdown': '50',
                'sticky': '20',
                'fixed': '30',
            },

            // 최소/최대 너비/높이
            minHeight: {
                'touch': '48px',    // 터치 최소 크기
                'button': '44px',   // 버튼 최소 크기
            },
            minWidth: {
                'touch': '48px',
                'button': '120px',
            },
            maxWidth: {
                'game': '28rem',    // 448px
                'modal': '32rem',   // 512px
            },
        },
    },
    plugins: [
        // 커스텀 유틸리티 클래스 추가
        function({ addUtilities, addComponents, theme }) {
            // 터치 최적화 유틸리티
            addUtilities({
                '.touch-manipulation': {
                    'touch-action': 'manipulation',
                },
                '.touch-none': {
                    'touch-action': 'none',
                },
                '.touch-pan-x': {
                    'touch-action': 'pan-x',
                },
                '.touch-pan-y': {
                    'touch-action': 'pan-y',
                },
                '.no-tap-highlight': {
                    '-webkit-tap-highlight-color': 'transparent',
                },
                '.no-user-select': {
                    '-webkit-user-select': 'none',
                    '-moz-user-select': 'none',
                    '-ms-user-select': 'none',
                    'user-select': 'none',
                },
                '.text-select': {
                    '-webkit-user-select': 'text',
                    '-moz-user-select': 'text',
                    '-ms-user-select': 'text',
                    'user-select': 'text',
                },
            });

            // 게임 컴포넌트 스타일
            addComponents({
                '.btn': {
                    '@apply px-6 py-3 rounded-button font-medium transition-all duration-200 touch-manipulation no-tap-highlight': {},
                    '@apply active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2': {},
                    'min-height': theme('minHeight.button'),
                    'min-width': theme('minWidth.button'),
                },
                '.btn-primary': {
                    '@apply btn bg-primary-600 text-white hover:bg-primary-700': {},
                    '@apply focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed': {},
                },
                '.btn-secondary': {
                    '@apply btn bg-white text-gray-700 border-2 border-gray-300': {},
                    '@apply hover:border-gray-400 focus:ring-gray-500': {},
                },
                '.btn-danger': {
                    '@apply btn bg-red-600 text-white hover:bg-red-700': {},
                    '@apply focus:ring-red-500': {},
                },
                '.btn-lg': {
                    '@apply px-8 py-4 text-lg': {},
                    'min-height': '60px',
                    'min-width': '160px',
                },
                '.btn-sm': {
                    '@apply px-4 py-2 text-sm': {},
                    'min-height': '40px',
                    'min-width': '80px',
                },

                // 카드 스타일
                '.card': {
                    '@apply bg-surface-primary rounded-card shadow-game border border-border-light': {},
                },
                '.card-padding': {
                    '@apply p-6 md:p-8': {},
                },

                // 입력 필드 스타일
                '.input': {
                    '@apply w-full px-4 py-3 border-2 border-border-medium rounded-button': {},
                    '@apply focus:border-primary-500 focus:outline-none text-lg touch-manipulation': {},
                    '@apply disabled:bg-gray-100 disabled:cursor-not-allowed': {},
                    'min-height': theme('minHeight.touch'),
                },
                '.input-error': {
                    '@apply border-red-500 focus:border-red-500 focus:ring-red-500': {},
                },

                // 숫자 입력 스타일
                '.number-input': {
                    '@apply text-center text-2xl font-mono tracking-wider': {},
                },

                // 턴 표시 스타일
                '.turn-indicator': {
                    '@apply inline-flex items-center px-3 py-1 rounded-full text-sm font-medium': {},
                },
                '.turn-active': {
                    '@apply turn-indicator bg-primary-100 text-primary-800 animate-pulse-slow': {},
                },
                '.turn-waiting': {
                    '@apply turn-indicator bg-gray-100 text-gray-600': {},
                },

                // 게임 결과 스타일
                '.result-strike': {
                    '@apply text-game-strike font-bold': {},
                },
                '.result-ball': {
                    '@apply text-game-ball font-bold': {},
                },
                '.result-out': {
                    '@apply text-game-out': {},
                },

                // 반응형 컨테이너
                '.container-game': {
                    '@apply max-w-md mx-auto px-4 py-6': {},
                    '@apply md:max-w-2xl md:px-8 md:py-8': {},
                    '@apply lg:max-w-4xl': {},
                },

                // 게임 그리드
                '.game-grid': {
                    '@apply grid gap-4': {},
                    '@apply grid-cols-1': {},
                    '@apply md:grid-cols-2': {},
                    '@apply lg:grid-cols-3': {},
                },

                // 키패드 스타일
                '.keypad': {
                    '@apply grid grid-cols-3 gap-3 max-w-xs mx-auto': {},
                },
                '.keypad-btn': {
                    '@apply btn text-xl font-bold bg-white border-2 border-border-medium': {},
                    '@apply hover:border-primary-500 hover:bg-primary-50': {},
                    '@apply active:bg-primary-100 touch-manipulation': {},
                    'min-height': '60px',
                    'min-width': '60px',
                },

                // 안전 영역 (Safe Area)
                '.safe-top': {
                    'padding-top': 'env(safe-area-inset-top)',
                },
                '.safe-bottom': {
                    'padding-bottom': 'env(safe-area-inset-bottom)',
                },
                '.safe-left': {
                    'padding-left': 'env(safe-area-inset-left)',
                },
                '.safe-right': {
                    'padding-right': 'env(safe-area-inset-right)',
                },

                // 로딩 스피너
                '.loading-spinner': {
                    '@apply w-8 h-8 border-4 border-gray-300 border-t-primary-600 rounded-full animate-spin': {},
                },

                // 모달/오버레이
                '.modal-overlay': {
                    '@apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal': {},
                },
                '.modal-content': {
                    '@apply bg-white rounded-card p-6 mx-4 max-w-modal w-full': {},
                },
            });
        },

        // 플러그인으로 추가 기능
        function({ addVariant }) {
            // 터치 디바이스 변형
            addVariant('touch', '@media (hover: none) and (pointer: coarse)');
            addVariant('no-touch', '@media (hover: hover) and (pointer: fine)');

            // iPad 전용 변형
            addVariant('ipad', '@media (min-width: 768px) and (max-width: 1024px)');
            addVariant('ipad-pro', '@media (min-width: 1024px) and (max-width: 1366px)');

            // 방향성 변형
            addVariant('portrait', '@media (orientation: portrait)');
            addVariant('landscape', '@media (orientation: landscape)');

            // 다크모드 (추후 확장용)
            addVariant('dark', '@media (prefers-color-scheme: dark)');

            // 접근성 관련
            addVariant('reduced-motion', '@media (prefers-reduced-motion: reduce)');
            addVariant('high-contrast', '@media (prefers-contrast: high)');
        },
    ],

    // 다크모드 설정 (추후 확장용)
    darkMode: 'media', // 또는 'class'

    // 중요도 설정
    important: false,

    // 프리플라이트 스타일 커스터마이징
    corePlugins: {
        preflight: true,
    },
};
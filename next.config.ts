/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Nie przerywaj builda przy błędach ESLint
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Nie przerywaj builda przy błędach TS
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
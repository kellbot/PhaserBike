/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: '/PhaserBike',
    distDir: 'dist',
    images: {
        unoptimized: true
    },
};

export default nextConfig;

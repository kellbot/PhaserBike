/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    distDir: 'dist',
    basePath: "/",
    images: {
        unoptimized: true
    },
};

export default nextConfig;

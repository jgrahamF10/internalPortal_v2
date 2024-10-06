/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "f10internal.s3.us-east-1.amazonaws.com",
            },
        ],
    },
};

export default nextConfig;

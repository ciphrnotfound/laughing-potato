const nextConfig = {

  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    KINDE_ISSUER_URL: process.env.KINDE_ISSUER_URL || "https://example.kinde.com",
    KINDE_CLIENT_ID: process.env.KINDE_CLIENT_ID || "dummy_client_id",
    KINDE_CLIENT_SECRET: process.env.KINDE_CLIENT_SECRET || "dummy_client_secret",
    KINDE_SITE_URL: process.env.KINDE_SITE_URL || "http://localhost:3000",
    KINDE_POST_LOGOUT_REDIRECT_URL: process.env.KINDE_POST_LOGOUT_REDIRECT_URL || "http://localhost:3000",
    KINDE_POST_LOGIN_REDIRECT_URL: process.env.KINDE_POST_LOGIN_REDIRECT_URL || "http://localhost:3000/dashboard",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.openai.com",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;

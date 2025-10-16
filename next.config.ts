const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

module.exports = {
  basePath,
  assetPrefix: basePath || "",
  images: { unoptimized: true },
  output: "standalone",
  env: {
    CMU_ENTRAID_URL: process.env.CMU_ENTRAID_URL,
    CMU_ENTRAID_GET_TOKEN_URL: process.env.CMU_ENTRAID_GET_TOKEN_URL,
    CMU_ENTRAID_GET_BASIC_INFO: process.env.CMU_ENTRAID_GET_BASIC_INFO,
    CMU_ENTRAID_LOGOUT_URL: process.env.CMU_ENTRAID_LOGOUT_URL,
  },
};

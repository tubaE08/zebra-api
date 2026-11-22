const axios = require("axios");

const BASE_URL = "https://api.zebrasms.com/api/v1/publicapi";
const DEFAULT_MAUTH = process.env.MAUTH || "1DSBIXIEEUC";

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed. Use POST." });
  }

  try {
    const mauth = req.headers["mauth"] || req.query.mauth || DEFAULT_MAUTH;
    const { range } = req.body || {};

    if (!range) {
      return res.status(400).json({
        success: false,
        error: 'range is required (e.g., {"range": "22501XXX"})',
      });
    }

    const response = await axios.post(
      `${BASE_URL}/getnum`,
      { range },
      {
        headers: {
          MAuth: mauth,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (err) {
    const status = err.response?.status || 500;
    return res.status(status).json({
      success: false,
      error: err.response?.data || err.message,
    });
  }
};

const axios = require("axios");

const BASE_URL = "https://api.zebrasms.com/api/v1/publicapi";
const DEFAULT_MAUTH = process.env.MAUTH || "1DSBIXIEEUC";

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method Not Allowed. Use GET." });
  }

  try {
    const mauth = req.headers["mauth"] || req.query.mauth || DEFAULT_MAUTH;

    const response = await axios.get(`${BASE_URL}/getupdate`, {
      headers: { MAuth: mauth },
      timeout: 15000,
    });

    const rows = response.data?.data?.rows || [];

    const messages = rows.map((row) => {
      const otpMatch = row.message?.match(/\b\d{4,8}\b/);
      return {
        number: row.number,
        sender: row.sender,
        message: row.message,
        otp: otpMatch ? otpMatch[0] : null,
        country: row.country,
        operator: row.operator,
        at_ms: row.at_ms,
        time_iso: row.at_ms ? new Date(row.at_ms).toISOString() : null,
      };
    });

    return res.status(200).json({
      success: true,
      count: response.data?.data?.count ?? messages.length,
      limit: response.data?.data?.limit ?? 50,
      cached_for: response.data?.data?.cached_for ?? 0,
      messages,
      raw: response.data,
    });
  } catch (err) {
    const status = err.response?.status || 500;
    return res.status(status).json({
      success: false,
      error: err.response?.data || err.message,
    });
  }
};

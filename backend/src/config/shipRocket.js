const axios = require("axios");

let token = null;
let tokenExpiry = null;

const generateShipToken = async () => {
    const res = await axios.post(
        "https://apiv2.shiprocket.in/v1/external/auth/login",
        {
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD,
        }
    );

    token = res.data.token;

    if (!token) {
        throw new Error("Shiprocket token not received");
    }

    tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;

    console.log("✅ Shiprocket Token Generated");
};

const getToken = async () => {
    if (!token || Date.now() > tokenExpiry) {
        await generateShipToken();
    }
    return token;
};

module.exports = { getToken, generateShipToken };
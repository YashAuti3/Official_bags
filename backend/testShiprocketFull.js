require("dotenv").config();
const axios = require("axios");

const login = async () => {
  const res = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }
  );

  console.log("✅ TOKEN GENERATED");
  return res.data.token;
};

const createShipment = async (token) => {
  const data = {
    order_id: "TEST_" + Date.now(),
    order_date: new Date().toISOString().slice(0, 10),

    pickup_location: "Home",

    billing_customer_name: "camper",
    billing_last_name: "gaming",
    billing_address: "Flat 12, Shiv Residency, Near Shiv Mandir",
    billing_address_2: "Andheri East",
    billing_city: "Mumbai",
    billing_pincode: "400001",
    billing_state: "Maharashtra",
    billing_country: "India",
    billing_email: "test@gmail.com",
    billing_phone: "8081731062",

    shipping_is_billing: true, // 🔥 THIS WAS MISSING

    order_items: [
      {
        name: "Test Product",
        sku: "SKU_TEST_001",
        units: 1,
        selling_price: 100,
        discount: 0,
        tax: 0,
        hsn: "0000",
      }
    ],

    payment_method: "Prepaid",
    sub_total: 100,

    length: 10,
    breadth: 10,
    height: 10,
    weight: 0.5,
  };

  console.log("📦 PAYLOAD:", data);
  const res = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

const main = async () => {
  try {
    const token = await login();

    const shipment = await createShipment(token);

    console.log("🎉 SHIPMENT CREATED SUCCESS");
    console.log(shipment);

  } catch (err) {
    console.log("❌ FULL ERROR:");

    if (err.response) {
      console.log("STATUS:", err.response.status);
      console.log("DATA:", err.response.data);
    } else if (err.request) {
      console.log("NO RESPONSE RECEIVED");
      console.log(err.request);
    } else {
      console.log("ERROR MESSAGE:", err.message);
    }

    console.log("STACK:", err.stack);
  }
};

main();
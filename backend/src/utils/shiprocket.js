const axios = require("axios");
const { getToken } = require("../config/shipRocket");

const createShipment = async (order) => {
    const token = await getToken();

    const fullName = order.user?.name || "Customer Customer";
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.length > 0 ? rest.join(" ") : "Customer";

    const data = {
        order_id: order._id.toString(),
        order_date: new Date().toISOString().slice(0, 10),

        pickup_location: "Home",

        billing_customer_name: firstName,
        billing_last_name: lastName,
        billing_address: order.shippingAddress?.street || "No street",
        billing_address_2: "",
        billing_city: order.shippingAddress?.city || "Unknown",
        billing_pincode: order.shippingAddress?.pincode || "000000",
        billing_state: order.shippingAddress?.state || "Unknown",
        billing_country: order.shippingAddress?.country || "India",
        billing_email: order.user?.email || "unknown@example.com",
        billing_phone: order.shippingAddress?.phone || order.user?.phone || "0000000000",

        shipping_is_billing: true,

        order_items: order.items.map(item => ({
            name: item.title || "Product",
            sku: item.product?.toString() || "SKU",
            units: item.quantity || 1,
            selling_price: item.price || 0,
            discount: 0,
            tax: 0,
            hsn: "0000",
        })),

        payment_method: "Prepaid",
        sub_total: order.totalAmount,

        length: 10,
        breadth: 10,
        height: 10,
        weight: 0.5,
    };
    console.log("SHIPROCKET PAYLOAD:", data);
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

module.exports = { createShipment };
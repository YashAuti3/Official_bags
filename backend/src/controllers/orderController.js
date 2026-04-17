const Order = require('../models/orderModel');
const User = require('../models/userModel');
const ApiError = require('../utils/ApiError');
const { createShipment } = require("../utils/shiprocket");
const ApiResponse = require('../utils/ApiResponse');
const {
  asyncHandler,
  paginate,
  createOrder,
  verifyPayment,
  sendBrevo,
} = require('devil-backend-nodejs');
const { STATUS } = require('../config/constants');

const getOrderPlacedHtml = ({ name, amount, orderId }) => `
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border-radius: 16px; border: 1px solid #eee;">
    <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 8px;">Order placed successfully 🎉</h2>
    <p style="font-size: 14px; color: #444; margin-bottom: 12px;">
      Hi ${name || 'there'},
    </p>
    <p style="font-size: 14px; color: #444; margin-bottom: 16px;">
      Thank you for shopping with <strong>WebBags</strong>. Your order has been received and is now being processed.
    </p>

    <div style="background:#fafafa; border-radius: 12px; padding: 12px 14px; margin-bottom: 16px;">
      <p style="font-size: 13px; margin: 0 0 4px; color:#555;">
        <span style="font-weight:600;">Order ID:</span> ${orderId}
      </p>
      <p style="font-size: 13px; margin: 0 0 4px; color:#555;">
        <span style="font-weight:600;">Amount:</span> ₹${amount}
      </p>
      <p style="font-size: 13px; margin: 0; color:#555;">
        <span style="font-weight:600;">Status:</span> Processing
      </p>
    </div>

    <p style="font-size: 13px; color: #666; margin-bottom: 8px;">
      You will receive updates on your order as it moves through packing, shipping, and delivery.
    </p>

    <p style="font-size: 12px; color: #999; margin-top: 24px;">
      If you did not make this purchase, please contact our support immediately.
    </p>
  </div>
`;

const getOrderStatusHtml = ({ name, orderId, status }) => `
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border-radius: 16px; border: 1px solid #eee;">
    <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 8px;">Order status updated</h2>
    <p style="font-size: 14px; color: #444; margin-bottom: 12px;">
      Hi ${name || 'there'},
    </p>
    <p style="font-size: 14px; color: #444; margin-bottom: 16px;">
      The status of your WebBags order has been updated.
    </p>

    <div style="background:#fafafa; border-radius: 12px; padding: 12px 14px; margin-bottom: 16px;">
      <p style="font-size: 13px; margin: 0 0 4px; color:#555;">
        <span style="font-weight:600;">Order ID:</span> ${orderId}
      </p>
      <p style="font-size: 13px; margin: 0 0 4px; color:#555;">
        <span style="font-weight:600;">New status:</span> ${status}
      </p>
    </div>

    <p style="font-size: 13px; color: #666; margin-bottom: 8px;">
      You will receive another email when there are further updates.
    </p>

    <p style="font-size: 12px; color: #999; margin-top: 24px;">
      If you have any questions, just reply to this email.
    </p>
  </div>
`;

// ── Cart Management (Persistent Orders) ──

exports.getCart = asyncHandler(async (req, res) => {
  const cart = await Order.findOne({ user: req.user._id, status: 'Cart' }).populate('items.product');
  res.json(new ApiResponse(STATUS.OK, { cart: cart || { items: [], totalAmount: 0 } }));
});

exports.addItemToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, selectedColor, title, image, price } = req.body;

  let cart = await Order.findOne({ user: req.user._id, status: 'Cart' });
  if (!cart) {
    cart = await Order.create({ user: req.user._id, items: [], totalAmount: 0, status: 'Cart' });
  }

  const itemIndex = cart.items.findIndex(item => {
    const itemId = item.product?._id ? item.product._id.toString() : item.product?.toString();
    const bodyId = productId?.toString();
    const colorMatch = (item.selectedColor || null) === (selectedColor || null);
    return itemId === bodyId && colorMatch;
  });

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += (quantity || 1);
  } else {
    cart.items.push({ product: productId, quantity: quantity || 1, selectedColor, title, image, price });
  }

  cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  await cart.save();

  const updated = await Order.findById(cart._id).populate('items.product');
  res.json(new ApiResponse(STATUS.OK, { message: 'Added to bag', cart: updated }));
});

exports.updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity, selectedColor } = req.body;

  const cart = await Order.findOne({ user: req.user._id, status: 'Cart' });
  const itemIndex = cart.items.findIndex(item => {
    const itemId = item.product?._id ? item.product._id.toString() : item.product?.toString();
    const bodyId = productId?.toString();
    const colorMatch = (item.selectedColor || null) === (selectedColor || null);
    return itemId === bodyId && colorMatch;
  });

  if (itemIndex === -1) throw new ApiError(STATUS.NOT_FOUND, 'Item not found in bag');

  cart.items[itemIndex].quantity = Math.max(1, quantity);
  cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  await cart.save();

  const updated = await Order.findById(cart._id).populate('items.product');
  res.json(new ApiResponse(STATUS.OK, { message: 'Quantity updated', cart: updated }));
});

exports.removeItemFromCart = asyncHandler(async (req, res) => {
  const { productId, selectedColor } = req.body;

  const cart = await Order.findOne({ user: req.user._id, status: 'Cart' });
  if (!cart) throw new ApiError(STATUS.NOT_FOUND, 'Cart session not found');

  cart.items = cart.items.filter((item) => {
    const itemId = item.product?._id
      ? item.product._id.toString()
      : item.product?.toString();

    const bodyId = productId?.toString();
    const colorMatch = (item.selectedColor || null) === (selectedColor || null);

    return !(itemId === bodyId && colorMatch);
  });

  if (cart.items.length === 0) {
    await Order.findByIdAndDelete(cart._id);

    return res.json(
      new ApiResponse(STATUS.OK, {
        message: 'Item removed and cart deleted',
        cart: null,
      })
    );
  }

  cart.totalAmount = cart.items.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  await cart.save();

  const updated = await Order.findById(cart._id).populate('items.product');

  res.json(
    new ApiResponse(STATUS.OK, {
      message: 'Item removed',
      cart: updated,
    })
  );
});

exports.createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!amount) throw new ApiError(STATUS.BAD_REQUEST, 'Amount is required');

  const razorpayOrder = await createOrder(amount);
  res.json(new ApiResponse(STATUS.OK, {
    razorpayOrder,
    razorpayKey: process.env.RAZORPAY_KEY_ID
  }));
});

// exports.verifyAndPlaceOrder = asyncHandler(async (req, res) => {
//   const { items, totalAmount, shippingAddress, paymentId, razorpayOrderId, razorpaySignature } = req.body;

//   if (!items?.length) throw new ApiError(STATUS.BAD_REQUEST, 'Items required');
//   if (!paymentId || !razorpayOrderId || !razorpaySignature) throw new ApiError(STATUS.BAD_REQUEST, 'Payment info required');

//   if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode || !shippingAddress.phone) {
//     throw new ApiError(STATUS.BAD_REQUEST, 'Complete shipping address is required');
//   }

//   const isValid = verifyPayment(razorpayOrderId, paymentId, razorpaySignature);
//   if (!isValid) throw new ApiError(STATUS.BAD_REQUEST, 'Invalid signature.');

//   let order = await Order.findOne({ user: req.user._id, status: 'Cart' });

//   if (order) {
//     order.items = items;
//     order.totalAmount = totalAmount;
//     order.shippingAddress = shippingAddress;
//     order.paymentId = paymentId;
//     order.razorpayOrderId = razorpayOrderId;
//     order.paymentStatus = 'Paid';
//     order.status = 'Processing';
//     await order.save();
//   } else {
//     order = await Order.create({
//       user: req.user._id,
//       items,
//       totalAmount,
//       shippingAddress,
//       paymentId,
//       razorpayOrderId,
//       paymentStatus: 'Paid',
//       status: 'Processing',
//     });
//   }

//   // ✅ Email only if user allowed orderUpdates
//   const user = await User.findById(req.user._id).select('name email emailPreferences');

//   const html = getOrderPlacedHtml({
//     name: user.name,
//     amount: totalAmount,
//     orderId: order._id,
//   });

//   await sendBrevo(
//     user.email,
//     'Your WebBags order is confirmed 🎉',
//     html
//   );

//   res
//     .status(STATUS.CREATED)
//     .json(new ApiResponse(STATUS.CREATED, { message: 'Order placed', order }));
// });

exports.verifyAndPlaceOrder = asyncHandler(async (req, res) => {
  const { items, totalAmount, shippingAddress, paymentId, razorpayOrderId, razorpaySignature } = req.body;

  if (!items?.length) throw new ApiError(STATUS.BAD_REQUEST, 'Items required');
  if (!paymentId || !razorpayOrderId || !razorpaySignature) throw new ApiError(STATUS.BAD_REQUEST, 'Payment info required');

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode || !shippingAddress.phone) {
    throw new ApiError(STATUS.BAD_REQUEST, 'Complete shipping address is required');
  }

  const isValid = verifyPayment(razorpayOrderId, paymentId, razorpaySignature);
  if (!isValid) throw new ApiError(STATUS.BAD_REQUEST, 'Invalid signature.');

  let order = await Order.findOne({ user: req.user._id, status: 'Cart' });

  if (order) {
    order.items = items;
    order.totalAmount = totalAmount;
    order.shippingAddress = shippingAddress;
    order.paymentId = paymentId;
    order.razorpayOrderId = razorpayOrderId;
    order.paymentStatus = 'Paid';
    order.status = 'Processing';
    await order.save();
  } else {
    order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentId,
      razorpayOrderId,
      paymentStatus: 'Paid',
      status: 'Processing',
    });
  }

  // 🔥 IMPORTANT: populate before Shiprocket
  await order.populate("user", "name email phone");

  // 🔥 SHIPROCKET CALL (SAFE)
  try {
    const shipRes = await createShipment(order);

    order.shiprocket = {
      shipment_id: shipRes.shipment_id,
      awb_code: shipRes.awb_code,
      tracking_url: shipRes.tracking_url,
    };

    await order.save();

  } catch (err) {
    console.log("Shiprocket Error:", err.response?.data || err.message);
    // ❗ order fail mat kar — payment ho chuka hai
  }

  // ✅ Email
  const user = await User.findById(req.user._id).select('name email emailPreferences');

  const html = getOrderPlacedHtml({
    name: user.name,
    amount: totalAmount,
    orderId: order._id,
  });

  await sendBrevo(
    user.email,
    'Your WebBags order is confirmed 🎉',
    html
  );

  res
    .status(STATUS.CREATED)
    .json(new ApiResponse(STATUS.CREATED, { message: 'Order placed', order }));
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const result = await paginate(Order, { user: req.user._id }, {
    page,
    limit,
    sort: '-createdAt',
  });

  res.json(new ApiResponse(STATUS.OK, result));
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new ApiError(STATUS.NOT_FOUND, 'Order not found');
  res.json(new ApiResponse(STATUS.OK, { order }));
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const { page, limit, status, search } = req.query;

  const query = {};
  if (status && status !== 'All') query.status = status;

  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };
    const searchQueries = [{ shippingAddress: searchRegex }];

    if (search.match(/^[0-9a-fA-F]{24}$/)) {
      searchQueries.push({ _id: search });
    }

    const users = await User.find({
      $or: [{ name: searchRegex }, { email: searchRegex }],
    }).select('_id');

    if (users.length > 0) {
      searchQueries.push({ user: { $in: users.map(u => u._id) } });
    }

    query.$or = searchQueries;
  }

  const result = await paginate(Order, query, {
    page,
    limit,
    sort: '-createdAt',
    populate: { path: 'user', select: 'name email phone' },
  });

  res.json(new ApiResponse(STATUS.OK, result));
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!order) throw new ApiError(STATUS.NOT_FOUND, 'Order not found');

  // ✅ Email only if user allowed orderUpdates
  const user = await User.findById(order.user).select('name email emailPreferences');

  if (user?.emailPreferences?.orderUpdates) {
    const html = getOrderStatusHtml({
      name: user.name,
      orderId: order._id,
      status,
    });
    await sendBrevo(
      user.email,
      `Your WebBags order is now ${status}`,
      html
    );
  }

  res.json(new ApiResponse(STATUS.OK, { message: 'Status updated', order }));
});

exports.deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) throw new ApiError(STATUS.NOT_FOUND, 'Order not found');
  res.json(new ApiResponse(STATUS.OK, { message: 'Order deleted successfully' }));
});

exports.exportOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ status: { $ne: 'Cart' } })
    .sort({ createdAt: -1 })
    .populate('user', 'name email phone address')
    .lean();

  res.status(200).json({
    success: true,
    data: orders,
  });
});

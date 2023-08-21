const Order = require("../models/Order");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError } = require("../errors");
const { checkPermissions } = require("../utils");

const fakeStripeAPI = async ({ amount, currency }) => {
    const clientSecret = "justALoadOfBull";
    return { clientSecret, amount };
};

const getAllOrders = async (req, res) => {
    const orders = await Order.find({});

    res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
    const { id: orderId } = req.params;

    const order = await Order.findOne({ _id: orderId });
    if (!order) {
        throw new NotFoundError(`No order with id: ${orderId}`);
    }

    checkPermissions(req.user, order.user);
    res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user.userId });

    res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const createOrder = async (req, res) => {
    const { items: cartItems, tax, shippingFee } = req.body;

    if (!cartItems || cartItems.length === 0) {
        throw new BadRequestError("No items in cart");
    }
    if (!tax || !shippingFee) {
        throw new BadRequestError("Please provide tax/shipping fee");
    }

    let orderItems = [],
        subtotal = 0;
    for (const item of cartItems) {
        const product = await Product.findOne({ _id: item.product });
        if (!product) {
            throw new NotFoundError(`No product with id: ${item.product}`);
        }

        const { name, price, image, _id } = product;
        const singleOrderItem = {
            amount: item.amount,
            name,
            price,
            image,
            product: _id,
        };

        // add orders and calculate subtotal
        orderItems = [...orderItems, singleOrderItem];
        subtotal += item.amount * price;
    }

    const total = tax + shippingFee + subtotal;
    const paymentIntent = await fakeStripeAPI({
        amount: total,
        currency: "usd",
    });
    const order = await Order.create({
        orderItems,
        tax,
        shippingFee,
        subtotal,
        total,
        user: req.user.userId,
        clientSecret: paymentIntent.clientSecret,
    });

    res.status(StatusCodes.CREATED).json({
        order,
        clientSecret: order.clientSecret,
    });
};

const updateOrder = async (req, res) => {
    const { id: orderId } = req.params;
    const { paymentId } = req.body;

    const order = await Order.findOne({ _id: orderId });
    if (!order) {
        throw new NotFoundError(`No order with id: ${orderId}`);
    }

    checkPermissions(req.user, order.user);
    order.paymentId = paymentId;
    order.status = "paid";

    await order.save();
    res.status(StatusCodes.OK).json({ order });
};

module.exports = {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    createOrder,
    updateOrder,
};

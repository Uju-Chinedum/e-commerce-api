const Review = require("../models/Review");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError } = require("../errors");
const { checkPermissions } = require("../utils");

const createReview = async (req, res) => {
    const { product: productId } = req.body;

    const validProduct = await Product.findOne({ _id: productId });
    if (!validProduct) {
        throw new NotFoundError(`No product with id: ${productId}`);
    }

    const submitted = await Review.findOne({
        product: productId,
        user: req.user.userId,
    });
    if (submitted) {
        throw new BadRequestError(
            "You have already submitted a review for this product"
        );
    }

    req.body.user = req.user.userId;
    const review = await Review.create(req.body);

    res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
    const reviews = await Review.find({})
        .populate({
            path: "product",
            select: "name company price",
        })
        .populate({ path: "user", select: "name" });

    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
    const review = await Review.findOne({ _id: req.params.id })
        .populate({
            path: "product",
            select: "name company price",
        })
        .populate({ path: "user", select: "name" });
    if (!review) {
        throw new NotFoundError(`No review with id: ${req.params.id}`);
    }

    res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const { rating, title, comment } = req.body;

    const review = await Review.findOne({ _id: reviewId });
    if (!review) {
        throw new NotFoundError(`No review with id: ${req.params.id}`);
    }

    checkPermissions(req.user, review.user);

    review.title = title;
    review.rating = rating;
    review.comment = comment;

    await review.save();
    res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
    const { id: reviewId } = req.params;

    const review = await Review.findOne({ _id: reviewId });
    if (!review) {
        throw new NotFoundError(`No review with id: ${req.params.id}`);
    }

    checkPermissions(req.user, review.user);
    await review.remove();

    res.status(StatusCodes.OK).json({ msg: "Review deleted successfully" });
};

const getSingleProductReviews = async (req, res) => {
    const { id: productId } = req.params;
    const reviews = await Review.find({ product: productId });
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
    getSingleProductReviews
};

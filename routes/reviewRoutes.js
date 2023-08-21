const express = require("express");
const {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
} = require("../controllers/reviewController");
const { authenticateUser } = require("../middleware/authentication");

const routr = express.Router();

routr.route("/").post(authenticateUser, createReview).get(getAllReviews);
routr
    .route("/:id")
    .get(getSingleReview)
    .patch(authenticateUser, updateReview)
    .delete(authenticateUser, deleteReview);

module.exports = routr;

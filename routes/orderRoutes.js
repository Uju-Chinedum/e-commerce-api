const express = require("express");
const {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    createOrder,
    updateOrder,
} = require("../controllers/orderController");
const { authorizePermissions } = require("../middleware/authentication");

const router = express.Router();

router
    .route("/")
    .get(authorizePermissions("admin"), getAllOrders)
    .post(createOrder);
router.route("/showUserOrders").get(getCurrentUserOrders);
router.route("/:id").get(getSingleOrder).patch(updateOrder);

module.exports = router;

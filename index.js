const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors({origin: true}));
app.use(express.json());

const PI_API_KEY =
  "wur9onb5zxj2vnaiclmlbkkkcrfvwt2ybk7n2hebl3mm1fhxbwky7o67ukhyeckx";

// Middleware to log incoming requests
app.use((req, res, next) => {
  functions.logger.info(
      `Incoming Request: ${req.method} ${req.url}`,
      {body: req.body},
  );
  next();
});

// 🔥 Route to Approve a Pi Payment
app.post("/approve-payment", async (req, res) => {
  try {
    const {paymentId} = req.body;
    if (!paymentId) {
      return res.status(400).json({error: "Missing paymentId"});
    }

    const response = await axios.post(
        `https://api.minepi.com/v2/payments/${paymentId}/approve`,
        {},
        {headers: {Authorization: `Key ${PI_API_KEY}`}},
    );

    functions.logger.info("Payment Approved:", response.data);
    res.json(response.data);
  } catch (error) {
    functions.logger.error(
        "Error approving payment:",
        error.response?.data || error.message,
    );
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Payment approval failed",
    });
  }
});

// 🔥 Route to Complete a Pi Payment
app.post("/complete-payment", async (req, res) => {
  try {
    const {paymentId, txid} = req.body;
    if (!paymentId || !txid) {
      return res.status(400).json({error: "Missing paymentId or txid"});
    }

    const response = await axios.post(
        `https://api.minepi.com/v2/payments/${paymentId}/complete`,
        {txid},
        {headers: {Authorization: `Key ${PI_API_KEY}`}},
    );

    functions.logger.info("Payment Completed:", response.data);
    res.json(response.data);
  } catch (error) {
    functions.logger.error(
        "Error completing payment:",
        error.response?.data || error.message,
    );
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Payment completion failed",
    });
  }
});

// 🚀 Deployable Firebase Function
exports.api = functions.https.onRequest(app);

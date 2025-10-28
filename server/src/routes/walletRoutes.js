const express = require("express");
const { body, validationResult } = require("express-validator");
const walletController = require("../controllers/walletController");
const { authenticate } = require("../middleware/auth");
const { allowRoles } = require("../middleware/rbac");

// Validation result handler for express-validator
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

const router = express.Router();

// All wallet routes require authentication
router.use(authenticate);

// TODO: Temporarily disabled role restriction for testing
// router.use(allowRoles(["studio"]));

// Validation middleware
const validateWithdrawal = [
  body("amount")
    .isNumeric()
    .withMessage("Amount must be a number")
    .isFloat({ min: 1 })
    .withMessage("Amount must be greater than 0"),
  body("bankDetails.bankName")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Bank name must be between 2 and 100 characters"),
  body("bankDetails.accountNumber")
    .optional()
    .isLength({ min: 5, max: 20 })
    .withMessage("Account number must be between 5 and 20 characters"),
  body("bankDetails.accountHolderName")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Account holder name must be between 2 and 100 characters"),
];

const validateBankDetails = [
  body("bankName")
    .notEmpty()
    .withMessage("Bank name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Bank name must be between 2 and 100 characters"),
  body("accountNumber")
    .notEmpty()
    .withMessage("Account number is required")
    .isLength({ min: 5, max: 20 })
    .withMessage("Account number must be between 5 and 20 characters"),
  body("accountHolderName")
    .notEmpty()
    .withMessage("Account holder name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Account holder name must be between 2 and 100 characters"),
  body("accountType")
    .optional()
    .isIn(["savings", "current", "checking"])
    .withMessage("Account type must be savings, current, or checking"),
  body("branchCode")
    .optional()
    .isLength({ max: 10 })
    .withMessage("Branch code must be less than 10 characters"),
  body("swiftCode")
    .optional()
    .isLength({ max: 11 })
    .withMessage("SWIFT code must be less than 11 characters"),
];

const validateWithdrawalSettings = [
  body("minimumAmount")
    .optional()
    .isNumeric()
    .withMessage("Minimum amount must be a number")
    .isFloat({ min: 100 })
    .withMessage("Minimum amount must be at least 100 LKR"),
  body("autoWithdrawal.enabled")
    .optional()
    .isBoolean()
    .withMessage("Auto withdrawal enabled must be a boolean"),
  body("autoWithdrawal.threshold")
    .optional()
    .isNumeric()
    .withMessage("Auto withdrawal threshold must be a number")
    .isFloat({ min: 1000 })
    .withMessage("Auto withdrawal threshold must be at least 1000 LKR"),
];

// User wallet routes
router.get("/debug-user", (req, res) => {
  res.json({
    status: "success",
    data: {
      userId: req.user._id,
      userRole: req.user.role,
      userName: req.user.name,
      userEmail: req.user.email,
    },
  });
});
router.get("/", walletController.getWallet);
router.get("/transactions", walletController.getTransactions);
router.get("/stats", walletController.getWalletStats);
router.get("/transactions/:transactionId", walletController.getTransaction);

router.post(
  "/withdraw",
  validateWithdrawal,
  handleValidationErrors,
  walletController.requestWithdrawal
);

router.put(
  "/bank-details",
  validateBankDetails,
  handleValidationErrors,
  walletController.updateBankDetails
);

router.put(
  "/withdrawal-settings",
  validateWithdrawalSettings,
  handleValidationErrors,
  walletController.updateWithdrawalSettings
);

// Admin routes
router.get(
  "/admin/withdrawals",
  allowRoles("admin"),
  walletController.getWithdrawalRequests
);

router.put(
  "/admin/withdrawals/:transactionId",
  allowRoles("admin"),
  [
    body("status")
      .isIn(["completed", "failed"])
      .withMessage("Status must be either 'completed' or 'failed'"),
    body("remarks")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Remarks must be less than 500 characters"),
  ],
  handleValidationErrors,
  walletController.processWithdrawal
);

module.exports = router;

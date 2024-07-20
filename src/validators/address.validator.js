import { body } from "express-validator";

const addAddressValidator = () => {
    return [
        body("addressLine1").trim().notEmpty().withMessage("Address line 1 is required"),
        body("city").trim().notEmpty().withMessage("City is required"),
        body("country").trim().notEmpty().withMessage("Country is required"),

        body("pinCode")
        .trim()
        .notEmpty()
        .withMessage("Pincode is required")
        .isNumeric()
        .isLength({ max: 6, min: 6 })
        .withMessage("Invalid pincode"),
        
        body("state").trim().notEmpty().withMessage("State is required"),

        body("phoneNumber").trim().notEmpty().withMessage("Phone number is required"),
    ]
}

const updateAddressValidator = () => {
    return [
        body("addressLine1")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Address line 1 is required"),

        body("city").optional().trim().notEmpty().withMessage("City is required"),
        body("country")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Country is required"),

        body("pinCode")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Pincode is required")
        .isNumeric()
        .isLength({ max: 6, min: 6 })
        .withMessage("Invalid pincode"),
    
        body("state").optional().trim().notEmpty().withMessage("State is required"),

        body("phoneNumber").trim().notEmpty().withMessage("Phone number is required"),
    ];
};

export {addAddressValidator,
        updateAddressValidator}
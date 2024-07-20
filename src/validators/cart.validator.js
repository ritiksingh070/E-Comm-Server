import { body } from "express-validator";

const addItemOrUpdateQuantityValidator = () => {
    return [
        body("quantity")
        .optional()
        .isInt({
            min: 1,
        })
        .withMessage("Quantity must be greater than 0"),
    ]
}

export { addItemOrUpdateQuantityValidator }

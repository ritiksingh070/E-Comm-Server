import Mailgen from "mailgen";
import nodemailer from "nodemailer";


const sendEmail = async (options) => {

    // Configure mailgen by setting a theme and your product info
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
        name: "Ecomm-backend",
        link: "https://ecomm-backend.in",
        },
    });

    // Generate an HTML email with the provided contents
    const emailHtml = mailGenerator.generate(options.mailgenContent);

    // Generate the plaintext version of the e-mail (for clients that do not support HTML)
    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

    // Create a nodemailer transporter instance which is responsible to send a mail
    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
        user: process.env.MAILTRAP_SMTP_USER,
        pass: process.env.MAILTRAP_SMTP_PASS,
        },
    });

    const mail = {
        from: "mail.ecomm@gmail.com", 
        to: options.email, 
        subject: options.subject, 
        text: emailTextual, 
        html: emailHtml, 
    };

    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.log(
            "Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file"
        );
        console.log("Error: ", error);
    }
};

// email verification mail design
const emailVerificationMailgenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our app! We're very excited to have you on board.",
            action: {
                instructions: "To verify your email please click on the following button:",
                button: {
                    color: "#22BC66",
                    text: "Verify your email",
                    link: verificationUrl,
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };
};


const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
        body: {
        name: username,
        intro: "We got a request to reset the password of our account",
        action: {
            instructions: "To reset your password click on the following button or link:",
            button: {
            color: "#22BC66",
            text: "Reset password",
            link: passwordResetUrl,
            },
        },
        outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
    };
};


const orderConfirmationMailgenContent = (username, items, totalCost) => {
    return {
        body: {
            name: username,
            intro: "Your order has been processed successfully.",
            table: {
                data: items?.map((item) => {
                    return {
                        item: item.product?.name,
                        price: "INR " + item.product?.price + "/-",
                        quantity: item.quantity,
                    };
                }),
                columns: {
                    customWidth: {
                        item: "20%",
                        price: "15%",
                        quantity: "15%",
                    },
                    customAlignment: {
                        price: "right",
                        quantity: "right",
                    },
                },
            },
            outro: [
                `Total order cost: INR ${totalCost}/-`,
                "You can check the status of your order and more in your order history",
            ],
        },
    };
};


export { sendEmail,
        emailVerificationMailgenContent,
        forgotPasswordMailgenContent,
        orderConfirmationMailgenContent}
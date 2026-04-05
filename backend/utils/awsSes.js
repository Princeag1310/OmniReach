// ====== Option A: AWS SES Implementation (Commented out for Interview discussion) ======
/*
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const sendEmailViaSES = async (to, subject, htmlBody, sourceEmail) => {
  const params = {
    Destination: { ToAddresses: [to] },
    Message: {
      Body: { Html: { Charset: "UTF-8", Data: htmlBody } },
      Subject: { Charset: "UTF-8", Data: subject },
    },
    Source: sourceEmail,
  };
  try {
    const command = new SendEmailCommand(params);
    return await sesClient.send(command);
  } catch (error) {
    console.error("SES SendEmail Error:", error);
    throw error;
  }
};
*/

// ====== Option B: Nodemailer (Gmail) Implementation ======
import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, htmlBody, sourceEmail) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,      // Your gmail address
      pass: process.env.GMAIL_APP_PASS,  // Your 16-character app password
    },
  });

  const mailOptions = {
    from: `"OmniReach" <${process.env.GMAIL_USER}>`, 
    to,
    subject,
    html: htmlBody,
    replyTo: sourceEmail // Keep the original source email as reply-to
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Nodemailer Send Error:", error);
    throw error;
  }
};

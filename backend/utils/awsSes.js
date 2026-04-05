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
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: { Charset: "UTF-8", Data: htmlBody },
      },
      Subject: { Charset: "UTF-8", Data: subject },
    },
    Source: sourceEmail,
  };

  try {
    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);
    return result;
  } catch (error) {
    console.error("SES SendEmail Error:", error);
    throw error;
  }
};

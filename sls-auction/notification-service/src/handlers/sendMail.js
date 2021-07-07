import AWS from 'aws-sdk';

const ses = new AWS.SES({ region: 'us-east-1' });

async function sendMail(event, context) {
  const record = event.Records[0];
  console.log('records: ', record);
  const email = JSON.parse(record.body);
  const { body, recipient, subject } = email;
  const params = {
    Source: 'lukas.freelance@gmail.com',
    Destination: {
      ToAddresses: [recipient],
    },
    Message: {
      Body: {
        Text: {
          Data: body,
        },
      },
      Subject: {
        Data: subject,
      },
    },
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log(result);
    return result;
  } catch (err) {
    console.error(err);
  }
}

export const handler = sendMail;

import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

export async function closeAuction({ auction }) {
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id: auction.id },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeValues: {
      ':status': 'CLOSED',
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };
  await dynamodb.update(params).promise();

  const {
    title,
    seller,
    highestBid: { bidder, amount },
  } = auction;

  if (amount === 0) {
    await sqs
      .sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
          subject: 'No Bids',
          recipient: seller,
          body: `No bids on ${title} item`,
        }),
      })
      .promise();
    return;
  }

  const sellerParams = {
    QueueUrl: process.env.MAIL_QUEUE_URL,
    MessageBody: JSON.stringify({
      subject: 'SOLD!!!',
      recipient: seller,
      body: `Item "${title}" has been sold for $${amount}`,
    }),
  };
  const buyerParams = {
    QueueUrl: process.env.MAIL_QUEUE_URL,
    MessageBody: JSON.stringify({
      subject: 'Congrats!!!',
      recipient: bidder,
      body: `You won ${title} for $${amount}`,
    }),
  };
  const notifySeller = sqs.sendMessage(sellerParams).promise();
  const notifyBuyer = sqs.sendMessage(buyerParams).promise();

  return Promise.all([notifySeller, notifyBuyer]);
}

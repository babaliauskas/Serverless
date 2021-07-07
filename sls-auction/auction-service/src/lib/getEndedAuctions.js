import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getEndedAuctions() {
  const now = new Date();

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndingDate',
    KeyConditionExpression: '#status = :status AND endingAt <= :endingAt',
    ExpressionAttributeValues: {
      ':status': 'OPEN',
      ':endingAt': now.toISOString(),
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };
  const results = await dynamodb.query(params).promise();
  return results.Items;
}

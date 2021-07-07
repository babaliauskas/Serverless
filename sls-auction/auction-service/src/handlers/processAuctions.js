import createError from 'http-errors';
import { closeAuction } from '../lib/closeAuction';
import { getEndedAuctions } from '../lib/getEndedAuctions';

async function processAuctions(event, context) {
  try {
    const auctions = await getEndedAuctions();
    const closePromises = auctions.map((auction) => closeAuction({ auction }));
    await Promise.all(closePromises);
    return { close: closePromises.length };
  } catch (err) {
    console.error(err);
    throw new createError.InternalServerError(err);
  }
}

export const handler = processAuctions;

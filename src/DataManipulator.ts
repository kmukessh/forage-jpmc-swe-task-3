import { ServerRespond } from './DataStreamer';

// Interface to structure the row of data that will be returned
export interface Row {
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined, // Can be undefined if no alert is triggered
}

export class DataManipulator {
  // This method processes server responses to generate a Row object
  static generateRow(serverRespond: ServerRespond[]): Row {
    // Calculate average price for ABC and DEF stocks
    const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;
    const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2;

    // Calculate the ratio between ABC and DEF prices
    const ratio = priceABC / priceDEF;

    // Define upper and lower bounds for the ratio (5% range)
    const upperBound = 1 + 0.05;
    const lowerBound = 1 - 0.05;

    // Return a Row object containing all relevant data
    return {
      price_abc: priceABC, // Average price of ABC stock
      price_def: priceDEF, // Average price of DEF stock
      ratio,               // Ratio of ABC to DEF
      timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ?
        serverRespond[0].timestamp : serverRespond[1].timestamp, // Most recent timestamp
      upper_bound: upperBound, // Upper bound for alert
      lower_bound: lowerBound, // Lower bound for alert
      // Trigger alert if ratio is outside of the bounds
      trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
    };
  }
}
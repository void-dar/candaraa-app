import axios from "axios";

const COIN_VALUE_USD = 0.1;      
const POINT_TO_COIN = 0.001;     

export const pointsToCoins = (points) => points * POINT_TO_COIN;
export const coinsToUSD = (coins) => coins * COIN_VALUE_USD;
export const pointsToUSD = (points) => coinsToUSD(pointsToCoins(points));

// Fetch real-time crypto price from CoinGecko
export const getCryptoPrice = async (cryptoId) => {
  try {
    cryptoId = cryptoId.toLowerCase();
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`;
    const response = await axios.get(url);
    return response.data[cryptoId].usd;
  } catch (err) {
    console.error("Error fetching crypto price:", err);
    throw new Error("Unable to fetch crypto price");
  }
};


export const usdToCrypto = async (usdAmount, cryptoId) => {
  const price = await getCryptoPrice(cryptoId);
  return usdAmount / price;
};

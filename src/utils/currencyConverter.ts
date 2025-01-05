import { supabase } from "@/integrations/supabase/client";

export type SupportedCurrency = string;

interface CurrencyRate {
  code: string;
  rate: number;
}

let ratesCache: Record<string, number> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

const getCurrencyRates = async (): Promise<Record<string, number>> => {
  const currentTime = Date.now();
  
  // Return cached rates if they're still valid
  if (ratesCache && (currentTime - lastFetchTime) < CACHE_DURATION) {
    return ratesCache;
  }

  try {
    const { data, error } = await supabase
      .from('currencies')
      .select('code, rate')
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching currency rates:', error);
      return { USD: 1 }; // Default to USD if there's an error
    }

    const rates = data.reduce((acc: Record<string, number>, curr: CurrencyRate) => ({
      ...acc,
      [curr.code]: curr.rate
    }), { USD: 1 });

    ratesCache = rates;
    lastFetchTime = currentTime;
    return rates;
  } catch (error) {
    console.error('Error in getCurrencyRates:', error);
    return { USD: 1 };
  }
};

export const convertCurrency = async (
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): Promise<number> => {
  try {
    const rates = await getCurrencyRates();

    if (!rates[fromCurrency] || !rates[toCurrency]) {
      console.error('Invalid currency code');
      return amount;
    }

    // Convert to USD first (our base currency)
    const amountInUSD = amount / rates[fromCurrency];
    // Convert from USD to target currency
    return Number((amountInUSD * rates[toCurrency]).toFixed(2));
  } catch (error) {
    console.error('Error converting currency:', error);
    return amount;
  }
};

// Initialize rates cache
getCurrencyRates().catch(console.error);
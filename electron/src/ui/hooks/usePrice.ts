import { useEffect, useState } from "react";
import { PriceApiEndpoint } from "../constants";
import { useWeb3Context } from "../contexts/Web3Context";

const CACHE_DURATION = 60 * 1000; // 60 s
let cachedPrice = 0;
let lastFetchTime = 0;

const usePrice = (): number => {
  const { isMainnet } = useWeb3Context();
  const [price, setPrice] = useState<number>(isMainnet ? cachedPrice : 0);

  useEffect(() => {
    if (!isMainnet) {
      setPrice(0);
      return;
    }

    const now = Date.now();
    if (now - lastFetchTime < CACHE_DURATION && cachedPrice > 0) {
      setPrice(cachedPrice);
      return;
    }

    const fetchPrice = async () => {
      try {
        const response = await fetch(PriceApiEndpoint);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const fetchedPrice = Number(data.price);

        if (!isNaN(fetchedPrice)) {
          cachedPrice = fetchedPrice;
          lastFetchTime = Date.now();
          setPrice(fetchedPrice);
        }
      } catch (err) {
        console.error("Price fetch error:", err);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, CACHE_DURATION);
    return () => clearInterval(interval);
  }, [isMainnet]);

  return price;
};

export default usePrice;

'use client';

import { useEffect, useState } from 'react';

export default function PriceDisplay() {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch('https://api.coinmarketcap.com/v1/ticker/openx/');
        const data = await res.json();
        const currentPrice = parseFloat(data[0].price_usd);
        setPrice(currentPrice);
      } catch (e) {
        console.error('Failed to fetch price', e);
      } finally {
        setLoading(false);
      }
    }
    fetchPrice();
  }, []);

  if (loading) return <p>Loading price...</p>;

  return (
    <div className="mb-4">
      <span className="text-lg font-semibold">Current OPENX price: </span>
      <span className="text-lg">${price?.toFixed(2)}</span>
    </div>
  );
}

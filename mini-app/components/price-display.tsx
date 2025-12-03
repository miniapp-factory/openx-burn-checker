'use client';

import { useEffect, useState } from 'react';

export default function PriceDisplay() {
  const [price, setPrice] = useState<number | null>(null);
  const [chartData, setChartData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/coins/openxai?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true');
        const data = await res.json();
        const currentPrice = data.market_data.current_price.usd;
        const sparkline = data.market_data.sparkline_7d.price;
        setPrice(currentPrice);
        setChartData([...sparkline].reverse());
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
      {chartData.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-medium mb-2">7‑Day Price Trend</h3>
          <ul className="list-disc pl-5 space-y-1">
            {chartData.map((p, idx) => (
              <li key={idx}>Day {idx + 1}: ${p.toFixed(2)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

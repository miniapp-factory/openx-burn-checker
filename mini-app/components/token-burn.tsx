'use client';

import { useEffect, useState } from "react";

interface BurnEvent {
  timestamp: string;
  amount: string;
  usd: string;
}

export default function TokenBurn() {
  const [price, setPrice] = useState<number | null>(null);
  const [burns, setBurns] = useState<BurnEvent[]>([]);
  const [totalSupply, setTotalSupply] = useState<number | null>(null);
  const [previousRemaining, setPreviousRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const contractAddress = "0xa66b448f97cbf58d12f00711c02bac2d9eac6f7f";
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch current price from BaseScan API
        const priceRes = await fetch(
          `https://api.basescan.org/api?module=stats&action=tokenprice&contractaddress=${contractAddress}`
        );
        const priceJson = await priceRes.json();
        const currentPrice = parseFloat(priceJson.result.usdPrice);
        setPrice(currentPrice);

        // Fetch all token transfer events
        const txRes = await fetch(
          `https://api.basescan.org/api?module=account&action=tokentx&contractaddress=${contractAddress}&page=1&offset=1000`
        );
        const txJson = await txRes.json();
        const txs = txJson.result;

        // Filter burn events (to zero address) and accumulate
        let cumulative = 0;
        const burnEvents: BurnEvent[] = [];
        txs.forEach((tx: { to: string; value: string; timeStamp: string; }) => {
          if (tx.to === zeroAddress) {
            const amount = parseFloat(tx.value) / 1e18; // assuming 18 decimals
            cumulative += amount;
            burnEvents.push({
              timestamp: new Date(tx.timeStamp * 1000).toLocaleString(),
              amount: amount.toFixed(4),
              usd: (amount * currentPrice).toFixed(2),
            });
          }
        });

        setBurns(burnEvents);
        const cumulativeBurn = burnEvents.reduce((sum, e) => sum + parseFloat(e.amount), 0);
        const totalSupplyRes = await fetch(
          `https://api.basescan.org/api?module=stats&action=tokeninfo&contractaddress=${contractAddress}`
        );
        const totalSupplyJson = await totalSupplyRes.json();
        const totalSupplyValue = parseFloat(totalSupplyJson.result.totalSupply) / 1e18;
        setTotalSupply(totalSupplyValue);
        const remaining = totalSupplyValue - cumulativeBurn;
        if (previousRemaining !== null && remaining < previousRemaining) {
          console.warn("Token supply decreased");
        }
        setPreviousRemaining(remaining);
      } catch (e) {
        console.error("Failed to fetch burn data", e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p>Loading burn data...</p>;

  return (
    <div className="w-full max-w-2xl mt-6 p-4 border rounded-md bg-background">
      <h2 className="text-xl font-semibold mb-4">$OPENX Token Burn History</h2>
      {burns.length === 0 ? (
        <p>No burn events found.</p>
      ) : (
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="text-left py-2">Timestamp</th>
              <th className="text-left py-2">Amount (OPENX)</th>
              <th className="text-left py-2">USD Equivalent</th>
            </tr>
          </thead>
          <tbody>
            {burns.map((b, idx) => (
              <tr key={idx} className="border-t">
                <td className="py-2">{b.timestamp}</td>
                <td className="py-2">{b.amount}</td>
                <td className="py-2">${b.usd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {price && (
        <p className="mt-4">
          Current $OPENX price: <strong>${price.toFixed(2)}</strong>
        </p>
      )}
      {totalSupply !== null && previousRemaining !== null && (
        <p className="mt-2">
          Remaining $OPENX supply: <strong>{previousRemaining.toFixed(4)}</strong>
        </p>
      )}
    </div>
  );
}

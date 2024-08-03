"use client";

import React, { useState, useEffect } from "react";
import getData from "./data";
import getPrice from "./wethPrice";
import getLiquidityData from "./liquidity";

const Home = () => {
  const [trades, setTrades] = useState([]);
  const [liquidityData, setLiquidityData] = useState({
    Initial_liquidity: [],
    Current_liquidity: [],
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [price, setPrice] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTradesandPrice = async () => {
      try {
        const tradeData = await getData();
        setTrades(tradeData);
        const priceData = await getPrice();
        setPrice(priceData);
      } catch (error) {
        console.error("Error fetching trades:", error);
      }
    };

    fetchTradesandPrice();
  }, []);

  useEffect(() => {
    if (trades.length > 0) {
      const fetchLiquidityData = async () => {
        try {
          const poolAddresses = trades.map((trade) =>
            trade.Trade.Dex.SmartContract.toLowerCase()
          );
          const liquidityDataResponse = await getLiquidityData(poolAddresses);
          setLiquidityData({
            Initial_liquidity: liquidityDataResponse.Initial_liquidity || [],
            Current_liquidity: liquidityDataResponse.Current_liquidity || [],
          });
        } catch (error) {
          console.error("Error fetching liquidity data:", error);
        }
      };

      fetchLiquidityData();
    }
  }, [trades]);

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const calculatePriceChange = (endPrice, hour1Price, min5Price) => {
    const priceChangeHour = hour1Price
      ? ((endPrice - hour1Price) / hour1Price) * 100
      : 0;
    const priceChangeMin5 = min5Price
      ? ((endPrice - min5Price) / min5Price) * 100
      : 0;
    return { priceChangeHour, priceChangeMin5 };
  };

  const formatInitialLiquidity = (liquidityList) => {
    if (!liquidityList || liquidityList.length === 0) return "N/A";

    console.log("liquiditylist: ", liquidityList);
    return `${parseFloat(liquidityList[0].Transfer.Amount).toFixed(2)} ${
      liquidityList[0].Transfer.Currency.Symbol
    } + ${parseFloat(liquidityList[1].Transfer.Amount).toFixed(2)} ${
      liquidityList[1].Transfer.Currency.Symbol
    }`;
  };

  const formatCurrentLiquidity = (
    liquidityList,
    rowCurrencySymbol,
    currentPrice
  ) => {
    if (!liquidityList || liquidityList.length === 0) return "N/A";

    const wethLiquidity = liquidityList.find(
      (liq) => liq.Currency.Symbol === "WETH"
    );
    const rowCurrencyLiquidity = liquidityList.find(
      (liq) => liq.Currency.Symbol === rowCurrencySymbol
    );

    console.log("weth liquidity:", wethLiquidity);

    const wethAmount = wethLiquidity
      ? parseFloat(wethLiquidity.balance).toFixed(2)
      : "0";
    const rowCurrencyAmount = rowCurrencyLiquidity
      ? parseFloat(rowCurrencyLiquidity.balance).toFixed(2)
      : "0";

    const wethPrice = price[0].Trade.PriceInUSD;

    console.log("wethPrice:", wethPrice);
    console.log("token price:", currentPrice);
    return `$${parseFloat(
      wethAmount * wethPrice + rowCurrencyAmount * currentPrice
    ).toFixed(2)}`;
  };

  const currentTrades = trades.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Top 10 Ethereum Pairs
        </h1>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Sr. No.</th>
                <th className="py-2 px-4 border-b">Token Pair</th>
                <th className="py-2 px-4 border-b">Price $</th>
                <th className="py-2 px-4 border-b">DEX </th>
                <th className="py-2 px-4 border-b">Pair Smart Contract</th>
                <th className="py-2 px-4 border-b">Price Change (1 Hour)</th>
                <th className="py-2 px-4 border-b">Price Change (5 Min)</th>
                <th className="py-2 px-4 border-b">Total Traded Volume</th>
                <th className="py-2 px-4 border-b">Txns</th>
                <th className="py-2 px-4 border-b">Initial Liquidity</th>
                <th className="py-2 px-4 border-b">Current Liquidity</th>
              </tr>
            </thead>
            <tbody>
              {currentTrades.map((trade, index) => {
                const rowCurrencySymbol = trade.Trade.Currency.Symbol;
                const currentPrice = trade.Trade.end;
                const poolAddress = trade.Trade.Dex.SmartContract.toLowerCase();

                const initialLiquidity = liquidityData.Initial_liquidity.filter(
                  (liq) => liq.Transfer.Receiver.toLowerCase() === poolAddress
                );
                const currentLiquidity = liquidityData.Current_liquidity.filter(
                  (liq) =>
                    liq.BalanceUpdate.Address.toLowerCase() === poolAddress
                );
                const { priceChangeHour, priceChangeMin5 } =
                  calculatePriceChange(
                    trade.Trade.end,
                    trade.Trade.hour1,
                    trade.Trade.min5
                  );

                return (
                  <tr key={index} className="text-center">
                    <td className="py-2 px-4 border-b">
                      {index + 1 + currentPage * itemsPerPage}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <strong>{trade.Trade.Currency.Symbol}</strong>/
                      {trade.Trade.Side.Currency.Symbol}
                    </td>
                    <td className="py-2 px-4 border-b">
                      ${parseFloat(trade.Trade.end).toFixed(10)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {trade.Trade.Dex.ProtocolName}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <a
                        href={`https://explorer.bitquery.io/ethereum/token/${trade.Trade.Dex.SmartContract}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {truncateAddress(trade.Trade.Dex.SmartContract)}
                      </a>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {priceChangeHour.toFixed(2)}%
                    </td>
                    <td className="py-2 px-4 border-b">
                      {priceChangeMin5.toFixed(2)}%
                    </td>
                    <td className="py-2 px-4 border-b">
                      {parseFloat(trade.total_traded_volume).toFixed(2)}{" "}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div>{trade.total_trades}</div>
                      <div className="flex justify-center">
                        <span className="text-green-500">
                          {trade.totalbuys}
                        </span>
                        <span> / </span>
                        <span className="text-red-500">{trade.totalsells}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {formatInitialLiquidity(initialLiquidity)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {formatCurrentLiquidity(
                        currentLiquidity,
                        rowCurrencySymbol,
                        currentPrice
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Home;

import axios from "axios";

// Function to fetch trade data
const getData = async () => {
  // Get the current UTC time and subtract one hour and five minutes
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const min5backtimestamp = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  let data = JSON.stringify({
    query: `
      query MyQuery($oneHourAgo: DateTime, $min5backtimestamp: DateTime) {
        EVM(network: eth, dataset: realtime) {
          DEXTradeByTokens(
            orderBy: {descendingByField: "total_trades"}
            limit: {count: 10}
            where: {
              Block: {Time: {since: $oneHourAgo}},
              Trade: {Side: {Currency: {SmartContract: {is: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"}}}},
              TransactionStatus: {Success: true}
            }
          ) {
            Trade {
              hour1: PriceInUSD(minimum: Block_Time)
              min5: PriceInUSD(minimum: Block_Time, if: { Block: { Time: { after: $min5backtimestamp } } })
              end: PriceInUSD(maximum: Block_Time)
              Currency {
                Name
                Symbol
              }
              Side {
                Currency {
                  Name
                  Symbol
                }
              }
              Dex {
                ProtocolName
                ProtocolFamily
                ProtocolVersion
                SmartContract
              }
            }
            total_trades: count
            total_traded_volume: sum(of: Trade_Side_AmountInUSD)
          }
        }
      }
    `,
    variables: { oneHourAgo, min5backtimestamp },
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://streaming.bitquery.io/graphql",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": "BQY7em4KPZ9CMvjl4aUUOPf2hqEBIHF1",
      Authorization: process.env.NEXT_PUBLIC_BITQUERY_TOKEN,
    },
    data: data,
  };

  let response = await axios.request(config);
  return response.data.data.EVM.DEXTradeByTokens;
};

export default getData;

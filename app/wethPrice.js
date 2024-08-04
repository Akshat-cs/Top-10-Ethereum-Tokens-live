import axios from "axios";

const getPrice = async () => {
  let data = JSON.stringify({
    query: `
      query MyQuery{
        EVM(network: eth, dataset: realtime) {
          DEXTradeByTokens(
      limit: {count: 1}
      orderBy: {descending: Block_Time}
      where: {Trade: {Currency: {SmartContract: {is: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"}}, Side: {Currency: {SmartContract: {is: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"}}}}, TransactionStatus: {Success: true}}
    ){
      Trade{
        PriceInUSD
      }
    }
        }
      }
    `,
    variables: {},
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://streaming.bitquery.io/graphql",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": "BQYD4KszrYRIhb3cjIylKVLILgZfV0Ai",
      Authorization: process.env.NEXT_PUBLIC_BITQUERY_TOKEN,
    },
    data: data,
  };

  let response = await axios.request(config);
  return response.data.data.EVM.DEXTradeByTokens;
};

export default getPrice;

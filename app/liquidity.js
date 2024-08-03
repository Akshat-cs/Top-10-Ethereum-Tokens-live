// liquidityData.js
import axios from "axios";

const getLiquidityData = async (poolAddresses) => {
  // Get the current UTC time and subtract one hour and five minutes
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  let data = JSON.stringify({
    query: `
    query MyQuery ($poolAddresses: [String!]){
  EVM(dataset: combined, network: eth) {
    Initial_liquidity: Transfers(
      limitBy:{by:Transfer_Receiver count:2}
      orderBy: {ascending: Block_Time}
      where: {Transfer: {Receiver: {in: $poolAddresses }}, TransactionStatus: {Success: true}}
    ) {
      Transaction {
        Hash
      }
      Transfer {
        Receiver
        Amount
        Currency {
          SmartContract
          Name
          Symbol
        }
      }
    }
    Current_liquidity: BalanceUpdates(
      where: {BalanceUpdate: {Address:  {in: $poolAddresses}}}
      orderBy: {descendingByField: "balance"}
    ) {
      Currency {
        Name
        SmartContract
        Symbol
      }
      balance: sum(of: BalanceUpdate_Amount, selectWhere: {gt: "0"})
      BalanceUpdate {
        Address
      }
    }
  }
}
`,
    variables: { poolAddresses, oneHourAgo },
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
  return response.data.data.EVM;
};

export default getLiquidityData;

import { useState, useEffect } from 'react';
import getWeb3 from '../utils/getWeb3';
import LogisticsContract from '../contracts/Logistics.json';

const useContract = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = LogisticsContract.networks[networkId];
        
        if (deployedNetwork) {
          const instance = new web3.eth.Contract(
            LogisticsContract.abi,
            deployedNetwork && deployedNetwork.address,
          );
          setWeb3(web3);
          setAccounts(accounts);
          setContract(instance);

          const orderCount = await instance.methods.getOrderCount().call();
          const orders = [];
          for (let i = 0; i < orderCount; i++) {
            const order = await instance.methods.orders(i).call();
            orders.push(order);
          }
          setOrders(orders);

          const reviewCount = await instance.methods.getReviewCount().call();
          const reviews = [];
          for (let i = 0; i < reviewCount; i++) {
            const review = await instance.methods.reviews(i).call();
            reviews.push(review);
          }
          setReviews(reviews);
        } else {
          console.error('Contract not deployed on the current network');
        }
      } catch (error) {
        console.error('Error initializing web3, accounts, or contract', error);
      }
    };

    init();
  }, []);

  return { web3, accounts, contract, orders, reviews };
};

export default useContract;

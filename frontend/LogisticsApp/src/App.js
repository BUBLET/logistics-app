import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Tabs, Tab, Box, AppBar, Toolbar, IconButton, Tooltip } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import getWeb3 from './utils/getWeb3';
import LogisticsContract from './contracts/Logistics.json';
import OrderList from './components/OrdersList';
import AddOrderForm from './components/AddOrderForm';
import CompleteOrderForm from './components/CompleteOrderForm';
import ReviewsList from './components/ReviewsList';
import OrderChangesList from './components/OrderChangesList';

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [orderChanges, setOrderChanges] = useState([]);
  const [formData, setFormData] = useState({
    recipient: '',
    distance: '',
    cargoType: '',
    price: ''
  });
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    const init = async () => {
      try {
        const web3Instance = await getWeb3();
        const accountsArray = await web3Instance.eth.getAccounts();
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = LogisticsContract.networks[networkId];

        if (deployedNetwork) {
          const logisticsContractInstance = new web3Instance.eth.Contract(
            LogisticsContract.abi,
            deployedNetwork.address
          );

          setWeb3(web3Instance);
          setAccounts(accountsArray);
          setContract(logisticsContractInstance);

          const fetchedOrders = await logisticsContractInstance.methods.getOrders().call();
          setOrders(fetchedOrders);

          const reviewCount = await logisticsContractInstance.methods.getReviewCount().call();
          const fetchedReviews = [];
          for (let i = 0; i < reviewCount; i++) {
            const fetchedReview = await logisticsContractInstance.methods.reviews(i).call();
            fetchedReviews.push(fetchedReview);
          }
          setReviews(fetchedReviews);
        } else {
          console.error('Contract not deployed on the current network');
        }
      } catch (error) {
        console.error('Error initializing web3, accounts, or contract:', error);
      }
    };

    init();
  }, []);

  const addOrder = async (recipient, distance, cargoType, priceInWei) => {
    if (!contract) {
      console.error('Contract not initialized');
      return;
    }
    try {
      const distanceInNumber = parseInt(distance, 10);
      await contract.methods.addOrder(recipient, distanceInNumber, cargoType, priceInWei).send({ from: accounts[0] });
      const orderCount = await contract.methods.getOrderCount().call();
      const newOrder = await contract.methods.orders(orderCount - 1).call();
      setOrders([...orders, newOrder]);
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };

  const completeOrder = async (orderId, comment, rating) => {
    if (!contract) {
      console.error('Contract not initialized');
      return;
    }
    try {
      await contract.methods.completeOrder(orderId, comment, rating).send({ from: accounts[0], value: '0' });
      const updatedOrder = await contract.methods.orders(orderId).call();
      const updatedOrders = orders.map((order, index) =>
        index === orderId ? { ...order, isCompleted: true } : order
      );
      setOrders(updatedOrders);
      const newReview = await contract.methods.reviews(reviews.length).call();
      setReviews([...reviews, newReview]);
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  // Новая функция для оплаты заказа
  const payForOrder = async (orderId, priceInWei) => {
    if (!contract) {
      console.error('Contract not initialized');
      return;
    }
    try {
      await contract.methods.payForOrder(orderId).send({ from: accounts[0], value: priceInWei });
      const updatedOrder = await contract.methods.orders(orderId).call();
      const updatedOrders = orders.map((order, index) =>
        index === orderId ? { ...order, isPaid: true } : order
      );
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error paying for order:', error);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!contract) {
      console.error('Contract not initialized');
      return;
    }
    try {
      await contract.methods.cancelOrder(orderId).send({ from: accounts[0] });
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, isCancelled: true } : order
      );
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const getOrderChanges = async (orderId) => {
    if (!contract) {
      console.error('Contract not initialized');
      return;
    }
    try {
      const changes = await contract.methods.getOrderChanges(orderId).call();
      setOrderChanges(changes);
    } catch (error) {
      console.error('Error fetching order changes:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  if (!web3) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }

  return (
    <Container>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Logistics
          </Typography>
          {accounts.length > 0 && (
            <Tooltip title={`Account: ${accounts[0]}`}>
              <IconButton color="inherit">
                <AccountBalanceWalletIcon />
                <Typography variant="body1" component="span" sx={{ ml: 1 }}>
                  {truncateAddress(accounts[0])}
                </Typography>
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>
      <Paper elevation={3} style={{ padding: '16px', marginTop: '16px', marginBottom: '16px' }}>
        <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary" centered>
          <Tab label="Отправленные заказы" />
          <Tab label="Добавить заказ" />
          <Tab label="Полученные заказы" />
          <Tab label="Отзывы" />
          <Tab label="Изменения заказов" />
        </Tabs>
      </Paper>

      <Box hidden={currentTab !== 0}>
        <OrderList orders={orders} web3={web3} currentAccount={accounts[0]} cancelOrder={cancelOrder} />
      </Box>

      <Box hidden={currentTab !== 1}>
        <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px' }}>
          <Typography variant="h5" component="h2" gutterBottom>Добавить заказ</Typography>
          <AddOrderForm
            formData={formData}
            handleChange={handleChange}
            handleSubmit={addOrder}
          />
        </Paper>
      </Box>

      <Box hidden={currentTab !== 2}>
        <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px' }}>
          <Typography variant="h5" component="h2" gutterBottom>Полученные заказы</Typography>
          <CompleteOrderForm
            handleSubmit={completeOrder}
            orders={orders}
            currentAccount={accounts[0]}
            web3={web3}
            payForOrder={payForOrder} // Передача функции оплаты заказа
          />
        </Paper>
      </Box>

      <Box hidden={currentTab !== 3}>
        <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px' }}>
          <Typography variant="h5" component="h2" gutterBottom>Отзывы</Typography>
          <ReviewsList reviews={reviews} />
        </Paper>
      </Box>

      <Box hidden={currentTab !== 4}>
        <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px' }}>
          <Typography variant="h5" component="h2" gutterBottom>Изменения заказов</Typography>
          <OrderChangesList orderChanges={orderChanges} />
        </Paper>
      </Box>
    </Container>
  );
};

export default App;

// src/App.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import LogisticsContract from './contracts/Logistics.json';
import { 
  Container, 
  Typography, 
  Tabs, 
  Tab, 
  Box 
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AddOrder from './components/AddOrder';
import Statistics from './components/Statistics';
import CompanyManagement from './components/CompanyManagement';
import OrderDetails from './components/OrderDetails';
import Header from './components/Header';
import MyOrders from './components/MyOrders';

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [orderCount, setOrderCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isCompany, setIsCompany] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [filter, setFilter] = useState({
    status: 'all', // 'all', 'paid', 'completed', 'cancelled'
    sender: '',
    recipient: '',
  });
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    async function initWeb3() {
      if (window.ethereum) {
        try {
          // Запрос доступ к аккаунтам MetaMask
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const accounts = await web3Instance.eth.getAccounts();
          setAccounts(accounts);

          // Подключаемся к смарт-контракту
          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = LogisticsContract.networks[networkId];
          if (!deployedNetwork) {
            toast.error('Смарт-контракт не развернут на выбранной сети.');
            return;
          }
          const instance = new web3Instance.eth.Contract(
            LogisticsContract.abi,
            deployedNetwork && deployedNetwork.address
          );
          setContract(instance);

          // Проверяем, является ли текущий аккаунт компанией
          const companyAddress = await instance.methods.companyAddress().call();
          setIsCompany(accounts[0].toLowerCase() === companyAddress.toLowerCase());

          const orderCount = parseInt(await instance.methods.getOrderCount().call(), 10);
          setOrderCount(orderCount);

          const reviewCount = parseInt(await instance.methods.getReviewCount().call(), 10);
          setReviewCount(reviewCount);

          const avgRating = await instance.methods.getAverageRating().call();
          setAverageRating(avgRating);

          // Загружаем заказы
          const fetchedOrders = [];
          for (let i = 0; i < orderCount; i++) {
            const order = await instance.methods.getOrder(i).call();
            fetchedOrders.push(order);
          }
          setOrders(fetchedOrders);
        } catch (error) {
          console.error('Ошибка при инициализации Web3:', error);
          toast.error('Ошибка при инициализации Web3. Проверьте консоль для деталей.');
        }
      } else {
        toast.error('MetaMask не обнаружен. Пожалуйста, установите MetaMask для взаимодействия с приложением.');
      }
    }
    initWeb3();
  }, []);

  // Функция обновления списка заказов
  const fetchOrders = async () => {
    if (contract && web3) {
      try {
        const count = parseInt(await contract.methods.getOrderCount().call(), 10);
        setOrderCount(count);
        const fetchedOrders = [];
        for (let i = 0; i < count; i++) {
          const order = await contract.methods.getOrder(i).call();
          fetchedOrders.push(order);
        }
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Ошибка при получении заказов:', error);
        toast.error('Ошибка при получении заказов.');
      }
    }
  };

  // Функция обновления среднего рейтинга
  const fetchAverageRating = async () => {
    if (contract) {
      try {
        const avgRating = await contract.methods.getAverageRating().call();
        setAverageRating(avgRating);
      } catch (error) {
        console.error('Ошибка при получении среднего рейтинга:', error);
        toast.error('Ошибка при получении среднего рейтинга.');
      }
    }
  };

  // Обновление заказов и рейтинга после добавления нового заказа или отзыва
  useEffect(() => {
    if (contract && web3) {
      fetchOrders();
      fetchAverageRating();
    }
  }, [contract, web3]);

  useEffect(() => {
    if (contract) {
      contract.events.OrderAdded({}, (error, event) => {
        if (!error) {
          fetchOrders();
          toast.info(`Новый заказ добавлен: ID ${event.returnValues.orderId}`);
        } else {
          console.error('Ошибка события OrderAdded:', error);
        }
      });

      contract.events.OrderPaid({}, (error, event) => {
        if (!error) {
          fetchOrders();
          toast.info(`Заказ оплачен: ID ${event.returnValues.orderId}`);
        } else {
          console.error('Ошибка события OrderPaid:', error);
        }
      });

      contract.events.OrderCompleted({}, (error, event) => {
        if (!error) {
          fetchOrders();
          fetchAverageRating();
          toast.info(`Заказ выполнен: ID ${event.returnValues.orderId}`);
        } else {
          console.error('Ошибка события OrderCompleted:', error);
        }
      });

      contract.events.OrderCancelled({}, (error, event) => {
        if (!error) {
          fetchOrders();
          toast.info(`Заказ отменён: ID ${event.returnValues.orderId}`);
        } else {
          console.error('Ошибка события OrderCancelled:', error);
        }
      });

      contract.events.ReviewAdded({}, (error, event) => {
        if (!error) {
          fetchAverageRating();
          toast.info(`Новый отзыв добавлен к заказу: ID ${event.returnValues.orderId}`);
        } else {
          console.error('Ошибка события ReviewAdded:', error);
        }
      });
    }
  }, [contract]);

  const handlePayForOrder = async (orderId, price) => {
    try {
      await contract.methods
        .payForOrder(orderId)
        .send({ from: accounts[0], value: price });

      await fetchOrders();

      toast.success('Заказ успешно оплачен!');
    } catch (error) {
      console.error('Ошибка при оплате заказа:', error);
      toast.error('Ошибка при оплате заказа. Проверьте консоль для деталей.');
    }
  };

  // Функция для подтверждения получения заказа получателем
  const handleConfirmOrder = async (orderId) => {
    try {
      const order = orders[orderId];
      if (!order.isPaid) {
        toast.error('Заказ не оплачен. Нельзя подтвердить получение.');
        return;
      }
      if (order.isCompleted) {
        toast.error('Заказ уже был подтвержден.');
        return;
      }
      if (order.isCancelled) {
        toast.error('Заказ был отменен.');
        return;
      }

      const comment = prompt('Введите комментарий к заказу:');
      const ratingInput = prompt('Введите оценку (1-5):');
      const rating = parseInt(ratingInput, 10);

      if (!comment || isNaN(rating) || rating < 1 || rating > 5) {
        toast.warn('Некорректные данные для отзыва.');
        return;
      }

      await contract.methods
        .completeOrder(orderId, comment, rating)
        .send({ from: accounts[0] });

      await fetchOrders();

      toast.success('Заказ успешно подтвержден и отзыв оставлен!');
    } catch (error) {
      console.error('Ошибка при подтверждении заказа:', error);
      toast.error('Ошибка при подтверждении заказа. Проверьте консоль для деталей.');
    }
  };

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
  };

  const handleCloseDetails = () => {
    setSelectedOrderId(null);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="lg" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
      <ToastContainer />
      <Header currentAccount={accounts[0]} />

      {/* Таб навигации */}
      <Tabs value={currentTab} onChange={handleTabChange} centered indicatorColor="primary" textColor="primary">
        <Tab label="Добавить заказ" />
        <Tab label="Мои заказы" />
        <Tab label="Статистика" />
        {isCompany && <Tab label="Управление" />}
      </Tabs>

      {/* Содержимое вкладок */}
      <Box hidden={currentTab !== 0} sx={{ p: 3 }}>
        <AddOrder contract={contract} accounts={accounts} web3={web3} />
      </Box>

      <Box hidden={currentTab !== 1} sx={{ p: 3 }}>
        <MyOrders 
          orders={orders} 
          web3={web3} 
          handlePayForOrder={handlePayForOrder} 
          handleViewDetails={handleViewDetails} 
          handleConfirmOrder={handleConfirmOrder}
          currentAccount={accounts[0]}
        />
      </Box>


      <Box hidden={currentTab !== 2} sx={{ p: 3 }}>
        <Statistics 
          orderCount={orderCount} 
          reviewCount={reviewCount} 
          averageRating={averageRating} 
        />
      </Box>

      {isCompany && (
        <Box hidden={currentTab !== 3} sx={{ p: 3 }}>
          <CompanyManagement contract={contract} accounts={accounts} />
        </Box>
      )}

      {/* Детали заказа */}
      {selectedOrderId !== null && (
        <OrderDetails
          contract={contract}
          web3={web3}
          orderId={selectedOrderId}
          open={selectedOrderId !== null}
          handleClose={handleCloseDetails}
        />
      )}
    </Container>
  );
}

export default App;
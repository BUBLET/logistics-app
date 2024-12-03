// src/components/AddOrder.js
import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Paper, 
  Typography 
} from '@mui/material';
import { toast } from 'react-toastify';

const RATE_PER_KM = 0.01; // Ставка за километр в ETH

function AddOrder({ contract, accounts, web3 }) {
  const [newOrder, setNewOrder] = useState({
    recipient: '',
    distance: '',
    cargoType: '',
    price: '',
  });

  // Функция для расчета цены на основе расстояния
  const calculatePrice = (distance) => {
    const price = distance * RATE_PER_KM;
    return price.toFixed(4); // Округление до 4 знаков после запятой
  };

  const handleDistanceChange = (e) => {
    const distance = e.target.value;
    const price = distance ? calculatePrice(distance) : '';
    setNewOrder({ ...newOrder, distance, price });
  };

  const handleAddOrder = async () => {
    try {
      if (!newOrder.recipient || !newOrder.distance || !newOrder.cargoType || !newOrder.price) {
        toast.warn('Пожалуйста, заполните все поля для заказа.');
        return;
      }

      const priceInWei = web3.utils.toWei(newOrder.price, 'ether');
      await contract.methods
        .addOrder(newOrder.recipient, newOrder.distance, newOrder.cargoType, priceInWei)
        .send({ from: accounts[0] });

      // Очистка формы после успешного добавления
      setNewOrder({
        recipient: '',
        distance: '',
        cargoType: '',
        price: '',
      });

      toast.success('Заказ успешно добавлен!');
    } catch (error) {
      console.error('Ошибка при добавлении заказа:', error);
      toast.error('Ошибка при добавлении заказа. Проверьте консоль для деталей.');
    }
  };

  return (
    <Paper style={{ padding: '20px', marginBottom: '30px' }}>
      <Typography variant="h6" gutterBottom>Добавить новый заказ</Typography>
      <form noValidate autoComplete="off">
        <TextField
          label="Получатель"
          value={newOrder.recipient}
          onChange={(e) => setNewOrder({ ...newOrder, recipient: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Расстояние (км)"
          type="number"
          value={newOrder.distance}
          onChange={handleDistanceChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Тип груза"
          value={newOrder.cargoType}
          onChange={(e) => setNewOrder({ ...newOrder, cargoType: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Цена (ETH)"
          type="number"
          value={newOrder.price}
          InputProps={{
            readOnly: true,
          }}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleAddOrder} style={{ marginTop: '10px' }}>
          Добавить заказ
        </Button>
      </form>
    </Paper>
  );
}

export default AddOrder;

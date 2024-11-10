import React from 'react';
import { Button, TextField, Box, Typography } from '@mui/material';
import Web3 from 'web3';

const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

const AddOrderForm = ({ formData, handleChange, handleSubmit }) => {
  const { recipient = '', distance = '', cargoType = '' } = formData;

  // Функция для расчета цены заказа на основе расстояния и типа груза
  const calculatePrice = () => {
    const price = parseFloat(distance);
    return isNaN(price) ? 0 : price;
  };

  // Обработчик отправки формы
  const onSubmit = async (e) => {
    e.preventDefault();
    const price = calculatePrice(); // Рассчитываем цену
    console.log('Цена в ETH:', price);

    if (price <= 0) {
        alert('Некорректная цена!');
        return;
    }

    try {
        // Преобразуем цену в Wei
        const priceInWei = web3.utils.toWei(price.toString(), 'ether');
        console.log('Цена в Wei (строка):', priceInWei); // Убедитесь, что это строка

        // Передаем priceInWei как строку
        await handleSubmit(recipient, distance, cargoType, priceInWei);
    } catch (error) {
        console.error('Ошибка при конвертации в Wei:', error);
        alert('Ошибка при конвертации цены!');
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Box display="flex" flexDirection="column" gap={2}>
        {/* Поля ввода для получателя, расстояния и типа груза */}
        <TextField
          label="Адрес получателя"
          name="recipient"
          value={recipient}
          onChange={handleChange}
          required
        />
        <TextField
          label="Расстояние (в км)"
          name="distance"
          type="number"
          value={distance}
          onChange={handleChange}
          required
        />
        <TextField
          label="Тип груза"
          name="cargoType"
          value={cargoType}
          onChange={handleChange}
          required
        />
        {/* Отображение рассчитанной цены */}
        <Typography variant="body1" gutterBottom>
          Расчетная цена: {calculatePrice()} ETH
        </Typography>
        {/* Кнопка для отправки формы */}
        <Button type="submit" variant="contained" color="primary">
          Добавить заказ
        </Button>
      </Box>
    </form>
  );
};

export default AddOrderForm;

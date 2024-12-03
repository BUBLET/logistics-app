// src/components/OrderList.js
import React from 'react';
import { 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button,
  Chip
} from '@mui/material';
import { toast } from 'react-toastify';

function OrderList({ orders, web3, handlePayForOrder, handleViewDetails, handleConfirmOrder, currentAccount }) {

  // Фильтруем заказы по текущему аккаунту (отправленные или полученные)
  const filteredOrders = orders.filter(order => 
    order.sender.toLowerCase() === currentAccount.toLowerCase() ||
    order.recipient.toLowerCase() === currentAccount.toLowerCase()
  );

  // Функция для получения цвета чипа в зависимости от статуса
  const getStatusChip = (order) => {
    let status = '';
    let color = 'default';

    if (order.isCancelled) {
      status = 'Отменён';
      color = 'error';
    } else if (order.isCompleted) {
      status = 'Выполнен';
      color = 'success';
    } else if (order.isPaid) {
      status = 'Оплачен';
      color = 'primary';
    } else {
      status = 'Не оплачен';
      color = 'default';
    }

    return <Chip label={status} color={color} />;
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>Список заказов</Typography>
      <TableContainer component={Paper} style={{ marginBottom: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Отправитель</TableCell>
              <TableCell>Получатель</TableCell>
              <TableCell>Расстояние (км)</TableCell>
              <TableCell>Тип груза</TableCell>
              <TableCell>Цена (ETH)</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.length > 0 ? filteredOrders.map((order, index) => {
              const isSender = order.sender.toLowerCase() === currentAccount.toLowerCase();
              const isRecipient = order.recipient.toLowerCase() === currentAccount.toLowerCase();
              const orderIndex = orders.findIndex(o => 
                o.sender.toLowerCase() === order.sender.toLowerCase() && 
                o.recipient.toLowerCase() === order.recipient.toLowerCase() &&
                o.distance === order.distance &&
                o.cargoType === order.cargoType &&
                o.price === order.price
              );

              return (
                <TableRow key={index}>
                  <TableCell>{orderIndex}</TableCell>
                  <TableCell>{order.sender}</TableCell>
                  <TableCell>{order.recipient}</TableCell>
                  <TableCell>{order.distance}</TableCell>
                  <TableCell>{order.cargoType}</TableCell>
                  <TableCell>{web3.utils.fromWei(order.price, 'ether')} ETH</TableCell>
                  <TableCell>{getStatusChip(order)}</TableCell>
                  <TableCell>
                    {/* Кнопка "Оплатить" для отправителя, если заказ не оплачен */}
                    {isSender && !order.isPaid && !order.isCancelled && !order.isCompleted && (
                      <Button 
                        variant="contained" 
                        color="secondary" 
                        onClick={() => handlePayForOrder(orderIndex, order.price)}
                        style={{ marginRight: '5px' }}
                      >
                        Оплатить
                      </Button>
                    )}
                    {/* Кнопка "Подтвердить получение" для получателя, если заказ оплачен и не завершен */}
                    {isRecipient && order.isPaid && !order.isCompleted && !order.isCancelled && (
                      <Button 
                        variant="contained" 
                        color="success" 
                        onClick={() => handleConfirmOrder(orderIndex)}
                        style={{ marginRight: '5px' }}
                      >
                        Подтвердить получение
                      </Button>
                    )}
                    {/* Кнопка "Подробнее" для всех пользователей */}
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      onClick={() => handleViewDetails(orderIndex)}
                    >
                      Подробнее
                    </Button>
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={8} align="center">Нет доступных заказов.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default OrderList;

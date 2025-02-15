// src/components/MyOrders.js
import React, { useState } from 'react';
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

function MyOrders({
  orders,
  web3,
  handlePayForOrder,
  handleViewDetails,
  handleConfirmOrder,
  currentAccount
}) {
  
  const [showActive, setShowActive] = useState(true);

  // Распределяем заказы на отправленные и полученные
  const sentOrders = orders.filter(
    (order) => order.sender.toLowerCase() === currentAccount.toLowerCase()
  );
  const receivedOrders = orders.filter(
    (order) => order.recipient.toLowerCase() === currentAccount.toLowerCase()
  );

  // Выделяем активные/завершённые заказы
  const filterActive = (list) =>
    list.filter((order) => !order.isCompleted && !order.isCancelled);

  // Завершённые заказы
  const filterCompleted = (list) =>
    list.filter((order) => order.isCompleted);

  // Получаем активные / завершённые отдельно для отправленных и полученных
  const sentActive = filterActive(sentOrders);
  const receivedActive = filterActive(receivedOrders);
  const sentCompleted = filterCompleted(sentOrders);
  const receivedCompleted = filterCompleted(receivedOrders);

  // Функция для отображения статуса заказа
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

  // Общая функция отрисовки таблицы для списка заказов
  const renderOrdersTable = (ordersList, type) => (
    <>
      <Typography variant="h6" gutterBottom>
        {type === 'sent' ? 'Отправленные заказы' : 'Полученные заказы'}
      </Typography>
      <TableContainer
        component={Paper}
        elevation={1}
        sx={{ borderRadius: '10px', backgroundColor: '#ffffff', padding: '10px' }}
      >
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
            {ordersList.length > 0 ? (
              ordersList.map((order, index) => {
                // Поиск индекса заказа в общем массиве
                const orderIndex = orders.findIndex(
                  (o) =>
                    o.sender.toLowerCase() === order.sender.toLowerCase() &&
                    o.recipient.toLowerCase() === order.recipient.toLowerCase() &&
                    o.distance === order.distance &&
                    o.cargoType === order.cargoType &&
                    o.price === order.price
                );

                const isSender = type === 'sent';
                const isRecipient = type === 'received';

                return (
                  <TableRow key={index}>
                    <TableCell>{orderIndex}</TableCell>
                    <TableCell>{order.sender}</TableCell>
                    <TableCell>{order.recipient}</TableCell>
                    <TableCell>{order.distance}</TableCell>
                    <TableCell>{order.cargoType}</TableCell>
                    <TableCell>
                      {web3.utils.fromWei(order.price, 'ether')} ETH
                    </TableCell>
                    <TableCell>{getStatusChip(order)}</TableCell>
                    <TableCell>
                      {/* Отображаем кнопки только для активных заказов */}
                      {!order.isCompleted && !order.isCancelled && (
                        <>
                          {/* Кнопка оплатить*/}
                          {isSender && !order.isPaid && (
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={() => handlePayForOrder(orderIndex, order.price)}
                              style={{ marginRight: '5px' }}
                            >
                              Оплатить
                            </Button>
                          )}
                          {/* Подтвердить получение  */}
                          {isRecipient && order.isPaid && !order.isCompleted && (
                            <Button
                              variant="contained"
                              color="success"
                              onClick={() => handleConfirmOrder(orderIndex)}
                              style={{ marginRight: '5px' }}
                            >
                              Подтвердить
                            </Button>
                          )}
                        </>
                      )}

                      {/*кнопка подробнее */}
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
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Нет доступных заказов.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  return (
    <div>
      {/* Переключение между активными и завершёнными заказами */}
      <div style={{ marginBottom: '20px' }}>
        <Button
          variant={showActive ? 'contained' : 'outlined'}
          onClick={() => setShowActive(true)}
          style={{ marginRight: '10px' }}
        >
          Активные
        </Button>
        <Button
          variant={!showActive ? 'contained' : 'outlined'}
          onClick={() => setShowActive(false)}
        >
          Завершённые
        </Button>
      </div>

      {showActive ? (
        <>
          {renderOrdersTable(sentActive, 'sent')}
          {renderOrdersTable(receivedActive, 'received')}
        </>
      ) : (
        <>
          {renderOrdersTable(sentCompleted, 'sent')}
          {renderOrdersTable(receivedCompleted, 'received')}
        </>
      )}
    </div>
  );
}

export default MyOrders;

import React, { useState } from 'react';
import { List, ListItem, ListItemText, Paper, Typography, Button, Collapse, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const OrderList = ({ orders, web3, currentAccount, cancelOrder }) => {
  // Состояние для хранения ID раскрытого заказа
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Функция для переключения раскрытия деталей заказа
  const handleToggleDetails = (orderId) => {
    if (expandedOrderId === orderId) {
      // Если заказ уже раскрыт, закрываем его
      setExpandedOrderId(null);
    } else {
      // Иначе раскрываем выбранный заказ
      setExpandedOrderId(orderId);
    }
  };

  // Функция для отмены заказа
  const handleCancelOrder = async (orderId) => {
    try {
      // Вызываем функцию отмены заказа, переданную через пропс cancelOrder
      await cancelOrder(orderId);
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  // Фильтрация заказов по отправителю (текущему аккаунту)
  const filteredOrders = orders.filter(order => order.sender.toLowerCase() === currentAccount.toLowerCase());

  return (
    <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px' }}>
      {/* Заголовок раздела */}
      <Typography variant="h5" component="h2" gutterBottom>
        Ваши отправления
      </Typography>
      {/* Список с отфильтрованными и отображаемыми заказами */}
      <List>
        {filteredOrders.map((order, index) => (
          <React.Fragment key={index}>
            {/* Элемент списка для каждого заказа */}
            <ListItem style={{ marginBottom: '16px' }}>
              {/* Основная информация о заказе */}
              <ListItemText
                primary={`Отправление № ${index}`} // Номер отправления
                secondary={`Статус: ${order.isCompleted ? 'Завершено' : order.isCancelled ? 'Отменено' : 'Не завершено'}`} // Статус заказа
              />
              {/* Кнопка "Отменить" заказ (доступна только для не завершенных и не отмененных заказов) */}
              {!order.isCompleted && !order.isCancelled && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleCancelOrder(order.id)}
                >
                  Отменить
                </Button>
              )}
              {/* Кнопка для раскрытия/скрытия деталей заказа */}
              <Button
                onClick={() => handleToggleDetails(order.id)}
                aria-expanded={expandedOrderId === order.id}
                aria-label="Показать детали заказа"
                endIcon={expandedOrderId === order.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                Показать детали
              </Button>
            </ListItem>
            {/* Развернутая панель с деталями заказа */}
            <Collapse in={expandedOrderId === order.id} timeout="auto" unmountOnExit>
              <Box margin={1}>
                {/* Детали заказа */}
                <Typography variant="body1">
                  <strong>Получатель:</strong> {order.recipient} {/* Получатель */}
                </Typography>
                <Typography variant="body1">
                  <strong>Расстояние:</strong> {parseInt(order.distance)} {/* Расстояние */}
                </Typography>
                <Typography variant="body1">
                  <strong>Тип груза:</strong> {order.cargoType} {/* Тип груза */}
                </Typography>
                <Typography variant="body1">
                  <strong>Цена:</strong> {web3.utils.fromWei(order.price.toString(), 'ether')} ETH {/* Цена */}
                </Typography>
                {/* Дата доставки, если указана */}
                {order.deliveryDate != 0 && (
                  <Typography variant="body1">
                    <strong>Дата доставки:</strong> {new Date(Number(order.deliveryDate) * 1000).toLocaleString()}
                  </Typography>
                )}
                {/* Статус заказа */}
                <Typography variant="body1">
                  <strong>Статус:</strong> {order.isCompleted ? 'Завершено' : order.isCancelled ? 'Отменен' : 'В процессе'}
                </Typography>
              </Box>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default OrderList;

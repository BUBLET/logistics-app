import React from 'react';
import { Box, Button, TextField, Typography, List, ListItem, ListItemText, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const CompleteOrderForm = ({ handleSubmit, web3, orders, currentAccount }) => {
  const [selectedOrderId, setSelectedOrderId] = React.useState(null);
  const [comment, setComment] = React.useState('');
  const [rating, setRating] = React.useState('');
  const [expandedOrderIds, setExpandedOrderIds] = React.useState([]);

  // Фильтрация заказов по отправителю (текущему аккаунту)
  const filteredOrders = orders.filter(order => {
    // Проверяем, что order существует и имеет корректное значение recipient
    if (order && order.recipient) {
      return order.recipient === currentAccount;
    }
    return false;
  });
  
  

  // Функция для сортировки заказов: активные сначала, потом остальные
  const sortedOrders = filteredOrders.sort((a, b) => {
    if ((a.isCancelled || a.isCompleted) && !(b.isCancelled || b.isCompleted)) {
      return 1;
    } else if (!(a.isCancelled || a.isCompleted) && (b.isCancelled || b.isCompleted)) {
      return -1;
    } else {
      return 0;
    }
  });
  console.log('filteredOrders:', filteredOrders);
  console.log('sortedOrders:', sortedOrders);
  const handleConfirmOrder = (orderId) => {
    setSelectedOrderId(orderId);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!comment || !rating) {
      alert('Пожалуйста, заполните все поля (комментарий и оценка).');
      return;
    }
    handleSubmit(selectedOrderId, comment, rating);
    setSelectedOrderId(null);
    setComment('');
    setRating('');
  };

  const toggleDetails = (orderId) => {
    if (expandedOrderIds.includes(orderId)) {
      setExpandedOrderIds(expandedOrderIds.filter(id => id !== orderId));
    } else {
      setExpandedOrderIds([...expandedOrderIds, orderId]);
    }
  };

  return (
    <Box>
      <Box mb={2}>
        {sortedOrders.length > 0 ? (
          sortedOrders.map((order) => (
            <Box key={order.id} mb={2}>
              <ListItem style={{ display: 'flex', alignItems: 'center' }}>
                <Box style={{ flex: 1 }}>
                  <ListItemText
                    primary={`Заказ № ${order.id}`}
                    secondary={`Статус: ${order.isCompleted ? 'Завершен' : order.isCancelled ? 'Отменен' : 'Активен'}`}
                  />
                </Box>
                {!order.isCancelled && !order.isCompleted && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleConfirmOrder(order.id)}
                    disabled={selectedOrderId !== null}
                    style={{ marginRight: '16px' }}
                  >
                    Подтвердить
                  </Button>
                )}
                <Button
                  onClick={() => toggleDetails(order.id)}
                  aria-expanded={expandedOrderIds.includes(order.id)}
                  aria-label="Показать детали заказа"
                  endIcon={expandedOrderIds.includes(order.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                >
                  Детали
                </Button>
              </ListItem>
              <Collapse in={expandedOrderIds.includes(order.id)} timeout="auto" unmountOnExit>
                <Box margin={1}>
                  <Typography variant="body1">
                    <strong>Отправитель:</strong> {order.sender}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Расстояние:</strong> {parseInt(order.distance)}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Тип груза:</strong> {order.cargoType}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Цена:</strong> {web3.utils.fromWei(order.price.toString(), 'ether')} ETH
                    </Typography>
                  {/* Дата доставки, если указана */}
                  {order.deliveryDate != 0 && (
                  <Typography variant="body1">
                    <strong>Дата доставки:</strong> {new Date(Number(order.deliveryDate) * 1000).toLocaleString()}
                  </Typography>
                  )}
                  <Typography variant="body1">
                    <strong>Статус:</strong> {order.isCompleted ? 'Завершено' : order.isCancelled ? 'Отменен' : 'В процессе'}
                  </Typography>
                </Box>
              </Collapse>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">Вам еще ничего не отправили :C</Typography>
        )}
      </Box>
      {selectedOrderId !== null && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Завершение заказа
          </Typography>
          <form onSubmit={onSubmit}>
            <Box mb={2}>
              <TextField
                name="comment"
                label="Комментарий"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                fullWidth
                variant="outlined"
                margin="normal"
              />
            </Box>
            <Box mb={2}>
              <TextField
                name="rating"
                label="Оценка"
                type="number"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                fullWidth
                variant="outlined"
                margin="normal"
              />
            </Box>
            <Box>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Отправить отзыв
              </Button>
            </Box>
          </form>
        </Box>
      )}
    </Box>
  );
};

export default CompleteOrderForm;

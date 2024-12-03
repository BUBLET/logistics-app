// src/components/OrderDetails.js
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  TextField
} from '@mui/material';
import { toast } from 'react-toastify';

function OrderDetails({ contract, web3, orderId, open, handleClose }) {
  const [order, setOrder] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(1);
  const [isRecipient, setIsRecipient] = useState(false);

  useEffect(() => {
    async function fetchOrderDetails() {
      if (contract && web3 && orderId >= 0) {
        try {
          const orderData = await contract.methods.getOrder(orderId).call();
          setOrder(orderData);

          const fetchedReviews = await contract.methods.getReviewsByOrder(orderId).call();
          setReviews(fetchedReviews);

          // Проверяем, является ли текущий пользователь получателем
          const accounts = await web3.eth.getAccounts();
          setIsRecipient(orderData.recipient.toLowerCase() === accounts[0].toLowerCase());
        } catch (error) {
          console.error('Ошибка при получении деталей заказа:', error);
        }
      }
    }
    if (open) {
      fetchOrderDetails();
    }
  }, [contract, web3, orderId, open]);

  if (!order) {
    return null;
  }

  const handleConfirm = async () => {
    try {
      if (!comment || isNaN(rating) || rating < 1 || rating > 5) {
        toast.warn('Пожалуйста, введите комментарий и оценку от 1 до 5.');
        return;
      }

      await contract.methods
        .completeOrder(orderId, comment, rating)
        .send({ from: order.recipient });

      // Обновляем данные после подтверждения
      const updatedOrder = await contract.methods.getOrder(orderId).call();
      setOrder(updatedOrder);

      const updatedReviews = await contract.methods.getReviewsByOrder(orderId).call();
      setReviews(updatedReviews);

      toast.success('Заказ успешно подтвержден и отзыв оставлен!');
    } catch (error) {
      console.error('Ошибка при подтверждении заказа:', error);
      toast.error('Ошибка при подтверждении заказа. Проверьте консоль для деталей.');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Детали заказа #{orderId}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1"><strong>Отправитель:</strong> {order.sender}</Typography>
        <Typography variant="body1"><strong>Получатель:</strong> {order.recipient}</Typography>
        <Typography variant="body1"><strong>Расстояние:</strong> {order.distance} км</Typography>
        <Typography variant="body1"><strong>Тип груза:</strong> {order.cargoType}</Typography>
        <Typography variant="body1"><strong>Цена:</strong> {web3.utils.fromWei(order.price, 'ether')} ETH</Typography>
        <Typography variant="body1"><strong>Статус:</strong>
          {order.isCancelled
            ? ' Отменён'
            : order.isCompleted
            ? ' Выполнен'
            : order.isPaid
            ? ' Оплачен'
            : ' Не оплачен'}
        </Typography>

        <Typography variant="h6" style={{ marginTop: '20px' }}>Отзывы:</Typography>
        {reviews.length > 0 ? (
          <List>
            {reviews.map((review, index) => (
              <ListItem key={index} alignItems="flex-start">
                <ListItemText
                  primary={`Рейтинг: ${review.rating}`}
                  secondary={
                    <>
                      <Typography variant="body2" color="textPrimary">
                        Комментарий: {review.comment}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Отзывчик: {review.reviewer}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2">Нет отзывов.</Typography>
        )}

        {/* Форма для подтверждения заказа и добавления отзыва */}
        {isRecipient && order.isPaid && !order.isCompleted && !order.isCancelled && (
          <div style={{ marginTop: '20px' }}>
            <Typography variant="h6">Подтвердить получение заказа</Typography>
            <TextField
              label="Комментарий"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Оценка"
              type="number"
              inputProps={{ min: 1, max: 5 }}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button variant="contained" color="success" onClick={handleConfirm} style={{ marginTop: '10px' }}>
              Подтвердить и оставить отзыв
            </Button>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}

export default OrderDetails;

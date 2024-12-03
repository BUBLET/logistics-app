// src/components/Reviews.js
import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Paper, 
  Typography 
} from '@mui/material';
import { toast } from 'react-toastify';

function Reviews({ contract, accounts }) {
  const [newReview, setNewReview] = useState({
    orderId: '',
    comment: '',
    rating: 1,
  });

  const handleCompleteOrder = async () => {
    try {
      if (!newReview.orderId || !newReview.comment || !newReview.rating) {
        toast.warn('Пожалуйста, заполните все поля для отзыва.');
        return;
      }

      await contract.methods
        .completeOrder(newReview.orderId, newReview.comment, newReview.rating)
        .send({ from: accounts[0] });

      // Очистка формы после успешного добавления
      setNewReview({
        orderId: '',
        comment: '',
        rating: 1,
      });

      toast.success('Заказ успешно завершён и отзыв оставлен!');
    } catch (error) {
      console.error('Ошибка при выполнении заказа:', error);
      toast.error('Ошибка при выполнении заказа. Проверьте консоль для деталей.');
    }
  };

  return (
    <Paper style={{ padding: '20px', marginBottom: '30px' }}>
      <Typography variant="h6" gutterBottom>Оставить отзыв</Typography>
      <form noValidate autoComplete="off">
        <TextField
          label="ID заказа"
          type="number"
          value={newReview.orderId}
          onChange={(e) => setNewReview({ ...newReview, orderId: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Комментарий"
          value={newReview.comment}
          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Оценка"
          type="number"
          inputProps={{ min: 1, max: 5 }}
          value={newReview.rating}
          onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleCompleteOrder} style={{ marginTop: '10px' }}>
          Оставить отзыв
        </Button>
      </form>
    </Paper>
  );
}

export default Reviews;

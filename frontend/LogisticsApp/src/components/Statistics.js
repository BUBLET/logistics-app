// src/components/Statistics.js
import React from 'react';
import { Typography, Paper } from '@mui/material';

function Statistics({ orderCount, reviewCount, averageRating }) {
  return (
    <Paper style={{ padding: '20px', marginBottom: '30px' }}>
      <Typography variant="h6" gutterBottom>Статистика</Typography>
      <Typography variant="body1"><strong>Количество заказов:</strong> {orderCount}</Typography>
      <Typography variant="body1"><strong>Количество отзывов:</strong> {reviewCount}</Typography>
      <Typography variant="body1"><strong>Средний рейтинг компании:</strong> {averageRating}</Typography>
    </Paper>
  );
}

export default Statistics;

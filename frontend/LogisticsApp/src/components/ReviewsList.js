import React from 'react';
import { List, ListItem, ListItemText, Typography, Paper } from '@mui/material';

const ReviewsList = ({ reviews }) => {
  return (
    <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px' }}>
      <Typography variant="h5" component="h2" gutterBottom>Отзывы</Typography>
      <List>
        {reviews.map((review, index) => (
          <ListItem key={index} divider>
            <ListItemText primary={`ID заказа: ${review.orderId}`} />
            <ListItemText primary={`Автор отзыва: ${review.reviewer}`} />
            <ListItemText primary={`Комментарий: ${review.comment}`} />
            <ListItemText primary={`Оценка: ${review.rating}`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default ReviewsList;

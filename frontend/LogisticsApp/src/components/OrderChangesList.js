import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const OrderChangesList = ({ orderChanges }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID заказа</TableCell>
            <TableCell>Тип изменения</TableCell>
            <TableCell>Время</TableCell>
            <TableCell>Детали</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orderChanges.map((change, index) => (
            <TableRow key={index}>
              <TableCell>{change.orderId}</TableCell>
              <TableCell>{change.changeType}</TableCell>
              <TableCell>{new Date(change.timestamp * 1000).toLocaleString()}</TableCell>
              <TableCell>{change.details}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OrderChangesList;

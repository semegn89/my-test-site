const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let payments = [];

// Получить все платежи
app.get('/payments', (req, res) => {
  res.json(payments);
});

// Создать новый платёж
app.post('/payments', (req, res) => {
  const newPayment = {
    id: Date.now(),
    purpose: req.body.purpose,
    amount: req.body.amount,
    currency: req.body.currency
  };
  payments.push(newPayment);
  res.status(201).json({ message: 'Payment created', payment: newPayment });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
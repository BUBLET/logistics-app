// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract Logistics {

    // Структура для хранения информации о заказе
    struct Order {
        address sender;      // Адрес отправителя
        address recipient;   // Адрес получателя
        uint distance;       // Расстояние между пунктами отправления и назначения
        string cargoType;    // Тип груза
        uint price;          // Стоимость заказа
        bool isPaid;         // Статус оплаты заказа
        bool isCompleted;    // Флаг, указывающий на то, выполнен ли заказ
        bool isCancelled;    // Флаг, указывающий, отменен ли заказ
    }

    // Структура для хранения информации об отзыве
    struct Review {
        uint orderId;        // Идентификатор заказа, к которому относится отзыв
        address reviewer;    // Адрес участника, оставившего отзыв
        string comment;      // Текст отзыва
        uint rating;         // Оценка выполнения заказа от 1 до 5
    }

    // Массивы для хранения всех заказов и отзывов
    Order[] public orders;
    Review[] public reviews;

    // Адрес компании (контракта)
    address public companyAddress;

    // События для отслеживания действий
    event OrderAdded(uint orderId, address sender, address recipient, uint price);
    event OrderPaid(uint orderId, uint amount);
    event OrderCompleted(uint orderId);
    event OrderCancelled(uint orderId);
    event ReviewAdded(uint orderId, address reviewer, uint rating);

    // Конструктор контракта
    constructor() {
        companyAddress = msg.sender;
    }

    // Модификаторы доступа
    modifier onlySender(uint _orderId) {
        require(msg.sender == orders[_orderId].sender, "Only the sender can perform this action");
        _;
    }

    modifier onlyRecipient(uint _orderId) {
        require(msg.sender == orders[_orderId].recipient, "Only the recipient can perform this action");
        _;
    }

    // Функция для добавления нового заказа (без оплаты)
    function addOrder(address _recipient, uint _distance, string memory _cargoType, uint _price) public {
        require(_recipient != msg.sender, "Sender and recipient cannot be the same person");
        orders.push(Order(msg.sender, _recipient, _distance, _cargoType, _price, false, false, false));
        emit OrderAdded(orders.length - 1, msg.sender, _recipient, _price);
    }

    // Функция для оплаты заказа
    function payForOrder(uint _orderId) public payable onlySender(_orderId) {
        Order storage order = orders[_orderId];
        require(!order.isPaid, "Order is already paid");
        require(msg.value == order.price, "Sent Ether does not match the price of the order");

        // Обновляем статус оплаты
        order.isPaid = true;
        emit OrderPaid(_orderId, msg.value);
    }

    // Функция для выполнения заказа и оставления отзыва
    function completeOrder(uint _orderId, string memory _comment, uint _rating) public onlyRecipient(_orderId) {
        Order storage order = orders[_orderId];
        require(order.isPaid, "Order must be paid before completion");
        require(!order.isCompleted, "The order has already been completed");
        require(!order.isCancelled, "The order was canceled");
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");

        order.isCompleted = true;

        // Добавляем новый отзыв
        reviews.push(Review(_orderId, msg.sender, _comment, _rating));
        emit ReviewAdded(_orderId, msg.sender, _rating);

        emit OrderCompleted(_orderId);
        // Средства остаются на контракте (компании)
    }

    // Функция для отмены заказа
    function cancelOrder(uint _orderId) public onlySender(_orderId) {
        Order storage order = orders[_orderId];
        require(!order.isCompleted, "You cannot cancel a completed order");
        require(!order.isCancelled, "Order is already cancelled");

        order.isCancelled = true;

        // Возвращаем средства отправителю при отмене заказа, если он был оплачен
        if (order.isPaid) {
            uint refundAmount = order.price;
            order.isPaid = false;
            (bool success, ) = payable(order.sender).call{value: refundAmount}("");
            require(success, "Refund failed.");
        }

        emit OrderCancelled(_orderId);
    }

    // Функция для получения количества заказов в системе
    function getOrderCount() public view returns (uint) {
        return orders.length;
    }

    // Функция для получения количества отзывов в системе
    function getReviewCount() public view returns (uint) {
        return reviews.length;
    }

    // Функция для получения заказов с пагинацией
    function getOrders(uint startIndex, uint endIndex) public view returns (Order[] memory) {
        require(endIndex >= startIndex, "End index must be greater than or equal to start index");
        require(endIndex < orders.length, "End index out of bounds");

        uint length = endIndex - startIndex + 1;
        Order[] memory orderList = new Order[](length);

        for (uint i = 0; i < length; i++) {
            orderList[i] = orders[startIndex + i];
        }

        return orderList;
    }

    // Новые функции

    // Функция для вывода средств компании
    function withdrawCompanyFunds() public {
        require(msg.sender == companyAddress, "Only the company can withdraw funds");
        uint balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool success, ) = payable(companyAddress).call{value: balance}("");
        require(success, "Withdrawal failed.");
    }

    // Функция для получения отзывов по определенному заказу
    function getReviewsByOrder(uint _orderId) public view returns (Review[] memory) {
        uint reviewCount = 0;

        // Подсчитываем количество отзывов для конкретного заказа
        for (uint i = 0; i < reviews.length; i++) {
            if (reviews[i].orderId == _orderId) {
                reviewCount++;
            }
        }

        // Создаем массив для отзывов по заказу
        Review[] memory orderReviews = new Review[](reviewCount);
        uint index = 0;

        for (uint i = 0; i < reviews.length; i++) {
            if (reviews[i].orderId == _orderId) {
                orderReviews[index] = reviews[i];
                index++;
            }
        }

        return orderReviews;
    }

    // Функция для получения среднего рейтинга компании
    function getAverageRating() public view returns (uint) {
        uint totalRating = 0;
        uint totalReviews = reviews.length;

        if (totalReviews == 0) {
            return 0;
        }

        for (uint i = 0; i < totalReviews; i++) {
            totalRating += reviews[i].rating;
        }

        return totalRating / totalReviews;
    }

    // Функция для поиска заказов по отправителю
    function getOrdersBySender(address _sender) public view returns (Order[] memory) {
        uint count = 0;

        // Подсчитываем количество заказов для конкретного отправителя
        for (uint i = 0; i < orders.length; i++) {
            if (orders[i].sender == _sender) {
                count++;
            }
        }

        // Создаем массив для заказов отправителя
        Order[] memory senderOrders = new Order[](count);
        uint index = 0;

        for (uint i = 0; i < orders.length; i++) {
            if (orders[i].sender == _sender) {
                senderOrders[index] = orders[i];
                index++;
            }
        }

        return senderOrders;
    }
}

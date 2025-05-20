<?php
require_once 'CarModel.php';

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['car_model'])) {
    $_SESSION['car_model'] = new CarModel();
}
$model = $_SESSION['car_model'];

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';
$carId = $input['carId'] ?? null;

$response = [];

switch ($action) {
    case 'getCars':
        $response = $model->getAvailableCars();
        break;
    case 'addToCart':
        $response = ['success' => $model->addToCart($carId)];
        break;
    case 'removeFromCart':
        $response = ['success' => $model->removeFromCart($carId)];
        break;
    case 'getCart':
        $response = [
            'cart' => $model->getCart(),
            'total' => $model->getTotal()
        ];
        break;
    case 'clearCart':
        $model->clearCart();
        $response = ['success' => true];
        break;
    default:
        http_response_code(400);
        $response = ['error' => 'Acción inválida'];
}

echo json_encode($response);

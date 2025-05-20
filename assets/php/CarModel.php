<?php

class CarModel {
    private $cart = [];

    public function getAvailableCars() {
        return [
            [
                'id' => 1,
                'name' => 'CHEVROLET ONIX 1.0',
                'type' => 'Auto Económico',
                'features' => ['A/C', 'Manual'],
                'capacity' => '5 pasajeros',
                'luggage' => '2 maletas',
                'doors' => '4 puertas',
                'price' => 32.00,
                'image' => 'assets/img/CHEVROLET-Onix.jpg'
            ],
            [
                'id' => 2,
                'name' => 'CHEVROLET AVEO 1.4',
                'type' => 'Auto Compacto',
                'features' => ['A/C', 'Automático'],
                'capacity' => '5 pasajeros',
                'luggage' => '2 maletas',
                'doors' => '4 puertas',
                'price' => 38.00,
                'image' => 'assets/img/aveo.jpg'
            ],
            [
                'id' => 3,
                'name' => 'VOLKSWAGEN VENTO 2.0',
                'type' => 'Auto Sedán',
                'features' => ['A/C', 'Automático'],
                'capacity' => '5 pasajeros',
                'luggage' => '3 maletas',
                'doors' => '4 puertas',
                'price' => 45.00,
                'image' => 'assets/img/vento.jpg'
            ]
        ];
    }

    public function addToCart($carId) {        
        foreach ($this->getAvailableCars() as $car) {            
            if ($car['id'] == $carId) {
                $this->cart[] = $car;
                return true;
            }
        }
        return false;
    }

    public function removeFromCart($carId) {
        foreach ($this->cart as $index => $car) {
            if ($car['id'] == $carId) {
                unset($this->cart[$index]);
                $this->cart = array_values($this->cart);
                return true;
            }
        }
        return false;
    }

    public function getCart() {
        return $this->cart;
    }

    public function clearCart() {
        $this->cart = [];
    }

    public function getTotal() {
        $total = 0;
        foreach ($this->cart as $car) {
            $total += $car['price'];
        }
        return $total;
    }
}

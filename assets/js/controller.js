class CarController {
    constructor() {

        this.cartButton = document.getElementById('cartButton');
        this.cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
        this.checkoutBtn = document.getElementById('checkoutBtn');        

        if (!this.checkoutBtn) {
            console.error('ERROR: Botón checkoutBtn no encontrado en el DOM');
            return;
        }
                
        const cartIcon = this.cartButton.querySelector('i.fa-shopping-cart');
        if (cartIcon) {
            cartIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showCart();
            });
        }

        this.checkoutBtn.addEventListener('click', () => this.handleCheckout());
        this.cartButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showCart();
        });

        this.initEvents();
        this.renderCars();
        this.updateCartCount();
    }

    async fetchFromServer(action, carId = null) {
        const res = await fetch('assets/php/controller.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, carId })
        });
        return await res.json();
    }

    async handleCheckout() {
    // Deshabilita el botón durante el proceso
    this.checkoutBtn.disabled = true;
    const originalText = this.checkoutBtn.innerHTML;
    this.checkoutBtn.innerHTML = 'Procesando...';

    try {
        // Simulación de pago (2 segundos)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Llamar al servidor para limpiar el carrito
        await this.fetchFromServer('clearCart', 'POST');

        // Ocultar modal de carrito
        this.cartModal.hide();

        // Mostrar confirmación de pago
        this.showPaymentSuccess();

        // Actualizar contador y carrito
        await this.updateCartCount();
        await this.showCart();

    } catch (error) {
        console.error('Error en handleCheckout:', error);
        this.showToast('Error al procesar el pago', 'danger');
    } finally {
        // Restaurar el botón
        this.checkoutBtn.disabled = false;
        this.checkoutBtn.innerHTML = originalText;
    }
}

    async renderCars() {
    const cars = await this.fetchFromServer('getCars');
    const carouselInner = document.querySelector('.carousel-inner');
    if (!carouselInner) {
        console.error('carousel-inner no encontrado en el DOM');
        return;
    }

    carouselInner.innerHTML = '';

    const cardsPerSlide = window.innerWidth < 768 ? 1 :
                          window.innerWidth < 992 ? 2 : 3;

    for (let i = 0; i < cars.length; i += cardsPerSlide) {
        const slideCars = cars.slice(i, i + cardsPerSlide);
        const slideItem = document.createElement('div');
        slideItem.className = `carousel-item ${i === 0 ? 'active' : ''}`;

        const row = document.createElement('div');
        row.className = 'row justify-content-center';

        slideCars.forEach(car => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';
            col.innerHTML = this.createCarCard(car);
            row.appendChild(col);
        });

        slideItem.appendChild(row);
        carouselInner.appendChild(slideItem);
    }

    if (this.carousel) {
        this.carousel.dispose();
    }
    this.carousel = new bootstrap.Carousel(document.getElementById('carsCarousel'));
}


    showPaymentSuccess() {
        // Crear modal de éxito
        const successModal = `
            <div class="modal fade" id="paymentSuccessModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header border-0">
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body text-center py-4">
                            <div class="mb-4">
                                <i class="fas fa-check-circle text-success" style="font-size: 5rem;"></i>
                            </div>
                            <h3 class="mb-3">¡Pago Exitoso!</h3>
                            <p class="mb-4">Tu reserva ha sido confirmada. Recibirás un correo con los detalles.</p>
                            <div class="d-grid gap-2">
                                <button class="btn btn-success" data-bs-dismiss="modal">
                                    <i class="fas fa-thumbs-up me-2"></i>Aceptar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Agregar al DOM
        document.body.insertAdjacentHTML('beforeend', successModal);
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('paymentSuccessModal'));
        modal.show();
        
        // Eliminar modal después de cerrar
        document.getElementById('paymentSuccessModal').addEventListener('hidden.bs.modal', () => {
            document.getElementById('paymentSuccessModal').remove();
        });
    }

    createCarCard(car) {        
        return `
            <div class="col-lg-12 col-md-12 mb-4">
                <div class="car-card">
                    <img src="${car.image}" class="car-img card-img-top" alt="${car.name}">
                    <div class="card-body p-4">
                        <h5 class="car-title card-title">${car.name}</h5>
                        <div class="container pt-4">
                            <div class="row align-items-start">
                                <div class="col">
                                    <span class="fs-5">${car.type}</span><br>
                                    ${car.features.map(f => `
                                        <i class="fas ${f === 'A/C' ? 'fa-snowflake' : 'fa-cogs'} feature-icon"></i>
                                        <span class="fs-5">${f}</span><br>
                                    `).join('')}
                                </div>
                                <div class="col">
                                    <span class="fs-5">${car.capacity}</span><br/>
                                    <span class="fs-5"><i class="fas fa-suitcase feature-icon"></i> ${car.luggage}</span><br/>
                                    <span><i class="fas fa-door-open feature-icon"></i> <span class="fs-5">${car.doors}</span></span>
                                </div>                            
                            </div>
                        </div>                    
                        <div class="d-flex justify-content-center pt-4 mb-3">                            
                            <p class="price-tag">$${car.price.toFixed(2)} USD</p>                            
                        </div>
                        <div class="d-flex justify-content-center mb-3">                            
                            <button class="btn reserve-btn btn-reserve" data-id="${car.id}">
                                RESERVAR AUTO
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;                
    }

    showToast(message, type) {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        // Eliminar el toast después de que se cierre
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }


    
    initEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-reserve')) {
                const carId = parseInt(e.target.dataset.id);
                this.addToCart(carId);
            }

            if (e.target.classList.contains('remove-item')) {
                const carId = parseInt(e.target.dataset.id);
                this.removeFromCart(carId);
            }

            if (e.target.id === 'cartButton') {
                this.showCart();
            }
        });
    }

    async addToCart(carId) {                
        await this.fetchFromServer('addToCart', carId);
        this.showToast('Auto agregado al carrito', 'success');
        this.updateCartCount();   
        //this.showCart();
    }

    async showCart() {
    const data = await this.fetchFromServer('getCart');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (data.cart.length === 0) {
        this.checkoutBtn.disabled = true;
        this.checkoutBtn.classList.add('disabled');
    } else {
        this.checkoutBtn.disabled = false;
        this.checkoutBtn.classList.remove('disabled');
    }

    // Asegúrate de que los elementos existen antes de usarlos
    if (!cartItemsContainer || !cartTotal) {
        console.error('Elementos del modal no encontrados');
        return;
    }

    // Renderiza los ítems del carrito
    cartItemsContainer.innerHTML = data.cart.map(item => `
        <div class="row mb-3 align-items-center">
            <div class="col-md-4">
                <img src="${item.image}" class="img-fluid rounded" alt="${item.name}">
            </div>
            <div class="col-md-6">
                <h5>${item.name}</h5>
                <p>${item.type} - $${item.price.toFixed(2)} USD</p>
            </div>
            <div class="col-md-2 text-end">
                <button class="btn btn-danger btn-sm remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Total
    cartTotal.textContent = `$${data.total.toFixed(2)} USD`;

    // Asignar eventos a los botones "Eliminar"
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            this.removeFromCart(id);
        });
    });

    // Mostrar el modal
    this.cartModal.show();
}

    async updateCartCount() {
        try {
            const data = await this.fetchFromServer('getCart');
            const cartCount = document.getElementById('cartCount');
            if (cartCount) {
                cartCount.textContent = data.cart.length;
            }
        } catch (error) {
            console.error('Error al actualizar el contador del carrito:', error);
        }
    }

     async removeFromCart(carId) {
        await this.fetchFromServer('removeFromCart', carId);
        this.showCart();
    }

    async checkout() {
        await this.fetchFromServer('clearCart');
        alert('Reserva realizada con éxito');
        this.cartModal.hide();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CarController();
});

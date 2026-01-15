// configurations.js

// Данные комплектаций
const configurationsData = [
    {
        id: 'base',
        name: 'Базовая комплектация',
        price: 'Включено',
        priceValue: 0,
        features: [
            {
                image: 'imgs/BazaSalon1.png',
                caption: 'Стандартный салон',
                description: 'Тканевая обивка сидений'
            },
            {
                image: 'imgs/BazaAudio.jpg',
                caption: 'Базовая аудиосистема',
                description: '4 динамика, радио/CD'
            },
            {
                image: 'imgs/WheelBaza.png',
                caption: 'Стальные диски',
                description: '16" стальные диски с колпаками'
            }
        ]
    },
    {
        id: 'comfort',
        name: 'Комфорт',
        price: '+150 000 ₽',
        priceValue: 150000,
        features: [
            {
                image: 'imgs/PremiumSalon.png',
                caption: 'Улучшенный салон',
                description: 'Комбинированная обивка сидений'
            },
            {
                image: 'imgs/PremiumAudio.png',
                caption: 'Премиум аудиосистема',
                description: '6 динамиков, Bluetooth'
            },
            {
                image: 'imgs/WheelPremium.png',
                caption: 'Легкосплавные диски',
                description: '17" легкосплавные диски'
            },
            {
                image: 'imgs/TempPremium.png',
                caption: 'Климат-контроль',
                description: 'Двухзонный климат-контроль'
            }
        ]
    },
    {
        id: 'premium',
        name: 'Премиум',
        price: '+300 000 ₽',
        priceValue: 300000,
        features: [
            {
                image: 'imgs/UltraSalon.png',
                caption: 'Кожаный салон',
                description: 'Кожаная обивка сидений'
            },
            {
                image: 'imgs/UltraAudio.png',
                caption: 'Премиум аудиосистема',
                description: '8 динамиков, навигация'
            },
            {
                image: 'imgs/UltraWheel.png',
                caption: 'Премиум диски',
                description: '18" легкосплавные диски'
            },
            {
                image: 'imgs/UltraFary.png',
                caption: 'LED фары',
                description: 'Полностью светодиодная оптика'
            },
            {
                image: 'imgs/UltraPanorama.png',
                caption: 'Панорамная крыша',
                description: 'Электролюк с панорамным остеклением'
            }
        ]
    }
];

// Данные дополнительных услуг
const additionalServices = [
    {
        id: 'leather-covers',
        name: 'Кожаные чехлы',
        description: 'Эксклюзивные кожаные чехлы ручной работы',
        price: '25 000 ₽',
        priceValue: 25000,

    },
    {
        id: 'premium-mats',
        name: 'Премиум коврики',
        description: 'Влагостойкие коврики с логотипом',
        price: '8 000 ₽',
        priceValue: 8000,

    },
    {
        id: 'window-tinting',
        name: 'Тонировка стекол',
        description: 'Премиальная тонировка с гарантией',
        price: '15 000 ₽',
        priceValue: 15000,

    },
    {
        id: 'protection-film',
        name: 'Антигравийная пленка',
        description: 'Защита кузова от сколов и царапин',
        price: '40 000 ₽',
        priceValue: 40000,

    },
    {
        id: 'alarm-system',
        name: 'Противоугонная система',
        description: 'Спутниковый мониторинг и автозапуск',
        price: '20 000 ₽',
        priceValue: 20000,

    },
    {
        id: 'winter-tires',
        name: 'Зимняя резина',
        description: 'Комплект зимней резины на дисках',
        price: '35 000 ₽',
        priceValue: 35000,

    }
];

// Состояние выбранных опций
window.selectedConfiguration = null;
window.selectedServices = [];
window.configurationsData = configurationsData;
window.additionalServices = additionalServices;

// Функция для обновления отображения корзины с учетом комплектации и услуг
function updateOrderForm() {
    const orderInfo = document.getElementById('orderInfo');
    const totalPriceElement = document.getElementById('totalPrice');
    const cartDataInput = document.getElementById('cartData');

    // Сохраняем данные корзины в скрытое поле формы
    const orderData = {
        cars: shoppingCart,
        configuration: selectedConfiguration,
        services: selectedServices,
        timestamp: new Date().toISOString()
    };
    cartDataInput.value = JSON.stringify(orderData);

    if (shoppingCart.length === 0 && !selectedConfiguration) {
        orderInfo.innerHTML = '<p class="empty-cart">Корзина пуста. Добавьте автомобили и выберите комплектацию.</p>';
        totalPriceElement.textContent = '0 ₽';
        return;
    }

    let totalPrice = 0;
    let orderHTML = '<div class="cart-items">';

    // Добавляем автомобили в корзину
    shoppingCart.forEach((car, index) => {
        totalPrice += car.priceValue;
        orderHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${car.name}</strong>
                    <span class="cart-item-specs">${car.specs}</span>
                    <span class="cart-item-price">${car.price}</span>
                </div>
                <button class="remove-from-cart-btn" data-type="car" data-index="${index}">✕</button>
            </div>
        `;
    });

    // Добавляем выбранную комплектацию
    if (selectedConfiguration) {
        const config = configurationsData.find(c => c.id === selectedConfiguration);
        if (config) {
            totalPrice += config.priceValue;
            orderHTML += `
                <div class="cart-item config-item">
                    <div class="cart-item-info">
                        <strong>Комплектация: ${config.name}</strong>
                        <span class="cart-item-specs">Дополнительное оборудование и опции</span>
                        <span class="cart-item-price">${config.price}</span>
                    </div>
                    <button class="remove-from-cart-btn" data-type="config">✕</button>
                </div>
            `;
        }
    }

    // Добавляем дополнительные услуги
    selectedServices.forEach(serviceId => {
        const service = additionalServices.find(s => s.id === serviceId);
        if (service) {
            totalPrice += service.priceValue;
            orderHTML += `
                <div class="cart-item service-item">
                    <div class="cart-item-info">
                        <strong>${service.name}</strong>
                        <span class="cart-item-specs">${service.description}</span>
                        <span class="cart-item-price">${service.price}</span>
                    </div>
                    <button class="remove-from-cart-btn" data-type="service" data-service-id="${serviceId}">✕</button>
                </div>
            `;
        }
    });

    orderHTML += '</div>';
    orderInfo.innerHTML = orderHTML;
    totalPriceElement.textContent = formatPrice(totalPrice) + ' ₽';

    // Добавляем обработчики для кнопок удаления
    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            if (type === 'car') {
                const index = parseInt(this.getAttribute('data-index'));
                removeFromCart(index);
            } else if (type === 'config') {
                removeConfiguration();
            } else if (type === 'service') {
                const serviceId = this.getAttribute('data-service-id');
                removeService(serviceId);
            }
        });
    });
}

// Функция для форматирования цены
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Функция для создания элемента комплектации
function createConfigurationElement(config) {
    const configElement = document.createElement('div');
    configElement.className = 'configuration-item';
    configElement.id = `config-${config.id}`;

    let featuresHTML = '';
    config.features.forEach(feature => {
        featuresHTML += `
            <div class="feature-item">
                <img src="${feature.image}" alt="${feature.caption}" class="feature-image">
                <div class="feature-caption">${feature.caption}</div>
                <div class="feature-description">${feature.description}</div>
            </div>
        `;
    });

    configElement.innerHTML = `
        <div class="configuration-header">
            <h3>${config.name}</h3>
            <div class="configuration-price">${config.price}</div>
        </div>
        <div class="configuration-features">
            ${featuresHTML}
        </div>
        <button class="select-config-btn" data-config-id="${config.id}">
            Выбрать комплектацию
        </button>
    `;

    return configElement;
}

// Функция для создания элемента дополнительной услуги
function createServiceElement(service) {
    const serviceElement = document.createElement('div');
    serviceElement.className = 'service-item';

    serviceElement.innerHTML = `
        <img src="${service.image}" alt="${service.name}" class="service-image">
        <div class="service-name">${service.name}</div>
        <div class="service-description">${service.description}</div>
        <div class="service-price">${service.price}</div>
        <button class="add-service-btn" data-service-id="${service.id}">
            Добавить услугу
        </button>
    `;

    return serviceElement;
}

// Функция для отображения комплектаций
function displayConfigurations() {
    const grid = document.getElementById('configurationsGrid');

    configurationsData.forEach(config => {
        grid.appendChild(createConfigurationElement(config));
    });

    // Добавляем обработчики для кнопок выбора комплектации
    document.querySelectorAll('.select-config-btn').forEach(button => {
        button.addEventListener('click', function() {
            const configId = this.getAttribute('data-config-id');
            selectConfiguration(configId);
        });
    });
}

// Функция для отображения дополнительных услуг
function displayAdditionalServices() {
    const grid = document.getElementById('servicesGrid');

    additionalServices.forEach(service => {
        grid.appendChild(createServiceElement(service));
    });

    // Добавляем обработчики для кнопок добавления услуг
    document.querySelectorAll('.add-service-btn').forEach(button => {
        button.addEventListener('click', function() {
            const serviceId = this.getAttribute('data-service-id');
            toggleService(serviceId, this);
        });
    });
}

// Функция выбора комплектации
function selectConfiguration(configId) {
    // Сбрасываем предыдущий выбор
    document.querySelectorAll('.configuration-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelectorAll('.select-config-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.textContent = 'Выбрать комплектацию';
    });

    // Устанавливаем новый выбор
    const selectedItem = document.getElementById(`config-${configId}`);
    const selectedButton = selectedItem.querySelector('.select-config-btn');

    selectedItem.classList.add('selected');
    selectedButton.classList.add('selected');
    selectedButton.textContent = '✓ Выбрано';

    selectedConfiguration = configId;
    updateOrderForm();
    showNotification('Комплектация выбрана', 'Вы успешно выбрали комплектацию автомобиля.');
}

// Функция удаления комплектации
function removeConfiguration() {
    selectedConfiguration = null;

    // Сбрасываем визуальное выделение
    document.querySelectorAll('.configuration-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelectorAll('.select-config-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.textContent = 'Выбрать комплектацию';
    });

    updateOrderForm();
    showNotification('Комплектация удалена', 'Комплектация удалена из заказа.');
}

// Функция переключения услуги
function toggleService(serviceId, button) {
    const serviceIndex = selectedServices.indexOf(serviceId);

    if (serviceIndex === -1) {
        // Добавляем услугу
        selectedServices.push(serviceId);
        button.classList.add('added');
        button.textContent = '✓ Добавлено';
        updateOrderForm();
        showNotification('Услуга добавлена', 'Дополнительная услуга добавлена к заказу.');
    } else {
        // Удаляем услугу
        selectedServices.splice(serviceIndex, 1);
        button.classList.remove('added');
        button.textContent = 'Добавить услугу';
        updateOrderForm();
        showNotification('Услуга удалена', 'Дополнительная услуга удалена из заказа.');
    }
}

// Функция удаления услуги
function removeService(serviceId) {
    const serviceIndex = selectedServices.indexOf(serviceId);
    if (serviceIndex !== -1) {
        selectedServices.splice(serviceIndex, 1);

        // Обновляем кнопку в блоке услуг
        const serviceButton = document.querySelector(`.add-service-btn[data-service-id="${serviceId}"]`);
        if (serviceButton) {
            serviceButton.classList.remove('added');
            serviceButton.textContent = 'Добавить услугу';
        }

        updateOrderForm();
        showNotification('Услуга удалена', 'Дополнительная услуга удалена из заказа.');
    }
}

// Функция показа уведомления
function showNotification(title, message) {
    const modal = document.getElementById('notificationModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.style.display = 'block';

    // Добавляем обработчик для кнопки "Окей"
    const okBtn = document.getElementById('modalOkBtn');
    okBtn.onclick = function() {
        modal.style.display = 'none';
    }

    // Закрытие при клике вне модального окна
    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
}

// Функция проверки комплектации перед отправкой формы
function validateConfigurationBeforeSubmit(event) {
    if (!selectedConfiguration) {
        event.preventDefault();
        showNotification(
            'Комплектация не выбрана',
            'Пожалуйста, выберите комплектацию автомобиля перед оформлением заказа.'
        );
        return false;
    }

    if (shoppingCart.length === 0) {
        event.preventDefault();
        showNotification(
            'Автомобиль не выбран',
            'Пожалуйста, выберите автомобиль перед оформлением заказа.'
        );
        return false;
    }

    const selectedConfig = configurationsData.find(config => config.id === selectedConfiguration);
    showNotification(
        'Заказ оформляется',
        `Вы выбрали автомобиль и комплектацию "${selectedConfig.name}". Продолжаем оформление заказа.`
    );

    return true;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    displayConfigurations();
    displayAdditionalServices();

    // Добавляем обработчик для формы заказа
    const orderForm = document.querySelector('.feedback-form');
    if (orderForm) {
        orderForm.addEventListener('submit', validateConfigurationBeforeSubmit);
    }

    // Обработчик для кнопки модального окна (дополнительная безопасность)
    document.getElementById('modalOkBtn').addEventListener('click', function() {
        document.getElementById('notificationModal').style.display = 'none';
    });

    // Инициализируем корзину
    updateOrderForm();
});
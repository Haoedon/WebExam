// car-sorting.js

// Глобальные переменные
let carsData = [];
let shoppingCart = [];
let filterState = {
    'Седаны': false,
    'Внедорожники': false,
    'Кей-кары': false
};

// LocalStorage key for selected items (store only identifiers)
const CART_KEY = 'selected_item_ids';

// Simple combos definitions (student can adjust rules)
const COMBOS = [
    { id: 'one_or_more', name: 'Одно или более', rule: ids => ids.length >= 1 },
    { id: 'exact_two', name: 'Точная пара', rule: ids => ids.length === 2 }
];

// Helpers for cart ids
function getCartIds() {
    try {
        const raw = localStorage.getItem(CART_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveCartIds(ids) {
    localStorage.setItem(CART_KEY, JSON.stringify(ids));
}

function addIdToCart(id) {
    const ids = getCartIds();
    if (!ids.includes(id)) {
        ids.push(id);
        saveCartIds(ids);
    }
}

function removeIdFromCart(id) {
    let ids = getCartIds();
    ids = ids.filter(x => x !== id);
    saveCartIds(ids);
}

function toggleIdInCart(id) {
    const ids = getCartIds();
    if (ids.includes(id)) {
        removeIdFromCart(id);
        return false;
    } else {
        addIdToCart(id);
        return true;
    }
}

function isIdSelected(id) {
    return getCartIds().includes(id);
}

function isValidCombo(ids) {
    return COMBOS.some(c => c.rule(ids));
}

// Функция для загрузки данных об автомобилях через API
function loadCars() {
    // try local file first to avoid network hang, then remote backup
    const apiSources = [
        './cars.json',
        'https://raw.githubusercontent.com/Haoedon/CarDillerOn/main/cars.json'
    ];

    return tryApiSources(apiSources, 0);
}

function tryApiSources(sources, index) {
    if (index >= sources.length) {
        console.log('Все источники недоступны, используем демо-данные');
        return Promise.resolve(getDemoCars());
    }

    return fetchWithTimeout(sources[index], 4000)
        .then(response => {
            if (!response.ok) throw new Error('API не доступен');
            return response.json();
        })
        .then(cars => {
            console.log(`Данные загружены из источника: ${sources[index]}`);
            return cars;
        })
        .catch(error => {
            console.log(`Источник ${sources[index]} не доступен, пробуем следующий...`);
            return tryApiSources(sources, index + 1);
        });
}

// fetch with timeout helper to avoid hanging network requests
function fetchWithTimeout(url, timeout = 4000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('timeout')), timeout);
        fetch(url).then(res => {
            clearTimeout(timer);
            resolve(res);
        }).catch(err => {
            clearTimeout(timer);
            reject(err);
        });
    });
}

// Демо-данные на случай недоступности API
function getDemoCars() {
    const demoCars = [
        {
            "name": "TOYOTA COROLLA 2014",
            "latinName": "toyota_corolla_2014",
            "category": "Седаны",
            "price": "900 000 ₽",
            "specs": "1.5 л, 132 л.с., МКПП",
            "image": "imgs/Toyota_Corolla.jpg",
            "horsepower": 132,
            "priceValue": 900000
        },
        {
            "name": "Nissan Skyline X (R34)",
            "latinName": "nissan_skyline_r34",
            "category": "Седаны",
            "price": "4 600 000 ₽",
            "specs": "2.5 л, 200 л.с., МКПП",
            "image": "imgs/Nissan_Skyline_R34_GT-R_Nür_002.jpg",
            "horsepower": 200,
            "priceValue": 4600000
        }
    ];
    console.log('Используются демо-данные автомобилей');
    return demoCars;
}

// Функция для создания HTML элемента автомобиля
function createCarElement(car) {
    const carElement = document.createElement('div');
    carElement.className = 'car-item';
    carElement.setAttribute('data-car', car.latinName);

    const selected = isIdSelected(car.latinName);
    const btnText = selected ? 'В корзине' : 'Добавить в корзину';

    carElement.innerHTML = `
        <img src="${car.image}" alt="${car.name}" onerror="this.src='imgs/car-placeholder.jpg'">
        <p class="car-price">${car.price}</p>
        <p class="car-name">${car.name}</p>
        <p class="car-specs">${car.specs}</p>
        <button class="add-to-cart-btn" data-latin="${car.latinName}">${btnText}</button>
    `;

    return carElement;
}

// Функция для добавления автомобиля в корзину
function addToCart(car) {
    shoppingCart.push(car);
    updateOrderForm();
    showCartNotification(car.name);
}

// Функция для показа уведомления о добавлении в корзину
function showCartNotification(carName) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `<span>✅ "${carName}" добавлен в корзину</span>`;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Функция для обновления формы заказа
function updateOrderForm() {
    const orderInfo = document.getElementById('orderInfo');
    const totalPriceElement = document.getElementById('totalPrice');
    const cartDataInput = document.getElementById('cartData');
    // Build shoppingCart from selected ids and available carsData
    const selectedIds = getCartIds();
    const selectedCars = selectedIds.map(id => carsData.find(c => c.latinName === id)).filter(Boolean);

    if (!orderInfo) return; // nothing to update on this page

    if (selectedCars.length === 0 && !window.selectedConfiguration) {
        orderInfo.innerHTML = '<p class="empty-cart">Корзина пуста. Добавьте автомобили из каталога.</p>';
        if (totalPriceElement) totalPriceElement.textContent = '0 ₽';
        if (cartDataInput) cartDataInput.value = JSON.stringify({ cars: [], timestamp: new Date().toISOString() });
        return;
    }

    let totalPrice = 0;
    let orderHTML = '<div class="cart-items">';

    // Добавляем автомобили в корзину
    selectedCars.forEach((car, index) => {
        totalPrice += car.priceValue || 0;
        orderHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${car.name}</strong>
                    <span class="cart-item-specs">${car.specs}</span>
                    <span class="cart-item-price">${car.price}</span>
                </div>
                <button class="remove-from-cart-btn" data-type="car" data-latin="${car.latinName}">✕</button>
            </div>
        `;
    });

    // Добавляем выбранную комплектацию
    if (window.selectedConfiguration) {
        const config = window.configurationsData.find(c => c.id === window.selectedConfiguration);
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
    if (window.selectedServices && window.selectedServices.length > 0) {
        window.selectedServices.forEach(serviceId => {
            const service = window.additionalServices.find(s => s.id === serviceId);
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
    }

    orderHTML += '</div>';
    orderInfo.innerHTML = orderHTML;
    if (totalPriceElement) totalPriceElement.textContent = formatPrice(totalPrice) + ' ₽';

    if (cartDataInput) {
        const orderData = {
            cars: getCartIds(),
            configuration: window.selectedConfiguration || null,
            services: window.selectedServices || [],
            timestamp: new Date().toISOString()
        };
        cartDataInput.value = JSON.stringify(orderData);
    }

    // Добавляем обработчики для кнопок удаления
    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            if (type === 'car') {
                const latin = this.getAttribute('data-latin');
                if (latin) {
                    removeIdFromCart(latin);
                    updateOrderForm();
                    refreshCheckoutPanel();
                    // update any add buttons on page
                    const btn = document.querySelector(`.add-to-cart-btn[data-latin="${latin}"]`);
                    if (btn) btn.textContent = 'Добавить в корзину';
                }
            } else if (type === 'config') {
                if (window.removeConfiguration) window.removeConfiguration();
            } else if (type === 'service') {
                const serviceId = this.getAttribute('data-service-id');
                if (window.removeService) window.removeService(serviceId);
            }
        });
    });
}

// Refresh a checkout panel (if present on catalog page)
function refreshCheckoutPanel() {
    const panel = document.getElementById('checkoutPanel');
    const totalEl = document.getElementById('checkoutTotal');
    const link = document.getElementById('checkoutLink');
    const ids = getCartIds();
    if (!panel) return;
    if (ids.length === 0) {
        panel.style.display = 'none';
        return;
    }
    panel.style.display = 'block';
    // compute total
    const cars = ids.map(id => carsData.find(c => c.latinName === id)).filter(Boolean);
    const total = cars.reduce((s, c) => s + (c.priceValue || 0), 0);
    if (totalEl) totalEl.textContent = formatPrice(total) + ' ₽';
    // enable link only if combo valid
    if (link) {
        if (isValidCombo(ids)) {
            link.classList.remove('disabled');
            link.removeAttribute('aria-disabled');
        } else {
            link.classList.add('disabled');
            link.setAttribute('aria-disabled', 'true');
        }
    }
}

// Функция для удаления автомобиля из корзины
function removeFromCart(index) {
    shoppingCart.splice(index, 1);
    updateOrderForm();
}

// Функция для форматирования цены
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Функция для фильтрации автомобилей по лошадиным силам
function filterCarsByHorsepower(cars, maxHorsepower = 160) {
    return cars.filter(car => car.horsepower <= maxHorsepower);
}

// Функция для создания элементов управления фильтрацией
function createFilterControls(category) {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-controls';

    const filterId = `filter-${category.replace(/\s+/g, '-').toLowerCase()}`;

    filterContainer.innerHTML = `
        <label class="filter-checkbox">
            <input type="checkbox" id="${filterId}" class="util-filter">
            <span class="checkmark"></span>
            Повышенный утиль сбор (до 160 л.с.)
        </label>
    `;

    const checkbox = filterContainer.querySelector('.util-filter');
    checkbox.addEventListener('change', function() {
        filterState[category] = this.checked;
        applyFiltersAndSort();
    });

    return filterContainer;
}

// Функция для применения фильтров и сортировки
function applyFiltersAndSort() {
    const mainElement = document.querySelector('main');
    const sortOrder = document.getElementById('sortOrder') ? document.getElementById('sortOrder').value : 'asc';

    // Очищаем основной контент
    mainElement.innerHTML = '';

    // Группируем автомобили по категориям
    const carsByCategory = {};
    carsData.forEach(car => {
        if (!carsByCategory[car.category]) {
            carsByCategory[car.category] = [];
        }
        carsByCategory[car.category].push(car);
    });

    // Создаем секции для каждой категории
    Object.keys(carsByCategory).forEach(category => {
        const section = document.createElement('section');
        section.className = 'cars-section';

        const heading = document.createElement('h2');
        heading.textContent = category;
        section.appendChild(heading);

        // Добавляем фильтр для категории
        const filterContainer = createFilterControls(category);
        section.appendChild(filterContainer);

        // Устанавливаем состояние чекбокса
        const checkbox = filterContainer.querySelector('.util-filter');
        checkbox.checked = filterState[category];

        const grid = document.createElement('div');
        grid.className = 'cars-grid';

        // Фильтруем автомобили если фильтр активен
        let categoryCars = [...carsByCategory[category]];
        if (filterState[category]) {
            categoryCars = filterCarsByHorsepower(categoryCars, 160);
        }

        // Сортируем автомобили
        if (sortOrder === 'asc') {
            categoryCars.sort((a, b) => a.horsepower - b.horsepower);
        } else {
            categoryCars.sort((a, b) => b.horsepower - a.horsepower);
        }

        // Добавляем автомобили в сетку
        categoryCars.forEach(car => {
            grid.appendChild(createCarElement(car));
        });

        // Если после фильтрации нет автомобилей, показываем сообщение
        if (categoryCars.length === 0) {
            const noCarsMessage = document.createElement('p');
            noCarsMessage.className = 'no-cars-message';
            noCarsMessage.textContent = 'В данной категории нет автомобилей, соответствующих фильтру';
            noCarsMessage.style.textAlign = 'center';
            noCarsMessage.style.padding = '20px';
            noCarsMessage.style.color = '#666';
            grid.appendChild(noCarsMessage);
        }

        section.appendChild(grid);
        mainElement.appendChild(section);
    });

    // Добавляем обработчики событий для кнопок "Добавить в корзину"
    setTimeout(() => {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', function() {
                const latin = this.getAttribute('data-latin');
                // toggle selection in localStorage
                const nowSelected = toggleIdInCart(latin);
                // update button text
                this.textContent = nowSelected ? 'В корзине' : 'Добавить в корзину';
                // refresh UI components that may exist on the page
                updateOrderForm();
                refreshCheckoutPanel();
                showCartNotification(nowSelected ? `Добавлено` : `Удалено` + `: ${latin}`);
            });
        });
    }, 100);
}

// Функция для создания элементов управления сортировкой
function createSortControls() {
    const carsSection = document.querySelector('.cars-section h2');
    if (!carsSection) return;

    const sortContainer = document.createElement('div');
    sortContainer.className = 'sort-controls';
    sortContainer.style.margin = '20px 0';
    sortContainer.style.textAlign = 'center';

    sortContainer.innerHTML = `
        <label for="sortOrder">Сортировать по лошадиным силам:</label>
        <select id="sortOrder">
            <option value="asc">По возрастанию</option>
            <option value="desc">По убыванию</option>
        </select>
        <button id="applySort">Применить сортировку</button>
    `;

    carsSection.parentNode.insertBefore(sortContainer, carsSection.nextSibling);

    document.getElementById('applySort').addEventListener('click', function() {
        applyFiltersAndSort();
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Загружаем данные автомобилей через API
    loadCars()
        .then(cars => {
            carsData = cars;
            console.log('Автомобили загружены:', carsData);

            // If this is the catalog page (has element that will host cars), render catalog
            const isOrderPage = !!document.getElementById('orderItems');
            if (!isOrderPage) {
                applyFiltersAndSort();
                createSortControls();
                updateOrderForm();
                refreshCheckoutPanel();
            } else {
                // Order page: do not render full catalog into <main>
                // but ensure helper UI (e.g., checkout panel) updated when needed
                updateOrderForm();
                refreshCheckoutPanel();
            }
        })
        .catch(error => {
            console.error('Ошибка загрузки автомобилей:', error);
            // Используем демо-данные в случае ошибки
            carsData = getDemoCars();
            const isOrderPage = !!document.getElementById('orderItems');
            if (!isOrderPage) {
                applyFiltersAndSort();
                createSortControls();
                updateOrderForm();
                refreshCheckoutPanel();
            } else {
                updateOrderForm();
                refreshCheckoutPanel();
            }
        });
});
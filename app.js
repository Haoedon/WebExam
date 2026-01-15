// Глобальные переменные
let allCars = [];
let filteredCars = [];
let currentPage = 1;
const itemsPerPage = 12;

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    loadCars();
    updateCartCount();
    setupEventListeners();
});

// Загрузка автомобилей
async function loadCars() {
    try {
        const response = await fetch('cars.json');
        allCars = await response.json();
        filteredCars = [...allCars];
        renderProducts();
    } catch (error) {
        console.error('Ошибка при загрузке автомобилей:', error);
        showNotification('Ошибка при загрузке каталога', 'error');
    }
}

// Отображение товаров
function renderProducts(page = 1) {
    const grid = document.getElementById('productsGrid');
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const productsToShow = filteredCars.slice(start, end);

    if (filteredCars.length === 0) {
        grid.innerHTML = '<p class="loading">Товары не найдены</p>';
        document.getElementById('loadMoreBtn').style.display = 'none';
        return;
    }

    if (page === 1) {
        grid.innerHTML = '';
    }

    productsToShow.forEach(car => {
        const card = createProductCard(car);
        grid.appendChild(card);
    });

    // Показ кнопки "Загрузить ещё"
    if (end < filteredCars.length) {
        document.getElementById('loadMoreBtn').style.display = 'block';
    } else {
        document.getElementById('loadMoreBtn').style.display = 'none';
    }
}

// Создание карточки товара
function createProductCard(car) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const discount = Math.floor(Math.random() * 30); // Случайная скидка для демонстрации
    const originalPrice = car.priceValue;
    const discountedPrice = discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : originalPrice;
    
    card.innerHTML = `
        <img src="${car.image}" alt="${car.name}" class="product-image" onerror="this.src='https://via.placeholder.com/250x200?text=${car.name}'">
        <div class="product-info">
            <h3 class="product-name">${car.name}</h3>
            <div class="product-rating">⭐ 4.5 / 5</div>
            <div class="product-price">
                <span class="price-current">${formatPrice(discountedPrice)}</span>
                ${discount > 0 ? `<span class="price-original">${formatPrice(originalPrice)}</span>` : ''}
            </div>
            <button class="add-to-cart-btn" onclick="addToCart('${car.latinName}', '${car.name}', ${discountedPrice})">
                Добавить в корзину
            </button>
        </div>
    `;
    
    return card;
}

// Добавление в корзину
function addToCart(carId, carName, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Проверка, есть ли уже в корзине
    const existing = cart.find(item => item.id === carId);
    if (!existing) {
        cart.push({
            id: carId,
            name: carName,
            price: price,
            quantity: 1
        });
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showNotification(`${carName} добавлен в корзину`, 'success');
    } else {
        showNotification('Этот товар уже в корзине', 'info');
    }
}

// Обновление количества товаров в корзине
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.length;
    document.getElementById('cartCount').textContent = count;
}

// Форматирование цены
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price);
}

// Уведомления
function showNotification(message, type = 'info') {
    const area = document.getElementById('notificationArea');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    area.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Настройка слушателей событий
function setupEventListeners() {
    // Сортировка
    document.getElementById('sortSelect').addEventListener('change', function(e) {
        sortProducts(e.target.value);
    });

    // Фильтры
    document.querySelector('.apply-filter-btn').addEventListener('click', applyFilters);
    document.querySelector('.reset-filter-btn').addEventListener('click', resetFilters);

    // Поиск
    document.getElementById('searchInput').addEventListener('input', searchProducts);

    // Загрузить ещё
    document.getElementById('loadMoreBtn').addEventListener('click', function() {
        currentPage++;
        renderProducts(currentPage);
    });
}

// Сортировка товаров
function sortProducts(sortType) {
    const sorted = [...filteredCars];
    
    switch(sortType) {
        case 'price-asc':
            sorted.sort((a, b) => a.priceValue - b.priceValue);
            break;
        case 'price-desc':
            sorted.sort((a, b) => b.priceValue - a.priceValue);
            break;
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'rating':
            sorted.sort((a, b) => b.horsepower - a.horsepower);
            break;
    }
    
    filteredCars = sorted;
    currentPage = 1;
    renderProducts(1);
}

// Применение фильтров
function applyFilters() {
    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
        .map(cb => cb.value);
    const priceFrom = parseInt(document.getElementById('priceFrom').value) || 0;
    const priceTo = parseInt(document.getElementById('priceTo').value) || Infinity;
    const discountOnly = document.getElementById('discountOnly').checked;

    filteredCars = allCars.filter(car => {
        const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(car.category);
        const priceMatch = car.priceValue >= priceFrom && car.priceValue <= priceTo;
        
        return categoryMatch && priceMatch;
    });

    currentPage = 1;
    renderProducts(1);
    showNotification('Фильтры применены', 'success');
}

// Сброс фильтров
function resetFilters() {
    document.querySelectorAll('input[name="category"]').forEach(cb => cb.checked = false);
    document.getElementById('priceFrom').value = '';
    document.getElementById('priceTo').value = '';
    document.getElementById('discountOnly').checked = false;
    document.getElementById('sortSelect').value = 'default';

    filteredCars = [...allCars];
    currentPage = 1;
    renderProducts(1);
    showNotification('Фильтры сброшены', 'info');
}

// Поиск товаров
function searchProducts(e) {
    const query = e.target.value.toLowerCase();
    
    if (query === '') {
        filteredCars = [...allCars];
    } else {
        filteredCars = allCars.filter(car => 
            car.name.toLowerCase().includes(query) ||
            car.category.toLowerCase().includes(query)
        );
    }
    
    currentPage = 1;
    renderProducts(1);
}

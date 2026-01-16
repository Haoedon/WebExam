#!/usr/bin/env python3
"""
Веб-сервер для обслуживания HTML/JS и обработки POST запросов для сохранения заказов
"""
import http.server
import socketserver
import json
import os
from datetime import datetime
from urllib.parse import parse_qs
import mimetypes

PORT = 8000
WEBROOT = os.path.dirname(os.path.abspath(__file__))

class OrderHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        """Обработка GET запросов"""
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()
    
    def do_POST(self):
        """Обработка POST запросов"""
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        # Обработка save_order.php как JSON
        if self.path == '/save_order.php':
            self.handle_order(post_data)
        else:
            self.send_error(404)
    
    def handle_order(self, post_data):
        """Обработать заказ из POST данных"""
        try:
            # Парсим FormData с помощью parse_qs
            post_str = post_data.decode('utf-8')
            
            # Для FormData, данные пришлют в виде: fio=value&email=value&cart_data=JSON
            # Парсим это
            parsed = {}
            for item in post_str.split('&'):
                if '=' in item:
                    key, value = item.split('=', 1)
                    # Декодируем URL encoding
                    from urllib.parse import unquote_plus
                    parsed[unquote_plus(key)] = unquote_plus(value)
            
            # Проверяем обязательные поля
            fio = parsed.get('fio', '').strip()
            email = parsed.get('email', '').strip()
            phone = parsed.get('phone', '').strip()
            
            if not fio or not email or not phone:
                self.send_json_response(400, {'error': 'Поля ФИО, Email и Телефон обязательны'})
                return
            
            # Парсим cart_data (это JSON строка)
            cart_data_str = parsed.get('cart_data', '{}')
            try:
                cart_json = json.loads(cart_data_str)
            except json.JSONDecodeError as e:
                self.send_json_response(400, {'error': f'Ошибка формата корзины: {str(e)}'})
                return
            
            items = cart_json.get('items', [])
            total_price = float(cart_json.get('total', 0))
            
            if not items:
                self.send_json_response(400, {'error': 'Заказ должен содержать товары'})
                return
            
            # Создаем новый заказ
            order_id = datetime.now().strftime('%Y%m%d%H%M%S') + '_' + str(os.getpid())
            new_order = {
                'order_id': order_id,
                'fio': fio,
                'email': email,
                'phone': phone,
                'address': parsed.get('address', ''),
                'delivery_date': parsed.get('deliveryDate', ''),
                'delivery_time': parsed.get('deliveryTime', ''),
                'comment': parsed.get('comment', ''),
                'newsletter': parsed.get('newsletter') == 'on',
                'items': items,
                'total_price': total_price,
                'created_at': datetime.now().isoformat()
            }
            
            # Загружаем существующие заказы
            orders_file = os.path.join(WEBROOT, 'orders.json')
            orders = []
            
            if os.path.exists(orders_file):
                try:
                    with open(orders_file, 'r', encoding='utf-8') as f:
                        orders = json.load(f)
                except:
                    orders = []
            
            # Добавляем новый заказ
            orders.append(new_order)
            
            # Сохраняем в файл
            try:
                with open(orders_file, 'w', encoding='utf-8') as f:
                    json.dump(orders, f, ensure_ascii=False, indent=2)
                
                # Возвращаем успех
                self.send_json_response(200, {
                    'success': True,
                    'message': 'Заказ успешно сохранен',
                    'order_id': order_id
                })
            except Exception as e:
                self.send_json_response(500, {'error': f'Ошибка при сохранении: {str(e)}'})
        
        except Exception as e:
            self.send_json_response(500, {'error': f'Внутренняя ошибка сервера: {str(e)}'})
    
    def send_json_response(self, status_code, data):
        """Отправить JSON ответ"""
        response = json.dumps(data, ensure_ascii=False).encode('utf-8')
        
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(response)))
        self.end_headers()
        self.wfile.write(response)
    
    def end_headers(self):
        """Добавить CORS заголовки"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

if __name__ == '__main__':
    os.chdir(WEBROOT)
    
    # Используем встроенный обработчик для файлов и наш для POST
    Handler = OrderHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"\n{'='*50}")
        print(f"🚀 Веб-сервер запущен!")
        print(f"{'='*50}")
        print(f"📍 Адрес: http://localhost:{PORT}/")
        print(f"📁 Папка: {WEBROOT}")
        print(f"{'='*50}\n")
        print("Откройте в браузере:")
        print(f"  • http://localhost:{PORT}/quick_test.html")
        print(f"  • http://localhost:{PORT}/cart.html")
        print(f"\nНажмите Ctrl+C для остановки сервера")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n⛔ Сервер остановлен")

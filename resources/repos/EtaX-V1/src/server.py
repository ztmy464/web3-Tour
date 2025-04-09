# Import necessary libraries and modules
from smart_order_router import route_orders, refresh_pools, DEX_LIST  # Custom module for routing and pool refreshing logic
from threading import Thread  # For running tasks in parallel threads
from flask import Flask, request, jsonify, redirect  # Web server framework and utilities
from flask_cors import CORS  # To allow cross-origin requests
import asyncio  # For asynchronous operations
import time  # For time-related functions
import requests  # To send HTTP requests
from flask_swagger_ui import get_swaggerui_blueprint  # To serve Swagger UI
from whitenoise import WhiteNoise  # Middleware for serving static files

# Initialize the Flask app
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for the app
app.wsgi_app = WhiteNoise(app.wsgi_app, root='static/')  # Serve static files from 'static/' directory

# Swagger UI setup
SWAGGER_URL = '/api/docs'  # Path for accessing Swagger UI
API_URL = '/static/swagger.yaml'  # Location of the Swagger YAML file

# Create a Swagger UI blueprint and register it with the app
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={'app_name': "Smart Order Router"}
)
app.register_blueprint(swaggerui_blueprint)

# Get the main asyncio event loop
loop = asyncio.get_event_loop()

# Coroutine to refresh all DEX pools asynchronously in a loop every 30 seconds
async def refresh_all_pools():
    refresh_tasks = [refresh_pools(dex) for dex in DEX_LIST]  # One task per DEX
    try:
        await asyncio.gather(*refresh_tasks)  # Run all tasks concurrently
        await asyncio.sleep(30)  # Delay before next refresh
    except KeyboardInterrupt:
        # On exit, cancel all running tasks
        for task in asyncio.all_tasks():
            if task is not asyncio.current_task():
                task.cancel()
        await asyncio.gather(*asyncio.all_tasks())

# Wrapper to run the pool refresher in a new thread
def pool_thread_task():
    asyncio.run(refresh_all_pools())

# Root endpoint to redirect to the Swagger UI
@app.route('/', methods=['GET'])
def index():
    print('DOCS ACCESSED')
    return redirect('/api/docs')

# Endpoint to return the list of supported DEXes
@app.route('/DEX_LIST', methods=['GET'])
async def get_dex_list():
    return jsonify(DEX_LIST)

# Endpoint for order routing with split logic enabled (route across multiple DEXes)
@app.route('/order_router_split', methods=['GET'])
async def order_router_split():
    sell_symbol = str(request.args.get('sell_symbol'))
    sell_ID = str(request.args.get('sell_ID'))
    sell_amount = float(request.args.get('sell_amount'))
    buy_symbol = str(request.args.get('buy_symbol'))
    buy_ID = str(request.args.get('buy_ID'))
    exchanges = request.args.get('exchanges', DEX_LIST)

    print('ORDER ROUTER CALLED')

    # Call the custom route_orders function with split routing enabled
    result = await route_orders(sell_symbol, sell_ID, sell_amount, buy_symbol, buy_ID, exchanges, split=True)
    return jsonify(result)

# Health check endpoint for monitoring
@app.route('/health', methods=['GET'])
async def health():
    return jsonify({'status': 'ok'})

# Endpoint for standard (non-split) order routing
@app.route('/order_router', methods=['GET'])
async def order_router():
    sell_symbol = str(request.args.get('sell_symbol'))
    sell_ID = str(request.args.get('sell_ID'))
    sell_amount = float(request.args.get('sell_amount'))
    buy_symbol = str(request.args.get('buy_symbol'))
    buy_ID = str(request.args.get('buy_ID'))
    exchanges = request.args.get('exchanges', DEX_LIST)

    print('ORDER ROUTER CALLED')

    # Call the route_orders function without split routing
    result = await route_orders(sell_symbol, sell_ID, sell_amount, buy_symbol, buy_ID, exchanges, split=False)
    return jsonify(result)

# Endpoint to route using a "best match" strategy (likely to find the best price/DEX)
@app.route('/best_match_order_router', methods=['GET'])
async def best_match_order_router():
    sell_symbol = str(request.args.get('sell_symbol'))
    sell_ID = str(request.args.get('sell_ID'))
    sell_amount = float(request.args.get('sell_amount'))
    exchanges = request.args.get('exchanges', DEX_LIST)

    # Use sell token as both buy and sell symbol (for price discovery)
    buy_symbol = sell_symbol
    buy_ID = sell_ID

    print('ORDER ROUTER CALLED')

    # Route using 'best_match' strategy and split enabled
    result = await route_orders(sell_symbol, sell_ID, sell_amount, buy_symbol, buy_ID, exchanges, split=True, routing_strategy='best_match')
    return jsonify(result)

# Endpoint to manually trigger refresh of all pool data
@app.route('/refresh_pools', methods=['GET'])
async def refresh_pools_route():
    await refresh_all_pools()
    return jsonify({'status': 'ok'})

# Background thread to periodically call the refresh_pools endpoint
def query_process():
    while True:
        time.sleep(1)
        requests.get('http://localhost:5000/refresh_pools')
        time.sleep(29)

# Main function to start threads and return the app instance
def main():
    threads = [
        Thread(target=pool_thread_task)
    ]
    for thread in threads:
        thread.start()
    return app

# Start the app if this script is run directly
if __name__ == '__main__':
    loop.run_until_complete(main())

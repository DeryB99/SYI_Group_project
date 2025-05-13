import csv
import json
import random
import time
import os
from datetime import datetime, timezone, timedelta

# Configuration 
PRICE_MIN = 1.0
PRICE_MAX = 100.0
QUANTITY_MIN = 1
QUANTITY_MAX = 20

# Paths
JSON_PATH = "product-category.json"
UPLOAD_FOLDER = "../backend/uploads"
SHOPS_JSON_PATH = "shops.json"

def load_product_categories(json_path):
    """Load product categories from a JSON file."""
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)
    
def load_shops(json_path):
    """Load shops"""
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        return data.get("shops", [])

def generate_csv(product_data, shops):
    """Generate a CSV file with random prices and quantities."""
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    now = datetime.now(timezone.utc)
    filename = os.path.join(UPLOAD_FOLDER, f"data_{now.strftime('%Y%m%d_%H%M%S')}.csv")
    
    with open(filename, mode="w", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        # header
        writer.writerow(["shop", "product", "category", "quantity", "price", "benefits", "time_of_sale"])
        
        total_selected = 0

        for category, products in product_data.items():
            if not products:
                continue
            n_to_select = random.randint(1, len(products))
            selected_products = random.sample(products, n_to_select)
            total_selected += n_to_select
            
            for entry in selected_products:
                shop = random.choice(shops)
                product = entry["product"]
                quantity = random.randint(QUANTITY_MIN, QUANTITY_MAX)
                price = round(random.uniform(PRICE_MIN, PRICE_MAX), 2)
                benefits = round(random.uniform(0, price - 0.01), 2) # benefits should be less than price
                delta_secs = random.uniform(0, 60)
                updated_at = now - timedelta(seconds=delta_secs)
                time_of_sale = updated_at.isoformat()
                writer.writerow([shop, product, category, quantity, price, benefits, time_of_sale])
    
    print(f"[{now.strftime('%H:%M:%S')}] File « {filename} » generated ({total_selected} rows)")

if __name__ == "__main__":
    product_data = load_product_categories(JSON_PATH)
    shops = load_shops(SHOPS_JSON_PATH)
    try:
        while True:
            generate_csv(product_data, shops)
            time.sleep(60)
    except KeyboardInterrupt:
        print("\\nProcess interrupted by user.")


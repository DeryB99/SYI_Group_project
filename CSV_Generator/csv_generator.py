import csv
import json
import random
import time
import os
from datetime import datetime, timezone

# Configuration 
PRICE_MIN = 1.0
PRICE_MAX = 100.0
QUANTITY_MIN = 1
QUANTITY_MAX = 10

# Paths
JSON_PATH = "product-category.json"
UPLOAD_FOLDER = "./uploads"

def load_product_categories(json_path):
    """Load product categories from a JSON file."""
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)

def generate_csv(data):
    """Generate a CSV file with random prices and quantities."""
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    now = datetime.now(timezone.utc)
    filename = os.path.join(UPLOAD_FOLDER, f"data_{now.strftime('%Y%m%d_%H%M%S')}.csv")
    
    with open(filename, mode="w", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        # correct header order
        writer.writerow(["product", "category", "quantity", "price"])
        total_selected = 0

        for category, products in data.items():
            if not products:
                continue
            n_to_select = random.randint(1, len(products))
            selected_products = random.sample(products, n_to_select)
            total_selected += n_to_select
            
            for entry in selected_products:
                product = entry["product"]
                quantity = random.randint(QUANTITY_MIN, QUANTITY_MAX)
                price = round(random.uniform(PRICE_MIN, PRICE_MAX), 2)
                writer.writerow([product, category, quantity, price])  # correct order
    
    print(f"[{now.strftime('%H:%M:%S')}] File « {filename} » generated ({total_selected} rows)")

if __name__ == "__main__":
    product_data = load_product_categories(JSON_PATH)
    
    try:
        while True:
            generate_csv(product_data)
            time.sleep(60)
    except KeyboardInterrupt:
        print("\\nProcess interrupted by user.")


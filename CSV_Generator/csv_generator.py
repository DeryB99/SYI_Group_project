import csv
import json
import random
import time
from datetime import datetime, timedelta, timezone

# Configuration 
PRICE_MIN = 1.0    # minimum price
PRICE_MAX = 100.0  # maximum price

# Path to the JSON file
JSON_PATH = "product-category.json"

def load_product_categories(json_path):
    """Load product categories from a JSON file."""
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)

def generate_csv(data):
    """Generate a CSV file with random prices and timestamps."""
    now = datetime.now(timezone.utc)
    filename = now.strftime("../backend/uploads/data_%Y%m%d_%H%M%S.csv")
    
    with open(filename, mode="w", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        # header
        writer.writerow(["product", "category", "price", "updatedAt"])
        total_selected = 0
        for category, products in data.items():
            if not products:
                continue
            n_to_select = random.randint(1, len(products))
            selected_products = random.sample(products, n_to_select)
            total_selected += n_to_select
            
            for entry in selected_products:
                product = entry["product"]
                price = round(random.uniform(PRICE_MIN, PRICE_MAX), 2) # randmin to max price
                delta_secs = random.uniform(0, 60) # random timestamp from the last 60 seconds
                updated_at = now - timedelta(seconds=delta_secs)
                updated_at_str = updated_at.isoformat()
                writer.writerow([product, category, price, updated_at_str]) # write the row
    
    print(f"[{now.strftime('%H:%M:%S')}] File « {filename} » generated ({total_selected} rows)")

if __name__ == "__main__":
    # Load product categories from JSON
    product_data = load_product_categories(JSON_PATH)
    
    try:
        while True:
            generate_csv(product_data)
            time.sleep(60)  # wait for 1 minute before generating the next file
    except KeyboardInterrupt:
        print("\nProcess interrupted by user.")

#!/usr/bin/env python3
"""
Convert Shopify products CSV export to structured JSON format.

This script processes the raw CSV export from Shopify and converts it into
a well-structured JSON format that groups products with their variants,
images, and metadata.
"""

import csv
import json
import os
import sys
from typing import Dict, List, Any, Optional
from datetime import datetime
import re

def clean_html_tags(text: str) -> str:
    """Remove HTML tags from text content."""
    if not text:
        return ""
    # Simple HTML tag removal
    clean = re.compile('<.*?>')
    return re.sub(clean, '', text)

def parse_boolean(value: str) -> bool:
    """Parse string boolean values to Python boolean."""
    if not value:
        return False
    return value.lower() in ['true', '1', 'yes', 'y']

def parse_number(value: str) -> Optional[float]:
    """Parse string number values to float."""
    if not value:
        return None
    try:
        return float(value)
    except ValueError:
        return None

def extract_metafields(row: Dict[str, str]) -> Dict[str, Any]:
    """Extract and organize metafields from the row."""
    metafields = {}
    
    # Extract metafields that start with specific patterns
    for key, value in row.items():
        if not value or value.strip() == "":
            continue
            
        # Handle different metafield patterns
        if key.startswith("product.metafields."):
            # Extract the metafield name
            parts = key.split(".")
            if len(parts) >= 3:
                namespace = parts[2]
                field_name = ".".join(parts[3:]) if len(parts) > 3 else "value"
                if namespace not in metafields:
                    metafields[namespace] = {}
                metafields[namespace][field_name] = value
        elif "metafields" in key.lower():
            # Handle other metafield patterns
            clean_key = key.replace(" (product.metafields.", ".").replace(")", "")
            if "." in clean_key:
                parts = clean_key.split(".")
                if len(parts) >= 2:
                    namespace = parts[1]
                    field_name = ".".join(parts[2:]) if len(parts) > 2 else "value"
                    if namespace not in metafields:
                        metafields[namespace] = {}
                    metafields[namespace][field_name] = value
    
    return metafields

def process_csv_to_json(csv_file_path: str, output_file_path: str) -> None:
    """Convert CSV file to structured JSON format."""
    
    products = {}
    
    with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row in reader:
            handle = row.get('Handle', '').strip()
            if not handle:
                continue
            
            # Initialize product if not exists
            if handle not in products:
                products[handle] = {
                    'handle': handle,
                    'title': row.get('Title', '').strip(),
                    'body_html': clean_html_tags(row.get('Body (HTML)', '')),
                    'vendor': row.get('Vendor', '').strip(),
                    'product_category': row.get('Product Category', '').strip(),
                    'type': row.get('Type', '').strip(),
                    'tags': [tag.strip() for tag in row.get('Tags', '').split(',') if tag.strip()],
                    'published': parse_boolean(row.get('Published', '')),
                    'seo_title': row.get('SEO Title', '').strip(),
                    'seo_description': row.get('SEO Description', '').strip(),
                    'gift_card': parse_boolean(row.get('Gift Card', '')),
                    'status': row.get('Status', '').strip(),
                    'variants': [],
                    'images': [],
                    'metafields': extract_metafields(row),
                    'google_shopping': {
                        'product_category': row.get('Google Shopping / Google Product Category', '').strip(),
                        'gender': row.get('Google Shopping / Gender', '').strip(),
                        'age_group': row.get('Google Shopping / Age Group', '').strip(),
                        'mpn': row.get('Google Shopping / MPN', '').strip(),
                        'condition': row.get('Google Shopping / Condition', '').strip(),
                        'custom_product': row.get('Google Shopping / Custom Product', '').strip(),
                        'custom_labels': {
                            'label_0': row.get('Google Shopping / Custom Label 0', '').strip(),
                            'label_1': row.get('Google Shopping / Custom Label 1', '').strip(),
                            'label_2': row.get('Google Shopping / Custom Label 2', '').strip(),
                            'label_3': row.get('Google Shopping / Custom Label 3', '').strip(),
                            'label_4': row.get('Google Shopping / Custom Label 4', '').strip(),
                        }
                    },
                    'reviews': {
                        'review_1': {
                            'author': row.get('Review #1 Author Name (product.metafields.custom.review_1_author_name)', '').strip(),
                            'text': row.get('Review #1 Text (product.metafields.custom.review_1_text)', '').strip(),
                        },
                        'review_2': {
                            'author': row.get('Review #2 Author Name (product.metafields.custom.review_2_author_name)', '').strip(),
                            'text': row.get('Review #2 Text (product.metafields.custom.review_2_text)', '').strip(),
                        },
                        'review_3': {
                            'author': row.get('Review #3 Author Name (product.metafields.custom.review_3_author_name)', '').strip(),
                            'text': row.get('Review #3 Text (product.metafields.custom.review_3_text)', '').strip(),
                        }
                    },
                    'collapsible_rows': {
                        'heading_1': row.get('Collapsible row - heading 1 (product.metafields.custom.collapsible_row_heading_1)', '').strip(),
                        'heading_2': row.get('Collapsible row - heading 2 (product.metafields.custom.collapsible_row_heading_2)', '').strip(),
                        'heading_3': row.get('Collapsible row - heading 3 (product.metafields.custom.collapsible_row_heading_3)', '').strip(),
                    }
                }
            
            # Add variant if it has variant-specific data
            variant_sku = row.get('Variant SKU', '').strip()
            if variant_sku or any([
                row.get('Option1 Value', '').strip(),
                row.get('Option2 Value', '').strip(),
                row.get('Option3 Value', '').strip(),
                row.get('Variant Price', '').strip(),
                row.get('Variant Compare At Price', '').strip(),
                row.get('Variant Grams', '').strip(),
                row.get('Cost per item', '').strip()
            ]):
                variant = {
                    'sku': variant_sku,
                    'grams': parse_number(row.get('Variant Grams', '')),
                    'inventory_tracker': row.get('Variant Inventory Tracker', '').strip(),
                    'inventory_policy': row.get('Variant Inventory Policy', '').strip(),
                    'fulfillment_service': row.get('Variant Fulfillment Service', '').strip(),
                    'price': parse_number(row.get('Variant Price', '')),
                    'compare_at_price': parse_number(row.get('Variant Compare At Price', '')),
                    'requires_shipping': parse_boolean(row.get('Variant Requires Shipping', '')),
                    'taxable': parse_boolean(row.get('Variant Taxable', '')),
                    'barcode': row.get('Variant Barcode', '').strip(),
                    'weight_unit': row.get('Variant Weight Unit', '').strip(),
                    'tax_code': row.get('Variant Tax Code', '').strip(),
                    'cost_per_item': parse_number(row.get('Cost per item', '')),
                    'options': {
                        'option1': {
                            'name': row.get('Option1 Name', '').strip(),
                            'value': row.get('Option1 Value', '').strip(),
                            'linked_to': row.get('Option1 Linked To', '').strip()
                        },
                        'option2': {
                            'name': row.get('Option2 Name', '').strip(),
                            'value': row.get('Option2 Value', '').strip(),
                            'linked_to': row.get('Option2 Linked To', '').strip()
                        },
                        'option3': {
                            'name': row.get('Option3 Name', '').strip(),
                            'value': row.get('Option3 Value', '').strip(),
                            'linked_to': row.get('Option3 Linked To', '').strip()
                        }
                    }
                }
                products[handle]['variants'].append(variant)
            
            # Add image if it has image data
            image_src = row.get('Image Src', '').strip()
            if image_src:
                image = {
                    'src': image_src,
                    'position': parse_number(row.get('Image Position', '')),
                    'alt_text': row.get('Image Alt Text', '').strip(),
                    'variant_image': row.get('Variant Image', '').strip()
                }
                products[handle]['images'].append(image)
    
    # Convert to list and sort by handle
    products_list = list(products.values())
    products_list.sort(key=lambda x: x['handle'])
    
    # Create output data structure
    output_data = {
        'metadata': {
            'conversion_date': datetime.now().isoformat(),
            'source_file': os.path.basename(csv_file_path),
            'total_products': len(products_list),
            'total_variants': sum(len(p['variants']) for p in products_list),
            'total_images': sum(len(p['images']) for p in products_list)
        },
        'products': products_list
    }
    
    # Write to JSON file
    with open(output_file_path, 'w', encoding='utf-8') as jsonfile:
        json.dump(output_data, jsonfile, indent=2, ensure_ascii=False)
    
    print(f"✅ Successfully converted {len(products_list)} products to JSON")
    print(f"📁 Output saved to: {output_file_path}")
    print(f"📊 Summary:")
    print(f"   - Products: {len(products_list)}")
    print(f"   - Total variants: {sum(len(p['variants']) for p in products_list)}")
    print(f"   - Total images: {sum(len(p['images']) for p in products_list)}")

def main():
    """Main function to run the conversion."""
    # Define file paths
    csv_file = "data/raw_manual/products_export_05082025.csv"
    output_file = "data/products.json"
    
    # Check if input file exists
    if not os.path.exists(csv_file):
        print(f"❌ Error: Input file not found: {csv_file}")
        sys.exit(1)
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    try:
        process_csv_to_json(csv_file, output_file)
    except Exception as e:
        print(f"❌ Error during conversion: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()

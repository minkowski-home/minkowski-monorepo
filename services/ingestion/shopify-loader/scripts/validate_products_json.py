#!/usr/bin/env python3
"""
Validate and analyze the converted products JSON file.

This script provides insights about the data structure, validates the JSON format,
and generates statistics about the products, variants, and images.
"""

import json
import os
from typing import Dict, List, Any
from collections import Counter

def analyze_products_json(json_file_path: str) -> None:
    """Analyze the products JSON file and provide insights."""
    
    if not os.path.exists(json_file_path):
        print(f"❌ Error: JSON file not found: {json_file_path}")
        return
    
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("🔍 Products JSON Analysis")
    print("=" * 50)
    
    # Metadata analysis
    metadata = data.get('metadata', {})
    print(f"📊 Metadata:")
    print(f"   - Conversion date: {metadata.get('conversion_date', 'N/A')}")
    print(f"   - Source file: {metadata.get('source_file', 'N/A')}")
    print(f"   - Total products: {metadata.get('total_products', 0)}")
    print(f"   - Total variants: {metadata.get('total_variants', 0)}")
    print(f"   - Total images: {metadata.get('total_images', 0)}")
    print()
    
    products = data.get('products', [])
    if not products:
        print("❌ No products found in JSON file")
        return
    
    # Product analysis
    print("📦 Product Analysis:")
    print(f"   - Total products: {len(products)}")
    
    # Status distribution
    status_counts = Counter(p.get('status', 'unknown') for p in products)
    print(f"   - Status distribution:")
    for status, count in status_counts.most_common():
        print(f"     • {status}: {count}")
    
    # Published vs unpublished
    published_count = sum(1 for p in products if p.get('published', False))
    unpublished_count = len(products) - published_count
    print(f"   - Published: {published_count}, Unpublished: {unpublished_count}")
    
    # Vendor analysis
    vendor_counts = Counter(p.get('vendor', 'Unknown') for p in products)
    print(f"   - Vendors:")
    for vendor, count in vendor_counts.most_common():
        print(f"     • {vendor}: {count}")
    
    # Category analysis
    category_counts = Counter(p.get('product_category', 'Unknown') for p in products)
    print(f"   - Top categories:")
    for category, count in category_counts.most_common(5):
        print(f"     • {category}: {count}")
    
    print()
    
    # Variant analysis
    print("🔄 Variant Analysis:")
    total_variants = 0
    variant_price_ranges = []
    variant_weights = []
    
    for product in products:
        variants = product.get('variants', [])
        total_variants += len(variants)
        
        for variant in variants:
            price = variant.get('price')
            if price is not None:
                variant_price_ranges.append(price)
            
            weight = variant.get('grams')
            if weight is not None:
                variant_weights.append(weight)
    
    print(f"   - Total variants: {total_variants}")
    print(f"   - Average variants per product: {total_variants / len(products):.1f}")
    
    if variant_price_ranges:
        print(f"   - Price range: ${min(variant_price_ranges):.2f} - ${max(variant_price_ranges):.2f}")
        print(f"   - Average price: ${sum(variant_price_ranges) / len(variant_price_ranges):.2f}")
    
    if variant_weights:
        print(f"   - Weight range: {min(variant_weights):.1f}g - {max(variant_weights):.1f}g")
        print(f"   - Average weight: {sum(variant_weights) / len(variant_weights):.1f}g")
    
    print()
    
    # Image analysis
    print("🖼️  Image Analysis:")
    total_images = 0
    products_with_images = 0
    
    for product in products:
        images = product.get('images', [])
        total_images += len(images)
        if images:
            products_with_images += 1
    
    print(f"   - Total images: {total_images}")
    print(f"   - Products with images: {products_with_images}")
    print(f"   - Products without images: {len(products) - products_with_images}")
    print(f"   - Average images per product: {total_images / len(products):.1f}")
    
    # Image position analysis
    image_positions = []
    for product in products:
        for image in product.get('images', []):
            position = image.get('position')
            if position is not None:
                image_positions.append(position)
    
    if image_positions:
        print(f"   - Image positions range: {min(image_positions)} - {max(image_positions)}")
    
    print()
    
    # Tag analysis
    print("🏷️  Tag Analysis:")
    all_tags = []
    for product in products:
        tags = product.get('tags', [])
        all_tags.extend(tags)
    
    tag_counts = Counter(all_tags)
    print(f"   - Total unique tags: {len(tag_counts)}")
    print(f"   - Most common tags:")
    for tag, count in tag_counts.most_common(10):
        print(f"     • {tag}: {count}")
    
    print()
    
    # Metafields analysis
    print("📋 Metafields Analysis:")
    metafield_namespaces = set()
    metafield_fields = set()
    
    for product in products:
        metafields = product.get('metafields', {})
        for namespace, fields in metafields.items():
            metafield_namespaces.add(namespace)
            if isinstance(fields, dict):
                for field_name in fields.keys():
                    metafield_fields.add(f"{namespace}.{field_name}")
    
    print(f"   - Unique metafield namespaces: {len(metafield_namespaces)}")
    print(f"   - Unique metafield fields: {len(metafield_fields)}")
    
    if metafield_namespaces:
        print(f"   - Metafield namespaces:")
        for namespace in sorted(metafield_namespaces):
            print(f"     • {namespace}")
    
    print()
    
    # Data quality check
    print("✅ Data Quality Check:")
    
    # Check for required fields
    products_without_title = sum(1 for p in products if not p.get('title'))
    products_without_handle = sum(1 for p in products if not p.get('handle'))
    products_without_variants = sum(1 for p in products if not p.get('variants'))
    
    print(f"   - Products without title: {products_without_title}")
    print(f"   - Products without handle: {products_without_handle}")
    print(f"   - Products without variants: {products_without_variants}")
    
    # Check for empty variants
    empty_variants = 0
    for product in products:
        for variant in product.get('variants', []):
            if not variant.get('sku') and not variant.get('price'):
                empty_variants += 1
    
    print(f"   - Empty variants: {empty_variants}")
    
    print()
    print("🎉 Analysis complete!")

def main():
    """Main function to run the validation."""
    json_file = "data/products.json"
    
    if not os.path.exists(json_file):
        print(f"❌ Error: JSON file not found: {json_file}")
        print("Please run the conversion script first: python scripts/convert_products_csv_to_json.py")
        return
    
    try:
        analyze_products_json(json_file)
    except Exception as e:
        print(f"❌ Error during analysis: {str(e)}")

if __name__ == "__main__":
    main()

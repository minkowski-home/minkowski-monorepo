# Minkowski Infrastructure & Data Lake

This repository contains the data engineering infrastructure and data lake for Minkowski Home's e-commerce analytics platform. It serves as the foundation for data processing, transformation, and storage that feeds into downstream analytics and business intelligence systems.

## 🏗️ Project Overview

The Minkowski Infrastructure project is designed to handle the complete data pipeline for e-commerce operations, from raw data ingestion to processed datasets ready for analytics. This data lake architecture enables scalable data processing and provides a single source of truth for all business data.

## 📁 Project Structure

```
minkowski-infra/
├── cli/                    # Command-line interface tools
│   └── info.txt           # CLI documentation
├── config/                 # Configuration files
│   └── resize_settings.yaml # Image processing settings
├── data/                   # Data lake storage
│   ├── raw_manual/        # Raw data imports (CSV, etc.)
│   │   └── products_export_05082025.csv
│   ├── customers.json     # Processed customer data
│   ├── inventory.json     # Processed inventory data
│   ├── orders.json        # Processed order data
│   ├── products.json      # Processed product data
│   └── shipments.json     # Processed shipment data
├── scripts/               # Data processing scripts
│   ├── convert_products_csv_to_json.py
│   ├── generate_thumbnails.py
│   ├── resize_images.py
│   ├── shopify_helpers.py
│   ├── sync_inventory.py
│   ├── sync_orders.py
│   ├── sync_products.py
│   ├── sync_shipments.py
│   ├── validate_products_json.py
│   └── README.md
├── tests/                 # Test suite
│   └── test_1.py
├── utils/                 # Utility functions
│   └── image_helpers.py
└── README.md             # This file
```

## 🗄️ Data Lake Architecture

### Data Layers

1. **Raw Layer** (`data/raw_manual/`)
   - Unprocessed source data
   - CSV exports, API responses, manual uploads
   - Preserved in original format for audit trails

2. **Processed Layer** (`data/`)
   - Cleaned and structured data
   - JSON format for easy consumption
   - Normalized schemas and consistent data types

3. **Analytics Layer** (downstream)
   - Aggregated metrics and KPIs
   - Business intelligence datasets
   - Located in separate analytics repository

### Data Sources

- **Shopify E-commerce Platform**
  - Product catalog and inventory
  - Customer data and orders
  - Shipment tracking information
- **Manual Data Imports**
  - CSV exports from various systems
  - Historical data migrations
  - Third-party integrations

## 🔧 Data Processing Pipeline

### ETL Workflows

1. **Data Ingestion**
   ```bash
   # Import raw data from Shopify
   python scripts/sync_products.py
   python scripts/sync_orders.py
   python scripts/sync_inventory.py
   python scripts/sync_shipments.py
   ```

2. **Data Transformation**
   ```bash
   # Convert CSV exports to structured JSON
   python scripts/convert_products_csv_to_json.py
   
   # Validate data quality
   python scripts/validate_products_json.py
   ```

3. **Asset Processing**
   ```bash
   # Process product images
   python scripts/resize_images.py
   python scripts/generate_thumbnails.py
   ```

### Data Quality & Validation

- **Schema Validation**: Ensures data conforms to expected structure
- **Type Checking**: Validates data types (strings, numbers, booleans)
- **Completeness Checks**: Identifies missing required fields
- **Consistency Validation**: Ensures referential integrity

## 📊 Current Datasets

### Products Dataset
- **66 products** from Minkowski Home catalog
- **304 variants** with pricing and inventory data
- **371 product images** with metadata
- **33 unique tags** for categorization
- **Price range**: $13.97 - $229.35

### Data Schema
```json
{
  "metadata": {
    "conversion_date": "2025-08-07T10:58:55.586986",
    "source_file": "products_export_05082025.csv",
    "total_products": 66,
    "total_variants": 304,
    "total_images": 371
  },
  "products": [
    {
      "handle": "product-handle",
      "title": "Product Title",
      "body_html": "Description",
      "vendor": "Minkowski Home",
      "product_category": "Category Path",
      "tags": ["tag1", "tag2"],
      "published": true,
      "status": "active",
      "variants": [...],
      "images": [...],
      "metafields": {...},
      "google_shopping": {...},
      "reviews": {...}
    }
  ]
}
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Access to Shopify API credentials
- Required Python packages (see requirements.txt)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd minkowski-infra
   ```

2. **Set up environment**
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Configure credentials**
   ```bash
   # Set up Shopify API credentials
   export SHOPIFY_API_KEY="your_api_key"
   export SHOPIFY_API_SECRET="your_api_secret"
   export SHOPIFY_STORE_URL="your_store_url"
   ```

### Quick Start

1. **Convert existing CSV data**
   ```bash
   python scripts/convert_products_csv_to_json.py
   ```

2. **Validate the data**
   ```bash
   python scripts/validate_products_json.py
   ```

3. **Process images**
   ```bash
   python scripts/resize_images.py
   ```

## 🔄 Data Synchronization

### Automated Sync Jobs

The infrastructure supports automated data synchronization with Shopify:

- **Products**: Daily sync of product catalog and inventory
- **Orders**: Real-time order processing and status updates
- **Customers**: Customer profile and purchase history sync
- **Shipments**: Tracking information and delivery status

### Manual Data Imports

For historical data or bulk imports:

1. Place CSV files in `data/raw_manual/`
2. Run appropriate conversion scripts
3. Validate data quality
4. Deploy to production data lake

## 📈 Analytics Integration

This data lake feeds into downstream analytics systems:

- **Business Intelligence**: PowerBI, Tableau dashboards
- **Customer Analytics**: Customer segmentation and behavior analysis
- **Inventory Analytics**: Stock optimization and demand forecasting
- **Sales Analytics**: Revenue tracking and performance metrics
- **Marketing Analytics**: Campaign performance and attribution

## 🛠️ Development

### Adding New Data Sources

1. **Create ingestion script**
   ```python
   # scripts/sync_new_source.py
   def sync_new_data():
       # Implement data extraction logic
       pass
   ```

2. **Add validation**
   ```python
   # scripts/validate_new_data.py
   def validate_new_data():
       # Implement data quality checks
       pass
   ```

3. **Update documentation**
   - Add to this README
   - Update data schema documentation
   - Document any new dependencies

### Testing

```bash
# Run test suite
python -m pytest tests/

# Run specific tests
python -m pytest tests/test_data_validation.py
```

## 🔒 Security & Compliance

### Data Protection

- **Encryption**: All data encrypted at rest and in transit
- **Access Control**: Role-based access to data and scripts
- **Audit Logging**: Complete audit trail of data modifications
- **Backup**: Regular automated backups of all data

### Compliance

- **GDPR**: Customer data handling compliance
- **PCI DSS**: Payment data security standards
- **Data Retention**: Configurable retention policies

## 📋 Monitoring & Alerting

### Data Quality Monitoring

- Automated validation checks on all data imports
- Alerting on data quality issues
- Performance monitoring of sync jobs
- Error tracking and resolution workflows

### Health Checks

```bash
# Check data lake health
python scripts/health_check.py

# Monitor sync job status
python scripts/monitor_syncs.py
```

## 🤝 Contributing

### Development Workflow

1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Code review and approval
6. Merge to main branch

### Code Standards

- Follow PEP 8 Python style guide
- Include docstrings for all functions
- Write unit tests for new functionality
- Update documentation for API changes

## 📞 Support

### Getting Help

- **Documentation**: Check script-specific README files
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact data team for urgent issues

### Common Issues

- **API Rate Limits**: Implement exponential backoff in sync scripts
- **Data Quality Issues**: Run validation scripts to identify problems
- **Performance**: Monitor script execution times and optimize as needed

## 📄 License

This project is proprietary to Minkowski Home. All rights reserved.

## 🔄 Version History

- **v1.0.0** (2025-08-07): Initial data lake setup with product data processing
- **v0.9.0**: CSV to JSON conversion pipeline
- **v0.8.0**: Basic Shopify integration scripts
- **v0.7.0**: Project structure and documentation

---

**Last Updated**: August 7, 2025  
**Maintainer**: Data Engineering Team  
**Status**: Not Production Ready

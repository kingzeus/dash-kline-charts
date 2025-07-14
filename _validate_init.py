#!/usr/bin/env python
"""
Validation script for dash-kline-charts package.
This script validates that the package is properly structured and can be imported.
"""

import sys
import os
import importlib.util
from pathlib import Path

def validate_package_structure():
    """Validate that the package has the required structure."""
    print("🔍 Validating package structure...")
    
    # Check if main package directory exists
    package_dir = Path("dash_kline_charts")
    if not package_dir.exists():
        print("❌ Package directory 'dash_kline_charts' not found")
        return False
    
    # Check required files
    required_files = [
        "dash_kline_charts/__init__.py",
        "dash_kline_charts/_version.py",
        "dash_kline_charts/DashKLineChart.py",
        "dash_kline_charts/metadata.json",
        "dash_kline_charts/package-info.json"
    ]
    
    for file_path in required_files:
        if not Path(file_path).exists():
            print(f"❌ Required file '{file_path}' not found")
            return False
    
    print("✅ Package structure is valid")
    return True

def validate_imports():
    """Validate that the package can be imported correctly."""
    print("🔍 Validating package imports...")
    
    try:
        # Add current directory to Python path
        sys.path.insert(0, os.getcwd())
        
        # Import the main package
        import dash_kline_charts
        print(f"✅ Successfully imported dash_kline_charts (version: {dash_kline_charts.__version__})")
        
        # Import the main component
        from dash_kline_charts import DashKLineChart
        print("✅ Successfully imported DashKLineChart component")
        
        # Check if component has required attributes
        instance = DashKLineChart()
        
        if not hasattr(instance, '_prop_names'):
            print("❌ DashKLineChart missing _prop_names")
            return False
        
        if not hasattr(instance, 'available_properties'):
            print("❌ DashKLineChart missing available_properties")
            return False
        
        # Check that expected properties are available
        expected_props = ['id', 'data', 'config', 'indicators', 'style', 'className', 'responsive', 'symbol']
        available_props = instance.available_properties
        
        missing_props = [prop for prop in expected_props if prop not in available_props]
        if missing_props:
            print(f"❌ DashKLineChart missing properties: {missing_props}")
            return False
        
        print("✅ Component validation passed")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Validation error: {e}")
        return False

def validate_built_assets():
    """Validate that JavaScript assets are built correctly."""
    print("🔍 Validating built assets...")
    
    # Check if JavaScript files exist
    js_files = [
        "dash_kline_charts/dash_kline_charts.min.js",
        "dash_kline_charts/klinecharts.min.js"
    ]
    
    for js_file in js_files:
        if not Path(js_file).exists():
            print(f"⚠️  JavaScript file '{js_file}' not found - run 'npm run build' first")
            return False
    
    print("✅ Built assets are present")
    return True

def validate_metadata():
    """Validate metadata files."""
    print("🔍 Validating metadata...")
    
    try:
        import json
        
        # Check metadata.json
        with open("dash_kline_charts/metadata.json", "r") as f:
            metadata = json.load(f)
            if "src/lib/components/DashKLineChart.react.js" not in str(metadata):
                print("⚠️  Metadata may be incomplete")
        
        # Check package-info.json
        with open("dash_kline_charts/package-info.json", "r") as f:
            package_info = json.load(f)
            if "name" not in package_info:
                print("⚠️  Package info may be incomplete")
        
        print("✅ Metadata validation passed")
        return True
        
    except Exception as e:
        print(f"❌ Metadata validation error: {e}")
        return False

def main():
    """Run all validation checks."""
    print("🚀 Starting dash-kline-charts validation...")
    print()
    
    checks = [
        validate_package_structure,
        validate_built_assets,
        validate_metadata,
        validate_imports
    ]
    
    all_passed = True
    for check in checks:
        if not check():
            all_passed = False
        print()
    
    if all_passed:
        print("🎉 All validation checks passed!")
        print("📦 Package is ready for publishing")
        sys.exit(0)
    else:
        print("❌ Some validation checks failed")
        print("🔧 Please fix the issues before publishing")
        sys.exit(1)

if __name__ == "__main__":
    main()
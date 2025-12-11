#!/bin/bash

echo "=========================================="
echo "Testing Flask Backend"
echo "=========================================="

# Test 1: Check if Flask is running
echo -e "\n1️⃣ Testing Flask health endpoint..."
curl -s http://localhost:5000/health | python3 -m json.tool || echo "❌ Flask is not running on port 5000"

# Test 2: Test prediction endpoint
echo -e "\n\n2️⃣ Testing prediction endpoint..."
curl -s -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '[{
    "hour_of_day": 17,
    "day_of_week": 2,
    "month": 6,
    "is_weekend": 0,
    "station_lat": 42.36,
    "station_lng": -71.06,
    "dist_subway_m": 100,
    "dist_bus_m": 50,
    "dist_university_m": 200,
    "dist_business": 300,
    "dist_residential": 400,
    "restaurant_count": 15
  }]' | python3 -m json.tool || echo "❌ Prediction endpoint failed"

echo -e "\n=========================================="
echo "✓ Tests complete"
echo "=========================================="

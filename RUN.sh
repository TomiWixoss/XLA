#!/bin/bash
# Quick run script for Linux/Mac
# Run: chmod +x RUN.sh && ./RUN.sh

echo "========================================"
echo "PyStegoWatermark Suite"
echo "========================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo ""
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo ""

# Install/update requirements
echo "Checking dependencies..."
pip install -r requirements.txt --quiet
echo ""

# Run the application
echo "Starting Streamlit application..."
echo ""
echo "The app will open in your browser at http://localhost:8501"
echo "Press Ctrl+C to stop the server"
echo ""
streamlit run app.py

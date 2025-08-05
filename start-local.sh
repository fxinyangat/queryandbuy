#!/bin/bash

echo "🚀 Starting Query and Buy locally..."

# Function to check if a port is in use
check_port() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Check if backend is running
if check_port 8000; then
    echo "✅ Backend is already running on port 8000"
else
    echo "🔧 Starting backend..."
    cd backend
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    cd ..
    echo "✅ Backend started with PID: $BACKEND_PID"
fi

# Wait a moment for backend to start
sleep 3

# Check if frontend is running
if check_port 3000; then
    echo "✅ Frontend is already running on port 3000"
else
    echo "🔧 Starting frontend..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    echo "✅ Frontend started with PID: $FRONTEND_PID"
fi

echo ""
echo "🌐 Your app should be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo ""
echo "📝 To switch between local and production:"
echo "   Edit frontend/src/config.js"
echo "   Change USE_LOCAL_BACKEND = true/false"
echo ""
echo "🛑 To stop: Ctrl+C or kill the processes" 
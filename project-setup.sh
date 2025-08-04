mkdir qnb
cd qnb

# Backend structure
mkdir backend
cd backend
mkdir services api models utils tests
touch requirements.txt

# Frontend structure
cd ..
npx create-react-app frontend
cd frontend
npm install @material-ui/core @material-ui/icons axios 
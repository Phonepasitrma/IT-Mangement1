@echo off
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install

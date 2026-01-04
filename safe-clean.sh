#!/bin/bash
read -p "Remove lockfiles? (y/n): " lock
if [[ $lock == "y" ]]; then
    rm -f yarn.lock pnpm-lock.yaml
fi

read -p "Remove node_modules? (y/n): " nm
if [[ $nm == "y" ]]; then
    rm -rf node_modules
fi

npm install
echo "Cleanup completed!"

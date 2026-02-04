// Legacy seed script - now redirects to seed-all API
// For the full multi-table seed, use: GET /api/seed-all
// Or run: curl http://localhost:3000/api/seed-all

console.log("⚠️  This standalone seed script is deprecated.");
console.log("The database now uses a multi-table schema.");
console.log("");
console.log("To seed the database, start the dev server and visit:");
console.log("  http://localhost:3000/api/seed-all");
console.log("");
console.log("Or run:");
console.log("  curl http://localhost:3000/api/seed-all");

process.exit(0);

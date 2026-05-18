SELECT id, name, email, verified, "verificationStatus", "emailVerified", role, "createdAt" FROM "User" WHERE name LIKE '%TechStore%' OR name LIKE '%techstore%' LIMIT 5;

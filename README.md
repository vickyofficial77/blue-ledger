# BlueLedger dashboards (Admin + Worker)

## What you get in this zip
- `WorkerDashboard.tsx` — workers can view stock and record sales (transactional)
- `AdminDashboard.tsx` — admin can add/edit/delete products, create worker accounts, and see inventory + sales metrics
- `firestore.rules` — rules that enforce:
  - Admin: full control on products + users + sales read
  - Worker: can only decrement qty and create sale records

## Required collections
- `users/{uid}`
  - { uid, name, email, role: 'admin'|'worker', companyName, createdAt }
- `products/{id}`
  - { name, category, price, qty, status: 'available'|'sold', createdAt, createdBy, updatedAt }
- `sales/{id}`
  - { productId, productName, unitsSold, soldByUid, soldByName, soldByEmail, soldAt }

## Notes
- The worker sale action uses a Firestore Transaction to prevent overselling.
- Worker cannot change product name/price/category due to security rules.
- Creating worker accounts from the client is OK for demos; for production use a Cloud Function (Admin SDK).

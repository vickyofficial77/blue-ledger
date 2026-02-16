import firebase from 'firebase/compat/app';


export type FirestoreTimestamp =
  | firebase.firestore.Timestamp
  | firebase.firestore.FieldValue
  | null;


export enum UserRole {
  ADMIN = 'admin',
  WORKER = 'worker',
}


export enum ProductStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
}


export interface UserProfile {
  readonly uid: string;

  name: string;
  email: string;
  companyName?: string;

  role: UserRole;


  createdAt: FirestoreTimestamp;
}


export interface Product {
  readonly id: string;

  name: string;
  category?: string;

  price: number;
  qty: number;

  status: ProductStatus;

 
  createdBy: string;

  createdAt: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}


export interface Sale {
  readonly id: string;

  productId: string;
  productName: string;

  
  unitPrice: number;

 
  unitsSold: number;

  soldByUid: string;
  soldByName: string;
  soldByEmail: string;

  soldAt: FirestoreTimestamp;
}

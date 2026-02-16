import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


const baseConfig = {
  apiKey: 'AIzaSyALw1rdi7WIzEbdAkh8QX--59MX5m-5NRw',
  authDomain: 'blueledger-95132.firebaseapp.com',
  projectId: 'blueledger-95132',
  storageBucket: 'blueledger-95132.firebasestorage.app',
  messagingSenderId: '375881764278',
  appId: '1:375881764278:web:b2774676702abece900517',
  measurementId: 'G-8Y6T8HQMYE',
};


const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || baseConfig.apiKey,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || baseConfig.authDomain,
  projectId: process.env.FIREBASE_PROJECT_ID || baseConfig.projectId,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || baseConfig.storageBucket,
  messagingSenderId:
    process.env.FIREBASE_MESSAGING_SENDER_ID || baseConfig.messagingSenderId,
  appId: process.env.FIREBASE_APP_ID || baseConfig.appId,
};


const firebaseApp = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();


const auth = firebaseApp.auth();
const db = firebaseApp.firestore();


auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((err) => {
  console.warn('Auth persistence error:', err);
});


db.enablePersistence({ synchronizeTabs: true }).catch((err) => {

  console.warn('Firestore persistence not enabled:', err?.code || err);
});


export { auth, db, firebaseApp };
export default firebaseApp;

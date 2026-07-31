import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Config del proyecto PlanEats. Esta es la configuración pública de cliente
// web de Firebase (no es un secreto — está diseñada para viajar con el
// bundle del navegador), así que es seguro tenerla en el repo.
const firebaseConfig = {
  apiKey: 'AIzaSyA6s1oPBe61SJJH3vw-lWh7Yj6bV8Vf7Jg',
  authDomain: 'planeats-f2474.firebaseapp.com',
  projectId: 'planeats-f2474',
  storageBucket: 'planeats-f2474.firebasestorage.app',
  messagingSenderId: '450864219327',
  appId: '1:450864219327:web:56e06637f9f355811e720a',
};

const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);

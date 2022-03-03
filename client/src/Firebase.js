import { initializeApp } from 'firebase/app';
import { getDatabase, ref, child, get } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyC-TFXnFQGu5oAQYOrWWHlG5esXDNXxgik",
    authDomain: "compostomatic.firebaseapp.com",
    databaseURL: "https://compostomatic-default-rtdb.firebaseio.com",
    projectId: "compostomatic",
    storageBucket: "compostomatic.appspot.com",
    messagingSenderId: "802729844828",
    appId: "1:802729844828:web:f61e00185bbc5c65188699",
    measurementId: "G-0H3836JC9D"
};

const app = initializeApp(firebaseConfig);

/*
Fetches all data stored in Firebase realtime database
 */
export async function fetchData() {
    const dbRef = ref(getDatabase(app));
    const snapshot = await get(child(dbRef, `update/data`));
    var all_data = [];
    if (snapshot.exists()) {
        all_data = Object.values(snapshot.val());
        return all_data;
    } else {
        alert("No data available");
        return null;
    }
}
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, child, get } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyC-TFXnFQGu5oAQYOrWWHlG5esXDNXxgik",
    authDomain: "compostomatic.firebaseapp.com",
    databaseURL: "https://compostomatic-default-rtdb.firebaseio.com",
    storageBucket: "compostomatic.appspot.com"
};

const app = initializeApp(firebaseConfig);

// Get a reference to the database service
const database = getDatabase(app);

/*
Fetches data for user-selected timescale
Params: Array of desired timestamps
 */
export function fetchData(timestamps) {
    var data = [];
    const dbRef = ref(getDatabase(app));
    for (var i = 0; i < timestamps.length; i++) {
        get(child(dbRef, `${timestamps[i]}`)).then((snapshot) => {
            if (snapshot.exists()) {
                console.log(snapshot.val());
                data.push(snapshot.val());
            } else {
                console.log("No data available");
                data.push(null);
            }
        }).catch((error) => {
            console.error(error);
        });
    }
    return data;
}
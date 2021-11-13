import * as firebase from 'firebase';
import firestore from 'firebase/firestore'

const settings = {timestampsInSnapshots: true};

const config = {
    apiKey: "AIzaSyC-TFXnFQGu5oAQYOrWWHlG5esXDNXxgik",
    authDomain: "compostomatic.firebaseapp.com",
    projectId: "compostomatic",
    storageBucket: "compostomatic.appspot.com",
    messagingSenderId: "802729844828",
    appId: "1:802729844828:web:f61e00185bbc5c65188699",
    measurementId: "G-0H3836JC9D"
};
firebase.initializeApp(config);

firebase.firestore().settings(settings);

export default firebase;
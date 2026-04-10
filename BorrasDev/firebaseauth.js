// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {getAuth, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

const firebaseConfig = {
//YOUR COPIED FIREBASE PART SHOULD BE HERE
    apiKey: "AIzaSyCQACU0PkmHq6pJft6r1gQT2uWA-GRt-6o",
    authDomain: "login-homepage-borras.firebaseapp.com",
    projectId: "login-homepage-borras",
    storageBucket: "login-homepage-borras.firebasestorage.app",
    messagingSenderId: "659438321624",
    appId: "1:659438321624:web:166b35cd8ecb8d1f41fcad"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Loading Animation Functions
function showLoading() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    loadingOverlay.classList.remove('active');
}

function showMessage(message, divId){
    var messageDiv=document.getElementById(divId);
    if (!messageDiv) return;
    messageDiv.style.display="block";
    messageDiv.innerHTML=message;
    messageDiv.style.opacity=1;
    setTimeout(function(){
        messageDiv.style.opacity=0;
    },5000);
}
const signIn=document.getElementById('submitSignIn');
if (signIn) {
signIn.addEventListener('click', (event)=>{
    event.preventDefault();
    const email=document.getElementById('email').value;
    const password=document.getElementById('password').value;
    const auth=getAuth();

    showLoading();

    signInWithEmailAndPassword(auth, email,password)
    .then((userCredential)=>{
        showMessage('Login successful', 'signInMessage');
        const user=userCredential.user;
        localStorage.setItem('loggedInUserId', user.uid);
        
        setTimeout(() => {
            hideLoading();
            window.location.href='homepage.html';
        }, 2000);
    })
    .catch((error)=>{
        hideLoading();
        const errorCode=error.code;
        if(errorCode==='auth/invalid-credential'){
            showMessage('Incorrect Email or Password', 'signInMessage');
        }
        else{
            showMessage('Account does not Exist', 'signInMessage');
        }
    })
})
}
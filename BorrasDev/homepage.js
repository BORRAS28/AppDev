import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import{getFirestore, getDoc, doc} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js"

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

  const auth=getAuth();
  const db=getFirestore();

  onAuthStateChanged(auth, (user)=>{
    const loggedInUserId=localStorage.getItem('loggedInUserId');
    const userRole=localStorage.getItem('userRole') || 'student';
    
    // Display user role badge
    const roleBadge = document.getElementById('userRoleBadge');
    if (roleBadge) {
        roleBadge.innerText = userRole.charAt(0).toUpperCase() + userRole.slice(1);
        roleBadge.className = `user-role ${userRole}`;
    }
    
    // Show faculty controls if user is faculty
    if (userRole === 'faculty') {
        // Wait for DOM to be ready, then show buttons and add listeners
        setTimeout(() => {
            console.log('Faculty user detected, enabling controls...');
            
            // Add faculty-view class to body to show faculty controls
            document.body.classList.add('faculty-view');
            console.log('faculty-view class added to body');
            
            // Directly show all faculty-only buttons
            const facultyOnly = document.querySelectorAll('.faculty-only');
            console.log('Found ' + facultyOnly.length + ' faculty-only elements');
            facultyOnly.forEach(el => {
                el.style.display = 'inline-block';
            });
            
            // Add event listeners to PC status dropdowns
            const statusDropdowns = document.querySelectorAll('.pc-status-dropdown');
            console.log('Found ' + statusDropdowns.length + ' status dropdowns');
            statusDropdowns.forEach(dropdown => {
                dropdown.addEventListener('change', function(e) {
                    const pc = this.getAttribute('data-pc');
                    const newStatus = this.value;
                    console.log('Status dropdown changed for ' + pc + ' -> ' + newStatus);
                    updatePCStatusWithStats(pc, newStatus);
                });
            });

            // Add event listeners to peripheral buttons
            const peripheralBtns = document.querySelectorAll('.peripheral-btn');
            console.log('Found ' + peripheralBtns.length + ' peripheral buttons');
            peripheralBtns.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const pc = this.getAttribute('data-pc');
                    const peripheral = this.getAttribute('data-peripheral');
                    const currentStatus = this.getAttribute('data-status');
                    console.log('Peripheral button clicked for ' + pc + ' ' + peripheral + ' (current: ' + currentStatus + ')');
                    updatePeripheralStatusWithStats(pc, peripheral);
                });
            });
            
            // Add click listeners to status elements for editing
            const statusElements = document.querySelectorAll('.pc-status');
            statusElements.forEach(el => {
                el.style.cursor = 'pointer';
                el.addEventListener('click', function() {
                    const pc = this.previousElementSibling.innerText;
                    const currentStatus = this.innerText.toLowerCase();
                    const newStatus = currentStatus === 'working' ? 'broken' : 'working';
                    updatePCStatusWithStats(pc, newStatus);
                });
            });
            
            // Update dropdowns and peripheral buttons to match current states
            updateAllDropdowns();
            
            // Update stats on initial load - removed since no stats displayed
        }, 500);
    } else {
        // Also update stats for non-faculty users
        setTimeout(() => {
            updateStats('mac');
            updateStats('pc');
        }, 500);
    }
    
    if(loggedInUserId){
        console.log(user);
        const docRef = doc(db, "users", loggedInUserId);
        getDoc(docRef)
        .then((docSnap)=>{
            if(docSnap.exists()){
                const userData=docSnap.data();
                const firstNameEl = document.getElementById('loggedUserFName');
                if (firstNameEl) {
                    firstNameEl.innerText = userData.firstName || '';
                }

            }
            else{
                console.log("no document found matching id")
            }
        })
        .catch((error)=>{
            console.log("Error getting document");
        })
    }
    else{
        console.log("User Id not Found in Local storage")
    }
  })

  // Function to update statistics
  function updateStats(labType) {
    console.log('Updating stats for: ' + labType);
    
    const prefix = labType === 'mac' ? 'mac' : 'pc';
    const pcCards = document.querySelectorAll('#' + (labType === 'mac' ? 'macList' : 'pcList') + ' .pc-card');
    
    let totalCount = 0;
    let workingCount = 0;
    let brokenCount = 0;
    let keyboardCount = 0;
    let mouseCount = 0;
    
    pcCards.forEach(card => {
        totalCount++;

        // Check status from dropdown
        const dropdown = card.querySelector('.pc-status-dropdown');
        if (dropdown) {
            const status = dropdown.value;
            if (status === 'working') {
                workingCount++;
            } else if (status === 'broken') {
                brokenCount++;
            }
        }

        // Check peripherals
        const peripheralBtns = card.querySelectorAll('.peripheral-btn');
        peripheralBtns.forEach(btn => {
            const peripheral = btn.getAttribute('data-peripheral');
            const status = btn.getAttribute('data-status');

            if (peripheral === 'keyboard' && status === 'working') {
                keyboardCount++;
            } else if (peripheral === 'mouse' && status === 'working') {
                mouseCount++;
            }
        });
    });
    
    // Update the stats display
    updateStatsDisplay(labType, totalCount, workingCount, brokenCount);
  }

  // Function to update stats display
  function updateStatsDisplay(labType, total, working, broken) {
    const prefix = labType === 'mac' ? 'mac' : 'pc';

    const totalEl = document.getElementById(prefix + 'Total');
    const workingEl = document.getElementById(prefix + 'Working');
    const brokenEl = document.getElementById(prefix + 'Broken');

    if (totalEl) totalEl.textContent = total;
    if (workingEl) workingEl.textContent = working;
    if (brokenEl) brokenEl.textContent = broken;
  }

  // Function to update PC status
  function updatePCStatus(pc, newStatus) {
    // Find the PC card and update its dropdown
    const pcCards = document.querySelectorAll('.pc-card');
    pcCards.forEach(card => {
        const pcName = card.querySelector('h4').innerText;
        if (pcName === pc) {
            const dropdown = card.querySelector('.pc-status-dropdown');
            if (dropdown) {
                dropdown.value = newStatus;
            }
        }
    });
  }

  // Function to update PC status and refresh stats
  function updatePCStatusWithStats(pc, newStatus) {
    updatePCStatus(pc, newStatus);
    // Update stats for both labs after a short delay
    setTimeout(() => {
        updateStats('mac');
        updateStats('pc');
    }, 100);
  }

  // Function to update all dropdowns and peripheral buttons to match current states
  function updateAllDropdowns() {
    // Set all dropdowns to working by default
    const statusDropdowns = document.querySelectorAll('.pc-status-dropdown');
    statusDropdowns.forEach(dropdown => {
        dropdown.value = 'working';
    });

    // Set all peripheral buttons to working by default
    const peripheralBtns = document.querySelectorAll('.peripheral-btn');
    peripheralBtns.forEach(btn => {
        btn.setAttribute('data-status', 'working');
        btn.textContent = 'Working';
        btn.className = 'peripheral-btn working';
    });
  }

  // Function to update peripheral status and refresh stats
  function updatePeripheralStatusWithStats(pc, peripheral) {
    updatePeripheralStatus(pc, peripheral);
    // Determine which lab the PC is in and update stats
    const labType = pc.startsWith('MAC') ? 'mac' : 'pc';
    setTimeout(() => {
        updateStats(labType);
    }, 100);
  }

  function updatePeripheralStatus(pc, peripheral) {
    console.log('updatePeripheralStatus called with pc=' + pc + ', peripheral=' + peripheral);

    // Find the PC card and update the peripheral status
    const pcCards = document.querySelectorAll('.pc-card');
    console.log('Total pc-cards found: ' + pcCards.length);

    pcCards.forEach(card => {
        const pcName = card.querySelector('h4').innerText;
        console.log('Checking card with name: ' + pcName);

        if (pcName === pc) {
            console.log('Found matching card for: ' + pc);

            const peripheralBtns = card.querySelectorAll('.peripheral-btn');
            console.log('Found ' + peripheralBtns.length + ' peripheral buttons in this card');

            peripheralBtns.forEach(btn => {
                const btnPeripheral = btn.getAttribute('data-peripheral');
                console.log('Checking peripheral: ' + btnPeripheral);

                if (btnPeripheral === peripheral) {
                    console.log('Found matching peripheral: ' + peripheral);

                    const currentStatus = btn.getAttribute('data-status');
                    let newStatus;

                    // Cycle through: working -> broken -> missing -> working
                    switch (currentStatus) {
                        case 'working':
                            newStatus = 'broken';
                            break;
                        case 'broken':
                            newStatus = 'missing';
                            break;
                        case 'missing':
                            newStatus = 'working';
                            break;
                        default:
                            newStatus = 'working';
                    }

                    console.log('Cycling from ' + currentStatus + ' to ' + newStatus);

                    // Update button attributes and appearance
                    btn.setAttribute('data-status', newStatus);
                    btn.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
                    btn.className = 'peripheral-btn ' + newStatus;

                    console.log('Peripheral updated successfully!');
                }
            });
        }
    });
  }

  // Logout controls were removed from homepage UI.
        
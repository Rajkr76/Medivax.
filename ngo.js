let patients = JSON.parse(localStorage.getItem('patients')) || [
    {
        id: 1,
        name: "Mukesh Kumar",
        address: "B.V.T Hospital, Bhopal",
        disease: "Lung Cancer",
        donationRequired: 250000,
        donationAmount: 0,
        image: "https://www.libdems.org.uk/fileadmin/_processed_/d/5/csm_bald-mature-man-smiling-cancer-hospital-bed_6588f36fb7.jpg"
    },
    {
        id: 2,
        name: "vinayak Sharma",
        address: "D.H.T Hospital, Delhi",
        disease: "Leukemia",
        donationRequired: 350000,
        donationAmount: 0,
        image: "https://plus.unsplash.com/premium_photo-1664478214797-c3c932160cef?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cGF0aWVudCUyMGlhbWdlc3xlbnwwfHwwfHx8MA%3D%3D"
    },
    {
        id: 3,
        name: "Ravi Singh",
        address: "M.V.T Center, Mumbai",
        disease: "Heart Failure",
        donationRequired: 200000,
        donationAmount: 0,
        image: "https://plus.unsplash.com/premium_photo-1723874470794-140de12e747b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHBhdGllbnQlMjBpYW1nZXN8ZW58MHx8MHx8fDA%3D"
    }
];

// Function to save patients data to localStorage
function savePatients() {
    try {
        localStorage.setItem('patients', JSON.stringify(patients));
    } catch (error) {
        console.error("Error saving to localStorage:", error);
    }
}

// Function to reset localStorage on first deployment
function checkAndInitializeStorage() {
    try {
        // Check if this is the first time loading after deployment
        if (!localStorage.getItem('initialized')) {
            // Clear any existing patients data
            localStorage.removeItem('patients');
            // Set the initialized flag
            localStorage.setItem('initialized', 'true');
            // Save the initial patients data
            savePatients();
        }
    } catch (error) {
        console.error("Error initializing localStorage:", error);
    }
}

// DOM elements
const patientGrid = document.getElementById('patientGrid');
const modalOverlay = document.getElementById('modalOverlay');
const donationModal = document.getElementById('donationModal');
const thankYouModal = document.getElementById('thankYouModal');
const patientNameInput = document.getElementById('patientName');
const patientAddressInput = document.getElementById('patientAddress');
const donorNameInput = document.getElementById('donorName');
const donorAddressInput = document.getElementById('donorAddress');
const donorPhoneInput = document.getElementById('donorPhone');
const donorEmailInput = document.getElementById('donorEmail');
const donationAmountInput = document.getElementById('donationAmount');
const makePaymentBtn = document.getElementById('makePaymentBtn');
const thankYouMessage = document.getElementById('thankYouMessage');
const closeThankYouBtn = document.getElementById('closeThankYouBtn');

// Error message elements
const donorNameError = document.getElementById('donorNameError');
const donorAddressError = document.getElementById('donorAddressError');
const donorPhoneError = document.getElementById('donorPhoneError');
const donorEmailError = document.getElementById('donorEmailError');
const donationAmountError = document.getElementById('donationAmountError');

// Current selected patient
let selectedPatientId = null;

// Function to handle image loading errors
function handleImageError(img) {
    img.onerror = null; // Prevent infinite loop
    img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect fill="%23f0f0f0" width="300" height="200"/><text fill="%23999999" font-family="Arial" font-size="14" x="50%" y="50%" text-anchor="middle">Image not available</text></svg>';
}

// Render patient cards
function renderPatients() {
    if (!patientGrid) {
        console.error("Patient grid element not found!");
        return;
    }
    
    patientGrid.innerHTML = '';
    
    patients.forEach(patient => {
        try {
            // Calculate progress percentage
            const progressPercentage = Math.min(100, (patient.donationAmount / patient.donationRequired) * 100);
            
            const patientCard = document.createElement('div');
            patientCard.className = 'patient-card';
            patientCard.innerHTML = `
                <img src="${patient.image}" alt="${patient.name}" class="patient-image" onerror="handleImageError(this)">
                <div class="card-header">
                    <h2 class="card-title">${patient.name}</h2>
                </div>
                <div class="card-content">
                    <div><span class="label">Address:</span> ${patient.address}</div>
                    <div><span class="label">Condition:</span> ${patient.disease}</div>
                    <div><span class="label">Required Amount:</span> ₹ ${patient.donationRequired.toLocaleString()}</div>
                    <div><span class="label">Total Donations:</span> ₹ ${patient.donationAmount.toLocaleString()}</div>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                    </div>
                    <div class="progress-text">${progressPercentage.toFixed(1)}% of goal</div>
                </div>
                <div class="card-footer">
                    <button class="btn donate-btn" data-id="${patient.id}">Donate Now</button>
                </div>
            `;
            
            patientGrid.appendChild(patientCard);
        } catch (error) {
            console.error("Error rendering patient card:", error);
        }
    });

    // Add event listeners to donate buttons
    document.querySelectorAll('.donate-btn').forEach(button => {
        button.addEventListener('click', handleDonateClick);
    });
}

// Function to show an error for a form field
function showError(input, errorElement, message) {
    input.classList.add('error-field');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    return false;
}

// Function to clear error for a form field
function clearError(input, errorElement) {
    input.classList.remove('error-field');
    errorElement.style.display = 'none';
}

// Reset all form errors
function resetFormErrors() {
    clearError(donorNameInput, donorNameError);
    clearError(donorAddressInput, donorAddressError);
    clearError(donorPhoneInput, donorPhoneError);
    clearError(donorEmailInput, donorEmailError);
    clearError(donationAmountInput, donationAmountError);
}

// Handle donate button click
function handleDonateClick(event) {
    const patientId = parseInt(event.target.getAttribute('data-id'));
    const patient = patients.find(p => p.id === patientId);
    
    if (patient) {
        selectedPatientId = patient.id;
        patientNameInput.value = patient.name;
        patientAddressInput.value = patient.address;
        
        // Reset donor form fields
        donorNameInput.value = '';
        donorAddressInput.value = '';
        donorPhoneInput.value = '';
        donorEmailInput.value = '';
        donationAmountInput.value = '';
        
        // Reset form errors
        resetFormErrors();
        
        // Show donation modal
        modalOverlay.style.display = 'flex';
        donationModal.style.display = 'block';
        thankYouModal.style.display = 'none';
    }
}

// Validate form
function validateForm() {
    let isValid = true;
    resetFormErrors();
    
    // Validate name
    if (!donorNameInput.value.trim()) {
        isValid = showError(donorNameInput, donorNameError, 'Please enter your name');
    }
    
    // Validate address
    if (!donorAddressInput.value.trim()) {
        isValid = showError(donorAddressInput, donorAddressError, 'Please enter your address');
    }
    
    // Validate phone
    const phoneRegex = /^\d{10}$/;
    if (!donorPhoneInput.value.trim() || !phoneRegex.test(donorPhoneInput.value.trim())) {
        isValid = showError(donorPhoneInput, donorPhoneError, 'Please enter a valid 10-digit phone number');
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!donorEmailInput.value.trim() || !emailRegex.test(donorEmailInput.value.trim())) {
        isValid = showError(donorEmailInput, donorEmailError, 'Please enter a valid email address');
    }
    
    // Validate amount
    const amount = parseFloat(donationAmountInput.value);
    if (isNaN(amount) || amount <= 0) {
        isValid = showError(donationAmountInput, donationAmountError, 'Please enter a valid donation amount');
    }
    
    return isValid;
}

// Handle make payment button click
function handleMakePayment() {
    if (!validateForm()) {
        return;
    }
    
    try {
        const amount = parseFloat(donationAmountInput.value);
        const patient = patients.find(p => p.id === selectedPatientId);
        
        if (patient) {
            // Update patient donation amount
            patients = patients.map(p => {
                if (p.id === selectedPatientId) {
                    return {
                        ...p,
                        donationAmount: p.donationAmount + amount
                    };
                }
                return p;
            });
            
            // Save updated patients data to localStorage
            savePatients();
            
            // Generate a random number for transaction ID
            const transactionId = Math.floor(Math.random() * (99999999999 - 100000 + 1)) + 100000;
            
            // Show thank you message
            thankYouMessage.textContent = `Thank you for donating ₹ ${amount.toLocaleString()} to ${patient.name}. Your generosity will help with their medical treatment.
            Transaction ID: ${transactionId}`;
            
            // Switch to thank you modal
            donationModal.style.display = 'none';
            thankYouModal.style.display = 'block';
            
            // Re-render patients
            renderPatients();
        }
    } catch (error) {
        console.error("Error processing payment:", error);
        alert("There was an error processing your donation. Please try again.");
    }
}

// Close the modal
function closeModal() {
    modalOverlay.style.display = 'none';
    selectedPatientId = null;
}

// Function to handle image loading errors - globally accessible
window.handleImageError = function(img) {
    img.onerror = null;
    img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect fill="%23f0f0f0" width="300" height="200"/><text fill="%23999999" font-family="Arial" font-size="14" x="50%" y="50%" text-anchor="middle">Image not available</text></svg>';
};

// Event listeners
if (makePaymentBtn) {
    makePaymentBtn.addEventListener('click', handleMakePayment);
}

if (closeThankYouBtn) {
    closeThankYouBtn.addEventListener('click', closeModal);
}

// Close modal when clicking outside
if (modalOverlay) {
    modalOverlay.addEventListener('click', function(event) {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });
}

// Add input event listeners for realtime validation
donorNameInput.addEventListener('input', () => clearError(donorNameInput, donorNameError));
donorAddressInput.addEventListener('input', () => clearError(donorAddressInput, donorAddressError));
donorPhoneInput.addEventListener('input', () => clearError(donorPhoneInput, donorPhoneError));
donorEmailInput.addEventListener('input', () => clearError(donorEmailInput, donorEmailError));
donationAmountInput.addEventListener('input', () => clearError(donationAmountInput, donationAmountError));

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Check if we need to initialize storage (first deployment)
        checkAndInitializeStorage();
        // Render the patients
        renderPatients();
    } catch (error) {
        console.error("Error during initialization:", error);
        alert("There was an error loading the application. Please refresh the page.");
    }
});

// For browsers that don't fire DOMContentLoaded correctly
if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(function() {
        try {
            checkAndInitializeStorage();
            renderPatients();
        } catch (error) {
            console.error("Error during delayed initialization:", error);
        }
    }, 1);
}
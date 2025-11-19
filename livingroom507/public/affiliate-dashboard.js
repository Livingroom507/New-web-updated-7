document.addEventListener('DOMContentLoaded', () => {
    // In a real app, user email would come from an authentication context
    const currentUserEmail = 'roblq123@gmail.com'; 

    const profileForm = document.getElementById('profile-update-form');

    /**
     * Fetches profile data from the API and populates the dashboard.
     */
    async function loadProfileData() {
        if (!currentUserEmail) return;

       try {
            const profileData = await (await fetch(`/api/affiliate/profile?email=${currentUserEmail}`)).json();
            
            // ----------------------------------------------------
            // 1. UPDATE CORE PROFILE FIELDS (including new fields)
            // ----------------------------------------------------
            document.getElementById('full-name').value = profileData.fullName || '';
            document.getElementById('profile-email').textContent = profileData.email || 'N/A';
            document.getElementById('paypal-email').value = profileData.paypalEmail || '';

            // NEW: Load Advocate Profile Data
            document.getElementById('advocate-avatar').src = profileData.profilePictureUrl || '/default-avatar.png';
            document.getElementById('public-bio').value = profileData.publicBio || ''; // For the form textarea
            document.getElementById('advocate-bio-display').textContent = profileData.publicBio || 'No public bio set.'; // For the public display

            // ----------------------------------------------------
            // 2. FINANCIAL MECHANICS (Custom Commission Logic)
            // ----------------------------------------------------
            const purchaseUnit = profileData.purchase_unit || 0; // e.g., 70.53
            const purchaseEarning = profileData.purchase_earning || 0; // e.g., 152.16

            // Calculate the number of purchase units in the $89.95 example
            const exampleSalePrice = 89.95; 
            let unitsPerExampleSale = 0;
            let commissionPerExampleSale = 0;
            if (purchaseUnit > 0) {
                unitsPerExampleSale = (exampleSalePrice / purchaseUnit);
                commissionPerExampleSale = unitsPerExampleSale * purchaseEarning;
            }
            
            // Dynamic Commission Explanation (e.g., "$14.61 per each purchase of $89.95")
            const commissionLogicElement = document.getElementById('commission-logic');
            if (purchaseUnit > 0 && purchaseEarning > 0) {
                commissionLogicElement.innerHTML = `
                    Your commission is calculated based on <strong>Purchase Units</strong> within a sale.<br>
                    For your <strong>${profileData.currentPlanName}</strong> plan, each Purchase Unit is <strong>$${purchaseUnit.toFixed(2)}</strong> and earns you <strong>$${purchaseEarning.toFixed(2)}</strong> commission.<br>
                    If a customer purchases an item valued at <strong>$${exampleSalePrice.toFixed(2)}</strong>, you earn <strong>$${commissionPerExampleSale.toFixed(2)}</strong> in commission.
                `;
            } else {
                commissionLogicElement.textContent = 'Financial metrics for this plan are not yet defined.';
            }


        } catch (error) {
            console.error('Error loading profile data:', error);
            alert('Could not load your profile data.');
        }
    }

    /**
     * Handles the submission of the profile update form.
     */
    async function updateProfile(event) {
        event.preventDefault();
        const saveButton = document.getElementById('save-changes-button');
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';

        // Collect all fields from the form
        const fullName = document.getElementById('full-name').value;
        const email = document.getElementById('profile-email').textContent; // Get email from display
        const paypalEmail = document.getElementById('paypal-email').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;
        const publicBio = document.getElementById('public-bio').value; // NEW: Get the public bio value

        if (newPassword !== confirmPassword) {
            alert("New password and confirmation do not match.");
            saveButton.disabled = false;
            saveButton.textContent = 'Save Changes';
            return;
        }

        try {
            const response = await fetch('/api/affiliate/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName,
                    email, // Required for WHERE clause in Worker
                    paypalEmail,
                    publicBio, // NEW: Include in the payload
                    newPassword // Only used if a password change is intended
                }),
            });

            const result = await response.json();
            
            if (response.ok) {
                alert('Profile updated successfully!');
                // Reload the profile to ensure the display shows the updated values
                await loadProfileData();
            } else {
                alert(`Error updating profile: ${result.message || result.error}`);
            }

        } catch (error) {
            console.error('Update profile failed:', error);
            alert('An unexpected error occurred during profile update.');
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Save Changes';
        }
    }

    // Attach event listener to the form
    if (profileForm) {
        profileForm.addEventListener('submit', updateProfile);
    }

    // Initial data load
    loadProfileData();
    // You would also call a function here to load earnings data
    // loadEarningsData(currentUserEmail); 
});
document.addEventListener('DOMContentLoaded', () => {
    // In a real app, user email would come from an authentication context
    const currentUserEmail = 'roblq123@gmail.com';
    const avatarUploadInput = document.getElementById('avatar-upload');

    const userProfileToggle = document.getElementById('user-profile-toggle');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const profileForm = document.getElementById('profile-update-form');

    /**
     * Fetches profile data from the API and populates the dashboard.
     */
    async function loadProfileData() {
        if (!currentUserEmail) return;

       try {
            const response = await fetch(`/api/affiliate/profile?email=${currentUserEmail}`);
            if (!response.ok) {
                // Handle API errors gracefully (like the 500 error)
                throw new Error(`Network response was not ok: ${response.statusText} (Status: ${response.status})`);
            }
            const profileData = await response.json();

            // ----------------------------------------------------
            // 1. UPDATE CORE PROFILE FIELDS (including new fields)
            // ----------------------------------------------------
            const fullNameEl = document.getElementById('full-name');
            const profileEmailEl = document.getElementById('profile-email');
            const paypalEmailEl = document.getElementById('paypal-email');
            const advocateAvatarEl = document.getElementById('advocate-avatar');
            const publicBioEl = document.getElementById('public-bio');
            const advocateBioDisplayEl = document.getElementById('advocate-bio-display');
            const navUserNameEl = document.getElementById('nav-user-name');
            const navAvatarEl = document.getElementById('nav-avatar');

            if (fullNameEl) fullNameEl.value = profileData.fullName || '';
            if (profileEmailEl) profileEmailEl.textContent = profileData.email || 'N/A';
            if (paypalEmailEl) paypalEmailEl.value = profileData.paypalEmail || '';
            if (publicBioEl) publicBioEl.value = profileData.publicBio || '';
            if (advocateBioDisplayEl) advocateBioDisplayEl.textContent = profileData.publicBio || 'No public bio set.';

            // Update avatar images (both in settings and top nav)
            const avatarUrl = profileData.profilePictureUrl || '/default-avatar.png';
            if (advocateAvatarEl) advocateAvatarEl.src = avatarUrl;
            if (navAvatarEl) navAvatarEl.src = avatarUrl;

            // Update user name in top nav
            if (navUserNameEl) navUserNameEl.textContent = profileData.fullName || 'User';

            // ----------------------------------------------------
            // 2. FINANCIAL MECHANICS (Custom Commission Logic)
            // ----------------------------------------------------
            const purchaseUnit = profileData.purchaseUnit || 0;      // FIXED: Used camelCase
            const purchaseEarning = profileData.purchaseEarning || 0; // FIXED: Used camelCase

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
            } else if (commissionLogicElement) {
                commissionLogicElement.textContent = 'Financial metrics for this plan are not yet defined.';
            }


        } catch (error) {
            console.error('Error loading profile data:', error);
            // Provide a more informative error to the user
            const mainContent = document.querySelector('.main-content');
            if (mainContent) mainContent.innerHTML = `<h1>Error</h1><p>Could not load your profile data. The server may be experiencing issues. Please try again later.</p><p><small>Details: ${error.message}</small></p>`;
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
        const fullName = document.getElementById('full-name')?.value;
        const email = document.getElementById('profile-email')?.textContent; // Get email from display
        const paypalEmail = document.getElementById('paypal-email')?.value;
        const newPassword = document.getElementById('new-password')?.value;
        const confirmPassword = document.getElementById('confirm-new-password')?.value;
        const publicBio = document.getElementById('public-bio')?.value;

        if (!email) {
            alert("Could not find user email. Cannot update profile.");
            saveButton.disabled = false;
            saveButton.textContent = 'Save Changes';
            return;
        }
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

    /**
     * Handles the avatar image upload.
     */
    async function handleAvatarUpload() {
        const file = avatarUploadInput.files[0];
        if (!file) return;

        // Basic validation
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert('File is too large. Please select an image under 2MB.');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('email', currentUserEmail);

        try {
            const response = await fetch('/api/affiliate/upload-avatar', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                alert('Profile picture updated successfully!');
                // Update the avatar images on the page
                document.getElementById('advocate-avatar').src = result.imageUrl;
                document.getElementById('nav-avatar').src = result.imageUrl;
            } else {
                alert(`Error uploading image: ${result.error}`);
            }
        } catch (error) {
            console.error('Avatar upload failed:', error);
            alert('An unexpected error occurred during image upload.');
        }
    }

    // Attach event listener to the form
    if (profileForm) {
        profileForm.addEventListener('submit', updateProfile);
    }

    if (avatarUploadInput) {
        avatarUploadInput.addEventListener('change', handleAvatarUpload);
    }

    // --- NEW: Add event listener for the dropdown menu ---
    if (userProfileToggle) {
        userProfileToggle.addEventListener('click', () => {
            dropdownMenu.classList.toggle('hidden');
        });
    }

    // Close dropdown if clicking outside of it
    document.addEventListener('click', (event) => {
        if (!userProfileToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });

    // Initial data load
    loadProfileData();
    // You would also call a function here to load earnings data
    // loadEarningsData(currentUserEmail); 
});
document.addEventListener('DOMContentLoaded', () => {
    const currentUserEmail = 'roblq123@gmail.com';
    const avatarUploadInput = document.getElementById('avatar-upload');
    const runtime = window.LIVINGROOM507_RUNTIME;
    const mockApi = typeof window.MOCK_API === 'object' ? window.MOCK_API : null;
    const profileStorageKey = 'affiliateDashboardProfile';
    const defaultAvatarUrl = `data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
            <rect width="120" height="120" rx="60" fill="#d9e2ec"/>
            <circle cx="60" cy="44" r="24" fill="#9fb3c8"/>
            <path d="M24 104c8-20 26-30 36-30s28 10 36 30" fill="#9fb3c8"/>
        </svg>
    `)}`;

    const userProfileToggle = document.getElementById('user-profile-toggle');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const profileForm = document.getElementById('profile-update-form');

    function isPracticeMode() {
        return runtime?.isPracticeMode('affiliateProfile');
    }

    function getMockProfile() {
        const storedProfile = runtime?.readStorage(profileStorageKey, null);
        if (storedProfile) {
            return storedProfile;
        }

        if (mockApi?.affiliateProfile) {
            const seededProfile = { ...mockApi.affiliateProfile };
            runtime?.writeStorage(profileStorageKey, seededProfile);
            return seededProfile;
        }

        return null;
    }

    function saveMockProfile(profileData) {
        runtime?.writeStorage(profileStorageKey, profileData);
    }

    async function getProfileData() {
        if (isPracticeMode()) {
            const profileData = getMockProfile();
            if (!profileData) {
                throw new Error('Practice affiliate profile mode is enabled, but no mock profile data is available.');
            }
            return profileData;
        }

        return runtime.fetchJson(`/affiliate/profile?email=${encodeURIComponent(currentUserEmail)}`);
    }

    function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Unable to read the selected image.'));
            reader.readAsDataURL(file);
        });
    }

    async function loadProfileData() {
        if (!currentUserEmail) return;

        try {
            const profileData = await getProfileData();
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

            const avatarUrl = profileData.profilePictureUrl || defaultAvatarUrl;
            if (advocateAvatarEl) advocateAvatarEl.src = avatarUrl;
            if (navAvatarEl) navAvatarEl.src = avatarUrl;
            if (navUserNameEl) navUserNameEl.textContent = profileData.fullName || 'User';

            const purchaseUnit = profileData.purchaseUnit || 0;
            const purchaseEarning = profileData.purchaseEarning || 0;
            const exampleSalePrice = 89.95;
            let unitsPerExampleSale = 0;
            let commissionPerExampleSale = 0;

            if (purchaseUnit > 0) {
                unitsPerExampleSale = exampleSalePrice / purchaseUnit;
                commissionPerExampleSale = unitsPerExampleSale * purchaseEarning;
            }

            const commissionLogicElement = document.getElementById('commission-logic');
            if (purchaseUnit > 0 && purchaseEarning > 0 && commissionLogicElement) {
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
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.innerHTML = `<h1>Error</h1><p>Could not load your profile data.</p><p><small>Details: ${error.message}</small></p>`;
            }
        }
    }

    async function updateProfile(event) {
        event.preventDefault();
        const saveButton = document.getElementById('save-changes-button');
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';

        const fullName = document.getElementById('full-name')?.value;
        const email = document.getElementById('profile-email')?.textContent;
        const paypalEmail = document.getElementById('paypal-email')?.value;
        const newPassword = document.getElementById('new-password')?.value;
        const confirmPassword = document.getElementById('confirm-new-password')?.value;
        const publicBio = document.getElementById('public-bio')?.value;

        if (!email) {
            alert('Could not find user email. Cannot update profile.');
            saveButton.disabled = false;
            saveButton.textContent = 'Save Changes';
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('New password and confirmation do not match.');
            saveButton.disabled = false;
            saveButton.textContent = 'Save Changes';
            return;
        }

        try {
            const payload = {
                fullName,
                email,
                paypalEmail,
                publicBio,
                newPassword,
            };

            if (isPracticeMode()) {
                const existingProfile = getMockProfile();
                if (!existingProfile) {
                    throw new Error('Practice affiliate profile mode is enabled, but no mock profile data is available.');
                }

                saveMockProfile({
                    ...existingProfile,
                    fullName,
                    email,
                    paypalEmail,
                    publicBio,
                });
                alert('Profile saved locally for practice mode.');
            } else {
                await runtime.fetchJson('/affiliate/profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
                alert('Profile updated successfully!');
            }

            await loadProfileData();
        } catch (error) {
            console.error('Update profile failed:', error);
            alert('An unexpected error occurred during profile update.');
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Save Changes';
        }
    }

    async function handleAvatarUpload() {
        const file = avatarUploadInput.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('File is too large. Please select an image under 2MB.');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('email', currentUserEmail);

        try {
            let imageUrl = '';

            if (isPracticeMode()) {
                const existingProfile = getMockProfile();
                if (!existingProfile) {
                    throw new Error('Practice affiliate profile mode is enabled, but no mock profile data is available.');
                }

                imageUrl = await readFileAsDataUrl(file);
                saveMockProfile({
                    ...existingProfile,
                    profilePictureUrl: imageUrl,
                });
                alert('Profile picture saved locally for practice mode.');
            } else {
                const result = await runtime.fetchJson('/affiliate/upload-avatar', {
                    method: 'POST',
                    body: formData,
                });
                imageUrl = result.imageUrl;
                alert('Profile picture updated successfully!');
            }

            document.getElementById('advocate-avatar').src = imageUrl;
            document.getElementById('nav-avatar').src = imageUrl;
        } catch (error) {
            console.error('Avatar upload failed:', error);
            alert('An unexpected error occurred during image upload.');
        }
    }

    if (profileForm) {
        profileForm.addEventListener('submit', updateProfile);
    }

    if (avatarUploadInput) {
        avatarUploadInput.addEventListener('change', handleAvatarUpload);
    }

    if (userProfileToggle) {
        userProfileToggle.addEventListener('click', () => {
            dropdownMenu.classList.toggle('hidden');
        });
    }

    document.addEventListener('click', (event) => {
        if (!userProfileToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });

    loadProfileData();
});

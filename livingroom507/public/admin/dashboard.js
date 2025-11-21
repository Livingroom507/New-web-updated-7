// (A) Define the API Endpoint
const API_ENDPOINT = '/api/admin/data';
const COLLAB_PUSH_ENDPOINT = '/api/push-collab-update'; // Use your correct Pages Function proxy endpoint
const SEND_EMAIL_ENDPOINT = '/api/admin/send-email';

let CURRENT_CLIENT_SESSION_ID = 'SESSION_XYZ_123';

// 1. Function to handle prompting and storing the key
function getAuthToken() {
    // Try to retrieve existing token
    let token = sessionStorage.getItem('adminAuthToken');

    if (!token) {
        // If not found, prompt the user
        token = prompt('Please enter your Admin API Key:');
        
        // If user enters a key, store it
        if (token) {
            // CRITICAL CHANGE: Store the actual 'token' the user entered, 
            // NOT the hardcoded string "TEST-KEY-123"
            sessionStorage.setItem('adminAuthToken', token); // <--- CHANGE THIS LINE
        } else {
            // CRUCIAL: If user cancels or enters empty, show the failure alert ONCE.
            alert('Admin Authentication failed. Please reload and re-enter the correct API Key.');
        }
    }
    // Return the token (or null/undefined if prompt was cancelled)
    return token; 
}

// 2. Global Initialization
// *** This must run immediately when the script loads ***
const authToken = getAuthToken();
// Optional: If the token is null, stop further initialization (e.g., loading data)
if (!authToken) {
    // You might call a function here to hide the content or display a locked message
    console.error("Authentication failed. Stopping dashboard initialization.");
}


async function fetchAdminData(validAuthToken) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${validAuthToken}` // Use the passed-in valid token
            }
        });
        if (response.status === 401) {
            sessionStorage.removeItem('adminAuthToken'); // CRITICAL: Clear the bad token
            throw new Error('Authentication Failed. Please reload and re-enter the correct API Key.');
        }
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Server Error' }));
            throw new Error(errorData.detail || 'Server Error');
        }
        const data = await response.json();
        renderDashboard(data);
    } catch (error) {
        console.error("Could not load admin data:", error);
        document.querySelector('#closer-table tbody').innerHTML = `<tr><td colspan="6" class="error-message">Error loading data: ${error.message}</td></tr>`;
    }
}

function renderDashboard(data) {
    document.getElementById('total-closers').textContent = data.teamSize || 0;
    document.getElementById('mastery-count').textContent = (data.topPerformers ? data.topPerformers.length : 0);

    const tableBody = document.querySelector('#closer-table tbody');
    tableBody.innerHTML = '';

    if (!data || !data.profiles) {
        console.warn("No profiles data available.");
        return;
    }

    data.profiles.forEach(profile => {
        const score = (data.topPerformers && data.topPerformers.find(p => p.email === profile.email)?.score) || 'N/A';
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td><input type="checkbox" class="email-select" value="${profile.email}"></td>
            <td>${profile.fullName}</td>
            <td>${profile.email}</td>
            <td>${score}</td>
            <td>${profile.nicheInterest}</td>
            <td><button class="btn" onclick="showFullProfile('${profile.email}')">Analyze</button></td>
        `;
    });
}

function showFullProfile(email) {
    fetchFullDetails(email);
}

// Function to fetch the user's current subscription tier
async function fetchSubscriptionStatus(email) {
    if (!authToken) return { subscription_tier: 'Client' }; // Default if not authenticated
    
    try {
        const response = await fetch(`/api/admin/subscriptions?email=${email}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Failed to fetch subscription status.');

        const data = await response.json();
        return data.subscription || { subscription_tier: 'Client' }; // Return tier object
    } catch (error) {
        console.error("Error fetching subscription status:", error);
        return { subscription_tier: 'Error' };
    }
}

// Function to update the user's subscription tier
async function updateSubscriptionTier(email, newTier) {
    if (!authToken) {
        alert('Authentication required to update tier.');
        return;
    }

    try {
        const response = await fetch(`/api/admin/subscriptions?email=${email}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ newTier })
        });

        if (response.status === 401) throw new Error('Authentication Failed.');
        if (!response.ok) throw new Error('Failed to update subscription tier.');

        const data = await response.json();
        alert(data.message);
        // Re-fetch and re-render the modal content to show the new tier
        fetchFullDetails(email);

    } catch (error) {
        console.error("Error updating subscription tier:", error);
        alert(`Failed to update tier: ${error.message}`);
    }
}

async function fetchFullDetails(email) {
    if (!authToken) {
        alert('Admin authentication is required to view details.');
        return;
    }
    const modal = document.getElementById('profile-detail-modal');
    modal.style.display = 'block'; // SHOW THE GREY OVERLAY
    const content = document.getElementById('modal-content');
    content.innerHTML = `<p>Fetching full details for ${email}...</p>`;

    try {
        // 1. Fetch main profile data
        const profileResponse = await fetch(`/api/admin/profile-details?email=${email}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!profileResponse.ok) throw new Error('Failed to fetch profile details.');
        
        const profileData = await profileResponse.json();
        
        // 2. Fetch subscription data
        const subscriptionData = await fetchSubscriptionStatus(email); // <-- NEW CALL
        
        // Combine all data for rendering
        const combinedData = { ...profileData, ...subscriptionData }; // <-- COMBINE
        
        renderProfileDetails(combinedData);

    } catch (error) {
        console.error("Error fetching details:", error);
        renderProfileDetails({ error: error.message });
    }
}

function renderProfileDetails(profile) {
    const modalContent = document.getElementById('modal-content');

    if (profile.error) {
        modalContent.innerHTML = `<span class="close-button" onclick="document.getElementById('profile-detail-modal').style.display='none'">&times;</span>
                                  <h2>Error</h2><p>Could not load profile details: ${profile.error}</p>`;
        return;
    }

    const {
        fullName, email, nicheInterest, linkedinUrl, salesExperience, availability,
        deepPainSummary, objectionHandlingView, crmFamiliarity, submissionDate,
        module3_score, subscription_tier // All necessary data fields
    } = profile;

    // --- Utility function to determine availability display ---
    const formatAvailability = (avail) => {
        if (!avail) return 'N/A';
        // Assuming availability might be stored as an array or comma-separated string if multiple are possible
        return Array.isArray(avail) ? avail.join(', ') : avail;
    };
    
    // --- Determine Niche display ---
    const formatNiche = (niche) => {
        // Assuming niche is just a single string or 'Other'
        return niche || 'Not specified';
    };

    modalContent.innerHTML = `
        <span class="close-button" onclick="document.getElementById('profile-detail-modal').style.display='none'">&times;</span>
        <h2>${fullName}'s Full Profile Analysis 📊</h2>

        <div class="profile-details-grid">
            
            <div class="detail-section tier-control-section">
                <h3>Subscription & Progression</h3>
                <p><strong>Current Tier:</strong> <span id="current-tier">${subscription_tier || 'Client'}</span></p>
                
                <div class="tier-update-controls">
                    <select id="new-tier-select" aria-label="Select new subscription tier">
                        <option value="Client">Client</option>
                        <option value="Affiliate">Affiliate</option>
                        <option value="Closer">Closer</option>
                        <option value="Mastery">Mastery</option>
                        <option value="Panama Ready">Panama Ready</option>
                    </select>
                    <button class="btn btn-update-tier" 
                            onclick="updateSubscriptionTier('${email}', document.getElementById('new-tier-select').value)">
                        Update Tier
                    </button>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Contact & Base Info</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>LinkedIn Profile:</strong> <a href="${linkedinUrl}" target="_blank">${linkedinUrl ? 'View Profile' : 'N/A'}</a></p>
                <p><strong>Sales Experience:</strong> ${salesExperience || 'N/A'} years</p>
                <p><strong>Availability:</strong> ${formatAvailability(availability)}</p>
                <p><strong>Desired Niche:</strong> ${formatNiche(nicheInterest)}</p>
                <p><strong>CRM Familiarity:</strong> ${crmFamiliarity || 'N/A'}</p>
            </div>

            <div class="detail-section score-section">
                <h3>Assessment Scores</h3>
                <p class="big-score"><strong>Module 3 Score:</strong> ${module3_score || 'N/A'}</p>
                <p>Submitted on: ${new Date(submissionDate).toLocaleDateString()}</p>
            </div>
        </div>

        <div class="qualitative-section">
            <h3>Qualitative Assessments</h3>
            <h4>Deep Pain Summary View</h4>
            <blockquote class="summary-box">${deepPainSummary || 'No data provided.'}</blockquote>

            <h4>Objection Handling Philosophy</h4>
            <blockquote class="summary-box">${objectionHandlingView || 'No data provided.'}</blockquote>
        </div>
    `;
    
    // Pre-select the current tier in the dropdown
    const selectElement = document.getElementById('new-tier-select');
    if (selectElement && subscription_tier) {
        selectElement.value = subscription_tier;
    }
}

function openEmailModal() {
    if (!authToken) {
        alert('Please authenticate to send emails.');
        return;
    }
    document.getElementById('email-modal').classList.add('active');
}

function closeEmailModal() {
    document.getElementById('email-modal').classList.remove('active');
}

async function sendTeamEmail() {
    if (!authToken) {
        alert('Please authenticate to send emails.');
        return;
    }
    const selectedEmails = Array.from(document.querySelectorAll('.email-select:checked')).map(cb => cb.value);
    const subject = document.getElementById('email-subject').value;
    const body = document.getElementById('email-body').value;

    if (selectedEmails.length === 0 || !subject || !body) {
        alert("Please select recipients and fill out the subject and body.");
        return;
    }

    try {
        const response = await fetch(SEND_EMAIL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ recipientEmails: selectedEmails, subject, body })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to send emails.");
        }

        alert(`Success! Message sent to ${selectedEmails.length} certified closers.`);
        closeEmailModal();

    } catch (error) {
        console.error('Error sending team email:', error);
        alert(`Error: ${error.message}. Check console for details.`);
    }
}

// 3. Ensure action functions use the GLOBAL token and check for failure
async function sendAdminSelection(categoryId, categoryName) {
    // Stop immediately if the global token failed to initialize
    if (!authToken) {
        alert('Cannot send update. Authentication failed on page load.');
        return; 
    }
    
    const statusElement = document.getElementById(`admin-status-${categoryId}`);
    statusElement.textContent = 'Sending...';

    try {
        // ... proceed with the fetch request using the global authToken ...
        const response = await fetch(`${COLLAB_PUSH_ENDPOINT}?sessionId=${CURRENT_CLIENT_SESSION_ID}`, {
            method: 'POST',
            headers: {
                // Use the GLOBAL token populated on load
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'confirm_selection',
                category_id: categoryId,
                category_name: categoryName
            }),
        });
        
        // ... check response.ok and handle success/failure
        if (response.status === 401) {
            statusElement.textContent = 'Auth Error';
            sessionStorage.removeItem('adminAuthToken');
            alert('Admin Authentication Failed. Please reload and re-enter the correct API Key.');
            return;
        }

        if (response.ok) {
            statusElement.textContent = 'Confirmed!';
            statusElement.style.color = '#28a745';
            logClientFinalSelection(CURRENT_CLIENT_SESSION_ID, categoryId, categoryName);
        } else {
            statusElement.textContent = 'Push Failed';
            statusElement.style.color = '#dc3545';
            console.error('DO Push Failure:', await response.text());
        }
    } catch (e) {
        statusElement.textContent = 'Network Error!';
        statusElement.style.color = '#dc3545';
        console.error('Push failed:', e);
    }
}


function logClientFinalSelection(sessionId, categoryId, categoryName) {
    console.log(`[D1 Log] Logging final selection for session ${sessionId}: ${categoryName}`);
}

document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        document.getElementById('collab-session-id').textContent = CURRENT_CLIENT_SESSION_ID;
        initializeAdminDashboard();
    }
});

async function initializeAdminDashboard() {
    if (authToken) {
        await fetchAdminData(authToken);
    } else {
        document.querySelector('#closer-table tbody').innerHTML =
            `<tr><td colspan="6" class="error-message">Admin Key required. Please refresh and enter the key.</td></tr>`;
    }
}

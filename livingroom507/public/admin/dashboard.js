const API_ENDPOINT = '/api/admin/data';
const SEND_EMAIL_ENDPOINT = '/api/admin/send-email';
const PUSH_ENDPOINT = '/api/push-collab-update';

let CURRENT_CLIENT_SESSION_ID = 'SESSION_XYZ_123';

function getAuthToken() {
    if (sessionStorage.getItem('adminAuthToken')) {
        return sessionStorage.getItem('adminAuthToken');
    } else {
        const token = prompt('Please enter your Admin API Key:');
        if (token) {
            sessionStorage.setItem('adminAuthToken', token);
            return token;
        }
        return null;
    }
}

async function fetchAdminData() {
    const authToken = getAuthToken();
    if (!authToken) {
        document.querySelector('#closer-table tbody').innerHTML = `<tr><td colspan="6" class="error-message">Authentication token not provided.</td></tr>`;
        return;
    }

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'X-Admin-Auth': authToken }
        });
        if (response.status === 401) throw new Error('Authentication Failed. Please check your API Key.');
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

async function fetchFullDetails(email) {
    const authToken = getAuthToken();
    if (!authToken) {
        alert('Admin authentication is required to view details.');
        return;
    }
    const modal = document.getElementById('profile-detail-modal');
    modal.style.display = 'block'; // SHOW THE GREY OVERLAY
    const content = document.getElementById('modal-content');
    content.innerHTML = `<p>Fetching full details for ${email}...</p>`;

    try {
        const response = await fetch(`/api/admin/profile-details?email=${email}`, {
            method: 'GET',
            headers: { 'X-Admin-Auth': authToken }
        });
        
        if (!response.ok) throw new Error('Failed to fetch profile details.');
        
        const data = await response.json();
        console.log(data);
        
        renderProfileDetails(data); 

    } catch (error) {
        console.error("Error fetching details:", error);
        renderProfileDetails({ error: error.message });
    }
}

function renderProfileDetails(profile) {
    const modalContent = document.getElementById('modal-content');

    if (profile.error) {
        modalContent.innerHTML = `<p class="error-message">Error: ${profile.error}</p>`;
        return;
    }

    // You can see the full list of available fields in your console output!
    const { 
        fullName, email, nicheInterest, linkedinUrl, salesExperience, availability, 
        deepPainSummary, objectionHandlingView, crmFamiliarity, submissionDate,
        module3_score // Adjusted to match your object field name
        // Add other fields if you introduce the consolidated score table
    } = profile;

    // Build the HTML content to be displayed in the modal
    modalContent.innerHTML = `
        <span class="close-button" onclick="document.getElementById('profile-detail-modal').style.display='none'">&times;</span>
        <h2>${fullName}'s Full Profile Analysis</h2>
        
        <div class="profile-details-grid">
            <div class="detail-section">
                <h3>Contact & Base Info</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>LinkedIn:</strong> <a href="${linkedinUrl}" target="_blank">View Profile</a></p>
                <p><strong>Niche Interest:</strong> ${nicheInterest}</p>
                <p><strong>Sales Experience:</strong> ${salesExperience} years</p>
            </div>

            <div class="detail-section score-section">
                <h3>Assessment Scores</h3>
                <p class="big-score"><strong>Module 3 Score:</strong> ${module3_score || 'N/A'}</p>
            </div>
        </div>
        
        <div class="qualitative-section">
            <h3>Qualitative Assessments</h3>
            <h4>Deep Pain Summary View</h4>
            <blockquote class="summary-box">${deepPainSummary || 'No data provided.'}</blockquote>
            
            <h4>Objection Handling View</h4>
            <blockquote class="summary-box">${objectionHandlingView || 'No data provided.'}</blockquote>
        </div>
    `;
}

function openEmailModal() {
    const authToken = getAuthToken();
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
    const authToken = getAuthToken();
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
                'X-Admin-Auth': authToken
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

async function sendAdminSelection(categoryId, categoryName) {
    // 1. Force the token to be retrieved (prompts user if not in session storage)
    const token = getAuthToken(); 

    if (!token) {
        alert('Admin authentication is required to send the update.');
        return; // Stop execution if the user cancels the prompt
    }

    const statusElement = document.getElementById(`admin-status-${categoryId}`);
    statusElement.textContent = 'Sending...';

    const clientUpdateMessage = `✅ Focus confirmed: ${categoryName}`;

    try {
        const response = await fetch(`${PUSH_ENDPOINT}?sessionId=${CURRENT_CLIENT_SESSION_ID}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Admin-Auth': token // <-- **FIXED: Now uses the fresh token**
            },
            body: JSON.stringify({
                action: 'confirm_selection',
                category: categoryId,
                categoryName: categoryName,
                message: clientUpdateMessage,
                color: 'green'
            })
        });

        if (response.status === 401) {
            statusElement.textContent = 'Auth Error';
            // User likely entered a wrong key, so clear it to force a re-prompt
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
    fetchAdminData();
    document.getElementById('collab-session-id').textContent = CURRENT_CLIENT_SESSION_ID;
});
document.addEventListener('DOMContentLoaded', () => {
    const pipelineBoard = document.getElementById('pipeline-board');
    const addDealBtn = document.getElementById('add-deal-btn');
    const modal = document.getElementById('deal-modal');
    const closeModalBtn = document.querySelector('.close-button');
    const dealForm = document.getElementById('deal-form');

    // Define the pipeline stages as per our CRM plan
    const pipelineStages = [
        'Qualified Lead',
        'Discovery Call Scheduled',
        'Diagnostic Complete',
        'Proposal Sent',
        'Closed/Won',
        'Lost/Nurture'
    ];

    // --- RENDER THE PIPELINE BOARD ---
    function renderBoard() {
        pipelineBoard.innerHTML = ''; // Clear the board
        pipelineStages.forEach(stage => {
            const stageEl = document.createElement('div');
            stageEl.className = 'pipeline-stage';
            stageEl.id = `stage-${stage.replace(/\s+/g, '-')}`;

            stageEl.innerHTML = `
                <h3>${stage}</h3>
                <ul class="deal-cards" data-stage="${stage}">
                    <!-- Deal cards will be added here -->
                </ul>
            `;

            stageEl.addEventListener('dragover', e => {
                e.preventDefault();
                const afterElement = getDragAfterElement(stageEl, e.clientY);
                const draggable = document.querySelector('.dragging');
                const cardContainer = stageEl.querySelector('.deal-cards');
                if (afterElement == null) {
                    cardContainer.appendChild(draggable);
                } else {
                    cardContainer.insertBefore(draggable, afterElement);
                }
            });

            stageEl.addEventListener('drop', e => {
                e.preventDefault();
                const dealId = document.querySelector('.dragging').id.split('-')[1];
                const newStage = stage;
                updateDealStage(dealId, newStage);
            });

            pipelineBoard.appendChild(stageEl);
        });
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.deal-card:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    async function updateDealStage(dealId, newStage) {
        try {
            const response = await fetch(`/api/deals/${dealId}/stage`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pipeline_stage: newStage }),
            });

            if (!response.ok) {
                throw new Error('Failed to update deal stage');
            }
        } catch (error) {
            console.error('Error updating deal stage:', error);
            alert('Could not move the deal. Please refresh and try again.');
        }
    }

    // --- MODAL HANDLING ---
    function showModal(deal = null) {
        dealForm.reset();
        if (deal) {
            document.getElementById('deal-id').value = deal.id;
            document.getElementById('contact-name').value = deal.contactName;
            document.getElementById('contact-email').value = deal.contactEmail;
            document.getElementById('main-pain').value = deal.main_pain;
            document.getElementById('emotional-cost').value = deal.emotional_cost;
            document.getElementById('uvp').value = deal.uvp;
            document.getElementById('readiness-score').value = deal.readiness_score;
            document.querySelector('#deal-modal h2').textContent = 'Edit Deal';
        } else {
            document.querySelector('#deal-modal h2').textContent = 'Add New Deal';
        }
        modal.style.display = 'flex';
    }

    function hideModal() {
        modal.style.display = 'none';
        dealForm.reset();
    }

    addDealBtn.addEventListener('click', () => showModal());
    closeModalBtn.addEventListener('click', hideModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideModal();
        }
    });

    // --- FORM HANDLING ---
    dealForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const dealId = document.getElementById('deal-id').value;
        const dealData = {
            contactName: document.getElementById('contact-name').value,
            contactEmail: document.getElementById('contact-email').value,
            mainPain: document.getElementById('main-pain').value,
            emotionalCost: document.getElementById('emotional-cost').value,
            uvp: document.getElementById('uvp').value,
            readinessScore: parseInt(document.getElementById('readiness-score').value, 10) || null,
        };

        const method = dealId ? 'PUT' : 'POST';
        const url = dealId ? `/api/deals/${dealId}` : '/api/deals';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dealData),
            });

            if (!response.ok) {
                throw new Error('Failed to save deal');
            }

            const savedDeal = await response.json();
            
            if (dealId) {
                // Remove the old card
                const oldCard = document.getElementById(`deal-${dealId}`);
                if (oldCard) {
                    oldCard.remove();
                }
            }

            addDealCardToBoard(savedDeal);
            hideModal();

        } catch (error) {
            console.error('Error saving deal:', error);
            alert('Could not save the deal. Please try again.');
        }
    });


    function addDealCardToBoard(deal) {
        const stageId = `stage-${deal.pipeline_stage.replace(/\s+/g, '-')}`;
        const stageEl = document.getElementById(stageId);
        if (stageEl) {
            const dealCard = document.createElement('li');
            dealCard.className = 'deal-card';
            dealCard.id = `deal-${deal.id}`;
            dealCard.draggable = true;
            dealCard.innerHTML = `
                <h4>${deal.contactName}</h4>
                <p>${deal.uvp || 'No UVP defined'}</p>
            `;
            dealCard.addEventListener('click', () => showModal(deal));

            // Drag and Drop events
            dealCard.addEventListener('dragstart', () => {
                dealCard.classList.add('dragging');
            });

            dealCard.addEventListener('dragend', () => {
                dealCard.classList.remove('dragging');
            });

            stageEl.querySelector('.deal-cards').appendChild(dealCard);
        }
    }

    // --- FETCH AND RENDER DEALS ---
    async function fetchAndRenderDeals() {
        try {
            const response = await fetch('/api/deals');
            if (!response.ok) {
                throw new Error('Failed to fetch deals');
            }
            const deals = await response.json();
            deals.forEach(deal => addDealCardToBoard(deal));
        } catch (error) {
            console.error('Error fetching deals:', error);
        }
    }

    // --- INITIALIZE ---
    renderBoard();
    fetchAndRenderDeals();
});

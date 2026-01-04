// Estrutura de dados
let data = {
    entries: {} // { "2024-01-15": [{ type: "gastas", amount: 500, description: "Vôlei", timestamp: ... }] }
};

// Elementos DOM
const calorieType = document.getElementById('calorie-type');
const calorieAmount = document.getElementById('calorie-amount');
const calorieDescription = document.getElementById('calorie-description');
const addCalorieBtn = document.getElementById('add-calorie-btn');
const totalGastas = document.getElementById('total-gastas');
const totalGanhas = document.getElementById('total-ganhas');
const saldoDia = document.getElementById('saldo-dia');
const entriesList = document.getElementById('entries-list');
const calendar = document.getElementById('calendar');
const currentMonthYear = document.getElementById('current-month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const modalOverlay = document.getElementById('day-details');
const dayDetailsTitle = document.getElementById('day-details-title');
const dayDetailsContent = document.getElementById('day-details-content');
const closeDetailsBtn = document.getElementById('close-details');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');
const darkModeBtn = document.getElementById('dark-mode-btn');
const editModal = document.getElementById('edit-entry-modal');
const editCalorieType = document.getElementById('edit-calorie-type');
const editCalorieAmount = document.getElementById('edit-calorie-amount');
const editCalorieDescription = document.getElementById('edit-calorie-description');
const editEntryDate = document.getElementById('edit-entry-date');
const editEntryIndex = document.getElementById('edit-entry-index');
const saveEditBtn = document.getElementById('save-edit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const closeEditModal = document.getElementById('close-edit-modal');

// Estado do calendário
let currentDate = new Date();
let selectedDate = new Date();

// Inicialização
loadData();
loadDarkMode();
updateUI();
renderCalendar();

// Funções de armazenamento
function saveData() {
    localStorage.setItem('calloriesData', JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem('calloriesData');
    if (saved) {
        try {
            data = JSON.parse(saved);
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
            data = { entries: {} };
        }
    }
}

// Funções de data
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDate(dateString) {
    return new Date(dateString + 'T00:00:00');
}

function getTodayDateString() {
    return formatDate(new Date());
}

// Funções de cálculos
function getDayEntries(dateString) {
    return data.entries[dateString] || [];
}

function calculateDayTotals(dateString) {
    const entries = getDayEntries(dateString);
    let gastas = 0;
    let ganhas = 0;

    entries.forEach(entry => {
        if (entry.type === 'gastas') {
            gastas += entry.amount;
        } else {
            ganhas += entry.amount;
        }
    });

    return { gastas, ganhas, saldo: gastas - ganhas };
}

function getDayStatus(dateString) {
    const { saldo } = calculateDayTotals(dateString);
    if (saldo > 0) return 'good'; // Déficit (gastou mais que ganhou)
    if (saldo < 0) return 'bad'; // Superávit (ganhou mais que gastou)
    return 'neutral'; // Equilibrado
}

// Adicionar entrada
function addEntry(type, amount, description) {
    if (!amount || amount <= 0) {
        alert('Por favor, insira uma quantidade válida!');
        return;
    }

    if (!description.trim()) {
        alert('Por favor, insira uma descrição!');
        return;
    }

    const dateString = getTodayDateString();
    if (!data.entries[dateString]) {
        data.entries[dateString] = [];
    }

    const entry = {
        type: type,
        amount: parseInt(amount),
        description: description.trim(),
        timestamp: new Date().toISOString()
    };

    data.entries[dateString].push(entry);
    saveData();
    updateUI();
    renderCalendar();

    // Limpar campos
    calorieAmount.value = '';
    calorieDescription.value = '';
}

// Remover entrada
   window.removeEntry = function(dateString, index) {
    if (confirm('Tem certeza que deseja excluir esta entrada?')) {
        if (data.entries[dateString]) {
            data.entries[dateString].splice(index, 1);
            if (data.entries[dateString].length === 0) {
                delete data.entries[dateString];
            }
            saveData();
            updateUI();
            renderCalendar();
        }
    }
};

// Editar entrada
window.editEntry = function(dateString, index) {
    const entries = getDayEntries(dateString);
    if (entries[index]) {
        const entry = entries[index];
        editEntryDate.value = dateString;
        editEntryIndex.value = index;
        editCalorieType.value = entry.type;
        editCalorieAmount.value = entry.amount;
        editCalorieDescription.value = entry.description;
        editModal.style.display = 'flex';
    }
};

// Salvar edição
function saveEdit() {
    const dateString = editEntryDate.value;
    const index = parseInt(editEntryIndex.value);
    const type = editCalorieType.value;
    const amount = parseInt(editCalorieAmount.value);
    const description = editCalorieDescription.value.trim();

    if (!amount || amount <= 0) {
        alert('Por favor, insira uma quantidade válida!');
        return;
    }

    if (!description) {
        alert('Por favor, insira uma descrição!');
        return;
    }

    if (data.entries[dateString] && data.entries[dateString][index]) {
        data.entries[dateString][index].type = type;
        data.entries[dateString][index].amount = amount;
        data.entries[dateString][index].description = description;
        data.entries[dateString][index].timestamp = new Date().toISOString();
        saveData();
        updateUI();
        renderCalendar();
        editModal.style.display = 'none';
    }
}

// Atualizar UI
function updateUI() {
    const today = getTodayDateString();
    const totals = calculateDayTotals(today);

    totalGastas.textContent = totals.gastas;
    totalGanhas.textContent = totals.ganhas;
    saldoDia.textContent = totals.saldo;

    // Cor do saldo
    if (totals.saldo > 0) {
        saldoDia.style.color = '#51cf66';
    } else if (totals.saldo < 0) {
        saldoDia.style.color = '#ff6b6b';
    } else {
        saldoDia.style.color = '#ffd43b';
    }

    // Lista de entradas do dia
    const entries = getDayEntries(today);
    if (!entriesList) {
        console.error('entriesList element not found');
        return;
    }
    
    if (entries.length === 0) {
        entriesList.innerHTML = '<p class="empty-message">Nenhuma entrada registrada hoje</p>';
    } else {
        entriesList.innerHTML = entries.map((entry, index) => {
            const sign = entry.type === 'gastas' ? '-' : '+';
            const typeLabel = entry.type === 'gastas' ? 'Gastas' : 'Ganhas';
            return `
                <div class="entry-item ${entry.type}">
                    <div class="entry-info">
                        <div class="entry-description">${entry.description}</div>
                        <div class="entry-type">${typeLabel}</div>
                    </div>
                    <div class="entry-amount">${sign}${entry.amount}</div>
                    <div class="entry-actions">
                        <button class="edit-btn" onclick="window.editEntry('${today}', ${index})" title="Editar">✏️</button>
                        <button class="delete-btn" onclick="window.removeEntry('${today}', ${index})" title="Excluir">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Renderizar calendário
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Título do mês
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    currentMonthYear.textContent = `${monthNames[month]} ${year}`;

    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Limpar calendário
    calendar.innerHTML = '';

    // Labels dos dias da semana
    const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    dayLabels.forEach(label => {
        const labelDiv = document.createElement('div');
        labelDiv.className = 'calendar-day-label';
        labelDiv.textContent = label;
        calendar.appendChild(labelDiv);
    });

    // Dias vazios no início
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendar.appendChild(emptyDay);
    }

    // Dias do mês
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = formatDate(date);
        const isToday = formatDate(today) === dateString;
        const status = getDayStatus(dateString);
        const totals = calculateDayTotals(dateString);

        const dayDiv = document.createElement('div');
        dayDiv.className = `calendar-day ${isToday ? 'today' : ''}`;
        dayDiv.onclick = () => showDayDetails(dateString);

        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = day;
        dayDiv.appendChild(dayNumber);

        if (totals.gastas > 0 || totals.ganhas > 0) {
            const indicator = document.createElement('div');
            indicator.className = `calendar-day-indicator ${status}`;
            dayDiv.appendChild(indicator);
        }

        calendar.appendChild(dayDiv);
    }
}

// Mostrar detalhes do dia
function showDayDetails(dateString) {
    const date = parseDate(dateString);
    const dateFormatted = date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    dayDetailsTitle.textContent = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

    const entries = getDayEntries(dateString);
    const totals = calculateDayTotals(dateString);
    const status = getDayStatus(dateString);

    let statusText = '';
    let statusColor = '';
    if (status === 'good') {
        statusText = 'Déficit (Bom)';
        statusColor = '#51cf66';
    } else if (status === 'bad') {
        statusText = 'Superávit (Ruim)';
        statusColor = '#ff6b6b';
    } else {
        statusText = 'Equilibrado';
        statusColor = '#ffd43b';
    }

    let content = `
        <div class="day-summary">
            <div class="day-summary-item">
                <h4>Calorias Gastas</h4>
                <p>${totals.gastas}</p>
            </div>
            <div class="day-summary-item">
                <h4>Calorias Ganhas</h4>
                <p>${totals.ganhas}</p>
            </div>
            <div class="day-summary-item">
                <h4>Saldo</h4>
                <p style="color: ${statusColor}">${totals.saldo}</p>
            </div>
        </div>
        <div style="text-align: center; margin-bottom: 20px;">
            <strong style="color: ${statusColor}">Status: ${statusText}</strong>
        </div>
    `;

    if (entries.length === 0) {
        content += '<p class="empty-message">Nenhuma entrada registrada neste dia</p>';
    } else {
        content += '<div class="day-entries-list">';
        entries.forEach(entry => {
            const sign = entry.type === 'gastas' ? '-' : '+';
            const typeLabel = entry.type === 'gastas' ? 'Gastas' : 'Ganhas';
            content += `
                <div class="day-entry-item ${entry.type}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; margin-bottom: 5px;">${entry.description}</div>
                            <div style="font-size: 0.85rem; color: var(--text-light); text-transform: uppercase;">${typeLabel}</div>
                        </div>
                        <div style="font-size: 1.5rem; font-weight: bold;">${sign}${entry.amount}</div>
                    </div>
                </div>
            `;
        });
        content += '</div>';
    }

    dayDetailsContent.innerHTML = content;
    modalOverlay.style.display = 'flex';
}

// Event Listeners
addCalorieBtn.addEventListener('click', () => {
    const type = calorieType.value;
    const amount = calorieAmount.value;
    const description = calorieDescription.value;
    addEntry(type, amount, description);
});

// Enter para adicionar
calorieAmount.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addCalorieBtn.click();
    }
});

calorieDescription.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addCalorieBtn.click();
    }
});

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

closeDetailsBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
});

// Fechar detalhes ao clicar fora
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.style.display = 'none';
    }
});

// Exportar dados
exportBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `callories-data-${formatDate(new Date())}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert('Dados exportados com sucesso!');
});

// Importar dados
importBtn.addEventListener('click', () => {
    importFile.click();
});

importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target.result);
            
            if (confirm('Isso irá substituir todos os dados atuais. Deseja continuar?')) {
                data = importedData;
                saveData();
                updateUI();
                renderCalendar();
                alert('Dados importados com sucesso!');
            }
        } catch (error) {
            alert('Erro ao importar dados. Verifique se o arquivo é válido.');
            console.error('Erro ao importar:', error);
        }
    };
    reader.readAsText(file);
    importFile.value = ''; // Reset input
});

// Modo Escuro
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    darkModeBtn.textContent = isDark ? '☀️' : '🌙';
    darkModeBtn.title = isDark ? 'Modo Claro' : 'Modo Escuro';
}

function loadDarkMode() {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeBtn.textContent = '☀️';
        darkModeBtn.title = 'Modo Claro';
    } else {
        darkModeBtn.textContent = '🌙';
        darkModeBtn.title = 'Modo Escuro';
    }
}

darkModeBtn.addEventListener('click', toggleDarkMode);

// Event Listeners para Modal de Edição
saveEditBtn.addEventListener('click', saveEdit);

cancelEditBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
});

closeEditModal.addEventListener('click', () => {
    editModal.style.display = 'none';
});

editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
        editModal.style.display = 'none';
    }
});

// Enter para salvar edição
editCalorieAmount.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        saveEdit();
    }
});

editCalorieDescription.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        saveEdit();
    }
});


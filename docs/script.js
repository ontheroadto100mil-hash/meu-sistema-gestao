// ===== SISTEMA DE GAMIFICAÇÃO =====
const RANKS = {
    0: 'RECRUTA',
    100: 'SOLDADO',
    500: 'CABO',
    1000: 'SARGENTO',
    2500: 'TENENTE',
    5000: 'CAPITÃO'
};

// Variáveis globais
let totalXP = parseInt(localStorage.getItem('totalXP')) || 0;
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let currentGoal = localStorage.getItem('currentGoal') || '';
let sprintDay = parseInt(localStorage.getItem('sprintDay')) || 1;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    updateDashboard();
    loadTasks();
    loadTransactions();
    loadHabits();
    setupTabs();
    
    // Configurar PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
    }
    
    // Configurar inputs para aceitar Enter
    setupInputEvents();
    
    // Inicializar abas
    showTab('tasks');
});

// ===== SISTEMA DE ABAS =====
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove classe active de todas as abas
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Adiciona classe active na aba clicada
            tab.classList.add('active');
            
            // Mostra o conteúdo correspondente
            const tabId = tab.getAttribute('data-tab') + '-tab';
            document.getElementById(tabId).classList.add('active');
        });
    });
}

function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Remove classe active de todas as abas
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    // Ativar aba clicada
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(`${tabName}-tab`);
    
    if (activeTab && activeContent) {
        activeTab.classList.add('active');
        activeContent.classList.add('active');
    }
}

// ===== CONFIGURAÇÃO DE INPUTS =====
function setupInputEvents() {
    // Tarefas: Enter para adicionar
    document.getElementById('newTask').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    // Finanças: Enter para adicionar
    document.getElementById('transactionAmount').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTransaction();
        }
    });
    
    // Metas: Enter para salvar
    document.getElementById('mainGoal').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            updateGoal();
        }
    });
}

// ===== SISTEMA DE TAREFAS =====
function addTask() {
    const input = document.getElementById('newTask');
    const text = input.value.trim();
    
    if (text) {
        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            xpValue: 10
        };
        
        tasks.push(task);
        saveTasks();
        input.value = '';
        input.focus(); // Mantém foco no input
        loadTasks();
        
        // Notificação visual
        showToast('✅ Tarefa adicionada!');
    }
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        
        // Adicionar XP se completou
        if (task.completed) {
            addXP(task.xpValue);
            showToast(`🎉 +${task.xpValue} XP! Tarefa concluída!`);
        } else {
            addXP(-task.xpValue);
        }
        
        saveTasks();
        loadTasks();
        updateDashboard();
    }
}

function loadTasks() {
    const taskList = document.getElementById('taskList');
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    
    taskList.innerHTML = '';
    
    // Ordenar: não concluídas primeiro, depois por data
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    sortedTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <div class="task-checkbox-container">
                <input type="checkbox" class="task-checkbox" 
                       ${task.completed ? 'checked' : ''} 
                       onchange="toggleTask(${task.id})"
                       id="task-${task.id}">
                <label for="task-${task.id}" class="checkbox-label"></label>
            </div>
            <span class="task-text ${task.completed ? 'task-completed' : ''}">
                ${task.text}
                <span class="task-xp">+${task.xpValue} XP</span>
            </span>
        `;
        taskList.appendChild(li);
    });
    
    // Atualizar progresso
    const progress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
    document.getElementById('taskProgress').style.width = `${progress}%`;
    document.getElementById('taskCount').textContent = `${completedTasks}/${totalTasks} concluídas`;
    
    // Se não houver tarefas, mostrar mensagem
    if (tasks.length === 0) {
        taskList.innerHTML = '<li class="empty-message">Nenhuma tarefa adicionada ainda.</li>';
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ===== SISTEMA FINANCEIRO =====
function addTransaction() {
    const type = document.getElementById('transactionType').value;
    const desc = document.getElementById('transactionDesc').value.trim();
    const amount = parseFloat(document.getElementById('transactionAmount').value);
    
    if (!desc || isNaN(amount) || amount <= 0) {
        showToast('⚠️ Preencha todos os campos corretamente!', 'error');
        return;
    }
    
    const transaction = {
        id: Date.now(),
        type: type,
        description: desc,
        amount: amount,
        date: new Date().toISOString()
    };
    
    transactions.push(transaction);
    saveTransactions();
    loadTransactions();
    
    // Limpar campos
    document.getElementById('transactionDesc').value = '';
    document.getElementById('transactionAmount').value = '';
    
    // Adicionar XP por controle financeiro
    addXP(5);
    showToast('💰 Transação registrada! +5 XP');
    
    // Focar no próximo campo
    document.getElementById('transactionDesc').focus();
}

function loadTransactions() {
    const transactionList = document.getElementById('transactionList');
    let balance = 0;
    
    transactionList.innerHTML = '';
    
    // Ordenar por data (mais recente primeiro)
    const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    ).slice(0, 10); // Mostrar apenas 10 últimas
    
    sortedTransactions.forEach(transaction => {
        const isIncome = transaction.type === 'income';
        balance += isIncome ? transaction.amount : -transaction.amount;
        
        const li = document.createElement('li');
        li.className = 'transaction-item';
        li.innerHTML = `
            <div class="transaction-info">
                <span class="transaction-desc">${transaction.description}</span>
                <span class="transaction-date">${new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
            </div>
            <span class="transaction-amount ${isIncome ? 'income' : 'expense'}">
                ${isIncome ? '+' : '-'} R$ ${transaction.amount.toFixed(2)}
            </span>
        `;
        transactionList.appendChild(li);
    });
    
    // Atualizar saldo
    const formattedBalance = balance.toFixed(2);
    document.getElementById('balanceValue').textContent = `R$ ${formattedBalance}`;
    document.getElementById('currentBalance').textContent = `R$ ${Math.floor(balance)}`;
    
    // Se não houver transações, mostrar mensagem
    if (transactions.length === 0) {
        transactionList.innerHTML = '<li class="empty-message">Nenhuma transação registrada ainda.</li>';
    }
    
    saveTransactions();
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// ===== SISTEMA DE HÁBITOS =====
function loadHabits() {
    const habitsGrid = document.getElementById('habitsGrid');
    habitsGrid.innerHTML = '';
    
    habits.forEach(habit => {
        const today = new Date().toDateString();
        const completedToday = habit.completions.includes(today);
        
        const div = document.createElement('div');
        div.className = 'habit-card';
        div.innerHTML = `
            <h4>${habit.name}</h4>
            <div class="habit-streak">${habit.streak} 🔥</div>
            <div class="habit-status ${completedToday ? 'completed' : 'pending'}" 
                 onclick="toggleHabit(${habit.id})">
                ${completedToday ? '✅ Hoje' : '⚪ Pendente'}
            </div>
        `;
        habitsGrid.appendChild(div);
    });
    
    // Se não houver hábitos, mostrar mensagem
    if (habits.length === 0) {
        habitsGrid.innerHTML = '<div class="empty-message">Nenhum hábito cadastrado.</div>';
    }
}

function toggleHabit(id) {
    const habit = habits.find(h => h.id === id);
    const today = new Date().toDateString();
    
    if (!habit) return;
    
    const completedToday = habit.completions.includes(today);
    
    if (completedToday) {
        // Remover completação de hoje
        habit.completions = habit.completions.filter(d => d !== today);
        habit.streak = calculateStreak(habit.completions);
        addXP(-15);
        showToast(`➖ ${habit.name} desmarcado`, 'warning');
    } else {
        // Adicionar completação
        habit.completions.push(today);
        habit.streak = calculateStreak(habit.completions);
        addXP(15);
        showToast(`✅ ${habit.name} completado! +15 XP`);
        
        // Bônus por sequência
        if (habit.streak % 7 === 0 && habit.streak > 0) {
            addXP(50);
            showToast(`🎉 ${habit.streak} dias seguidos! +50 XP bônus!`, 'success');
        }
    }
    
    saveHabits();
    loadHabits();
    updateDashboard();
}

function calculateStreak(completions) {
    if (completions.length === 0) return 0;
    
    const sortedDates = completions.map(d => new Date(d)).sort((a, b) => b - a);
    let streak = 1;
    let currentDate = new Date(sortedDates[0]);
    
    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        
        if (sortedDates[i].toDateString() === prevDate.toDateString()) {
            streak++;
            currentDate = sortedDates[i];
        } else {
            break;
        }
    }
    
    return streak;
}

function addHabit() {
    const name = prompt('Nome do novo hábito:');
    if (name && name.trim()) {
        const habit = {
            id: Date.now(),
            name: name.trim(),
            streak: 0,
            completions: [],
            xpValue: 15
        };
        
        habits.push(habit);
        saveHabits();
        loadHabits();
        showToast('⚡ Novo hábito adicionado!');
    }
}

function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// ===== SISTEMA DE GAMIFICAÇÃO =====
function addXP(amount) {
    const oldRank = getCurrentRank();
    totalXP += amount;
    if (totalXP < 0) totalXP = 0;
    
    localStorage.setItem('totalXP', totalXP.toString());
    
    // Verificar promoção de rank
    const newRank = getCurrentRank();
    if (newRank !== oldRank && amount > 0) {
        showToast(`🎖️ PROMOÇÃO! Novo rank: ${newRank}`, 'success');
    }
    
    updateDashboard();
}

function getCurrentRank() {
    const xp = totalXP;
    let currentRank = 'RECRUTA';
    
    // Converter para array e ordenar por XP
    const rankEntries = Object.entries(RANKS)
        .map(([xpReq, rank]) => [parseInt(xpReq), rank])
        .sort((a, b) => a[0] - b[0]);
    
    for (const [requiredXP, rank] of rankEntries) {
        if (xp >= requiredXP) {
            currentRank = rank;
        } else {
            break;
        }
    }
    
    return currentRank;
}

function updateDashboard() {
    document.getElementById('totalXP').textContent = totalXP;
    document.getElementById('currentRank').textContent = getCurrentRank();
    
    // Atualizar progresso do sprint
    const sprintProgress = (sprintDay / 60) * 100;
    const progressBar = document.getElementById('sprintProgress');
    if (progressBar) {
        progressBar.style.width = `${sprintProgress}%`;
        document.getElementById('currentDay').textContent = sprintDay;
    }
}

// ===== SISTEMA DE METAS =====
function updateGoal() {
    const goalInput = document.getElementById('mainGoal');
    currentGoal = goalInput.value.trim();
    
    if (!currentGoal) {
        showToast('Digite uma meta primeiro!', 'warning');
        return;
    }
    
    localStorage.setItem('currentGoal', currentGoal);
    
    // Adicionar XP por definir meta
    addXP(25);
    showToast('🎯 Meta definida! +25 XP');
}

// ===== SISTEMA DE NOTIFICAÇÕES/TOASTS =====
function showToast(message, type = 'info') {
    // Remover toast existente
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Criar novo toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    
    // Estilos do toast
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#00C851' : type === 'warning' ? '#ffbb33' : '#33b5e5'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        font-weight: bold;
    `;
    
    document.body.appendChild(toast);
    
    // Remover após 3 segundos
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}

// Adicionar animações CSS para toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ===== SISTEMA DE SPRINT =====
function incrementSprintDay() {
    const lastUpdate = localStorage.getItem('lastSprintUpdate');
    const today = new Date().toDateString();
    
    if (lastUpdate !== today) {
        sprintDay++;
        if (sprintDay > 60) {
            sprintDay = 1;
            showToast('🎉 Sprint reiniciado! Novo ciclo começou!', 'success');
        }
        
        localStorage.setItem('sprintDay', sprintDay.toString());
        localStorage.setItem('lastSprintUpdate', today);
        updateDashboard();
        
        // Notificação diária
        showToast(`📊 Dia ${sprintDay}/60 do sprint!`, 'info');
    }
}

// ===== INICIALIZAR SPRINT AO CARREGAR =====
incrementSprintDay();

// ===== UTILITÁRIOS =====
function exportData() {
    const data = {
        tasks,
        transactions,
        habits,
        totalXP,
        currentGoal,
        sprintDay,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function() {
            try {
                const data = JSON.parse(reader.result);
                
                // Validar dados
                if (data.tasks && data.transactions && data.habits) {
                    if (confirm('Importar dados? Isso substituirá seus dados atuais.')) {
                        tasks = data.tasks || [];
                        transactions = data.transactions || [];
                        habits = data.habits || [];
                        totalXP = data.totalXP || 0;
                        currentGoal = data.currentGoal || '';
                        sprintDay = data.sprintDay || 1;
                        
                        // Salvar tudo
                        saveTasks();
                        saveTransactions();
                        saveHabits();
                        localStorage.setItem('totalXP', totalXP.toString());
                        localStorage.setItem('currentGoal', currentGoal);
                        localStorage.setItem('sprintDay', sprintDay.toString());
                        
                        // Recarregar tudo
                        updateDashboard();
                        loadTasks();
                        loadTransactions();
                        loadHabits();
                        
                        showToast('Dados importados com sucesso!', 'success');
                    }
                } else {
                    showToast('Arquivo inválido!', 'error');
                }
            } catch (err) {
                showToast('Erro ao importar dados!', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

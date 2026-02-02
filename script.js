// Sistema de Gamificação
const RANKS = {
    0: 'RECRUTA',
    100: 'SOLDADO',
    500: 'CABO',
    1000: 'SARGENTO',
    2500: 'TENENTE',
    5000: 'CAPITÃO'
};

let totalXP = parseInt(localStorage.getItem('totalXP')) || 0;
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let currentGoal = localStorage.getItem('currentGoal') || '';
let sprintDay = parseInt(localStorage.getItem('sprintDay')) || 1;

// Inicialização
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
});

// Sistema de Abas
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            showTab(tabName);
        });
    });
}

function showTab(tabName) {
    // Remover classe active de todas as abas
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Ativar aba clicada
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Sistema de Tarefas
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
        loadTasks();
    }
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        
        // Adicionar XP se completou
        if (task.completed) {
            addXP(task.xpValue);
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
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" 
                   ${task.completed ? 'checked' : ''} 
                   onchange="toggleTask(${task.id})">
            <span class="task-text ${task.completed ? 'task-completed' : ''}">
                ${task.text}
            </span>
        `;
        taskList.appendChild(li);
    });
    
    // Atualizar progresso
    const progress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
    document.getElementById('taskProgress').style.width = `${progress}%`;
    document.getElementById('taskCount').textContent = `${completedTasks}/${totalTasks} concluídas`;
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Sistema Financeiro
function addTransaction() {
    const type = document.getElementById('transactionType').value;
    const desc = document.getElementById('transactionDesc').value.trim();
    const amount = parseFloat(document.getElementById('transactionAmount').value);
    
    if (!desc || isNaN(amount) || amount <= 0) {
        alert('Preencha todos os campos corretamente!');
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
}

function loadTransactions() {
    const transactionList = document.getElementById('transactionList');
    let balance = 0;
    
    transactionList.innerHTML = '';
    
    transactions.slice(-10).reverse().forEach(transaction => {
        const isIncome = transaction.type === 'income';
        balance += isIncome ? transaction.amount : -transaction.amount;
        
        const li = document.createElement('li');
        li.className = 'transaction-item';
        li.innerHTML = `
            <div class="transaction-info">
                <span class="transaction-desc">${transaction.description}</span>
                <span class="transaction-date">${new Date(transaction.date).toLocaleDateString()}</span>
            </div>
            <span class="transaction-amount ${isIncome ? 'income' : 'expense'}">
                ${isIncome ? '+' : '-'} R$ ${transaction.amount.toFixed(2)}
            </span>
        `;
        transactionList.appendChild(li);
    });
    
    // Atualizar saldo
    document.getElementById('balanceValue').textContent = `R$ ${balance.toFixed(2)}`;
    document.getElementById('currentBalance').textContent = `R$ ${balance.toFixed(0)}`;
    
    saveTransactions();
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Sistema de Hábitos
function loadHabits() {
    const habitsGrid = document.getElementById('habitsGrid');
    habitsGrid.innerHTML = '';
    
    habits.forEach(habit => {
        const today = new Date().toDateString();
        const completedToday = habit.completions.includes(today);
        
        const div = document.createElement('div');
        div.className = 'habit-card';
        div.onclick = () => toggleHabit(habit.id);
        div.innerHTML = `
            <h4>${habit.name}</h4>
            <div class="habit-streak">${habit.streak} 🔥</div>
            <div class="habit-status">${completedToday ? '✅ Hoje' : '⚪ Pendente'}</div>
        `;
        habitsGrid.appendChild(div);
    });
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
    } else {
        // Adicionar completação
        habit.completions.push(today);
        habit.streak = calculateStreak(habit.completions);
        addXP(15);
        
        // Bônus por sequência
        if (habit.streak % 7 === 0) {
            addXP(50);
            alert(`🎉 ${habit.streak} dias seguidos! +50 XP bônus!`);
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
    }
}

function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// Sistema de Gamificação
function addXP(amount) {
    totalXP += amount;
    if (totalXP < 0) totalXP = 0;
    
    localStorage.setItem('totalXP', totalXP.toString());
    updateDashboard();
}

function getCurrentRank() {
    const xp = totalXP;
    let currentRank = 'RECRUTA';
    
    for (const [requiredXP, rank] of Object.entries(RANKS)) {
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
    document.getElementById('sprintProgress').style.width = `${sprintProgress}%`;
    document.getElementById('currentDay').textContent = sprintDay;
}

// Sistema de Metas
function updateGoal() {
    const goalInput = document.getElementById('mainGoal');
    currentGoal = goalInput.value;
    localStorage.setItem('currentGoal', currentGoal);
    alert('Meta salva!');
    
    // Adicionar XP por definir meta
    addXP(25);
}

// Sistema de Notificações
function showNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: message });
    }
}

// Incrementar dia do sprint (executar uma vez por dia)
function incrementSprintDay() {
    const lastUpdate = localStorage.getItem('lastSprintUpdate');
    const today = new Date().toDateString();
    
    if (lastUpdate !== today) {
        sprintDay++;
        if (sprintDay > 60) sprintDay = 1; // Reiniciar sprint
        
        localStorage.setItem('sprintDay', sprintDay.toString());
        localStorage.setItem('lastSprintUpdate', today);
        updateDashboard();
        
        // Notificação diária
        showNotification('📊 Seu Dashboard', `Dia ${sprintDay}/60 do sprint!`);
    }
}

// Executar ao carregar
incrementSprintDay();
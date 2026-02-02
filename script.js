// ===== DADOS GLOBAIS =====
let finances = {
    income: 100000,
    expenses: 1998.43,
    savings: 38338,
    balance: 136339.57,
    savingsRate: 98.0,
    budget: {
        total: 5000,
        spent: 1998.43,
        remaining: 3001.57
    },
    categories: [
        { name: "Marília", value: 800, color: "#4f46e5" },
        { name: "Alimentação", value: 450, color: "#10b981" },
        { name: "Transporte", value: 300, color: "#f59e0b" },
        { name: "Lazer", value: 200, color: "#ef4444" }
    ],
    transactions: []
};

let routine = {
    mostDone: { name: "Devocional", count: 20 },
    month: { name: "Janeiro", activeDays: 10 },
    today: {
        date: "Sábado, 24 de Janeiro",
        completed: 1,
        total: 7,
        percentage: 14
    },
    habits: [
        { id: 1, name: "Beber 4L de água", points: 45, completed: false, streak: 5 },
        { id: 2, name: "Devocional", points: 25, completed: true, streak: 20 },
        { id: 3, name: "Dieta", points: 45, completed: false, streak: 3 },
        { id: 4, name: "Ler 20 páginas por dia", points: 25, completed: false, streak: 8 },
        { id: 5, name: "Ler 3 capítulos da bíblia", points: 25, completed: false, streak: 15 },
        { id: 6, name: "Organizar quarto", points: 30, completed: false, streak: 2 },
        { id: 7, name: "Treino Jiu jitsu", points: 55, completed: false, streak: 10 }
    ]
};

let trails = [
    {
        id: 1,
        name: "FRANCÊS 90 DIAS",
        type: "Trilha A",
        totalDays: 90,
        completedDays: 40,
        currentStreak: 12,
        level: "Intermediário",
        progress: 45
    }
];

let goals = [];

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados do localStorage
    loadAllData();
    
    // Inicializar data
    updateDates();
    
    // Inicializar abas
    initializeTabs();
    
    // Carregar todos os módulos
    loadFinances();
    loadRoutine();
    loadTrails();
    loadGoals();
    loadMenuStats();
    
    // Configurar eventos
    setupEventListeners();
    
    // Mostrar notificação de boas-vindas
    setTimeout(() => {
        showToast("📱 Dashboard carregado com sucesso!");
    }, 1000);
});

// ===== SISTEMA DE ABAS =====
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Remover classe active de todas as abas
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Adicionar classe active na aba clicada
            tab.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Salvar aba ativa
            localStorage.setItem('activeTab', tabId);
        });
    });
    
    // Restaurar aba ativa
    const activeTab = localStorage.getItem('activeTab') || 'finances';
    document.querySelector(`[data-tab="${activeTab}"]`).classList.add('active');
    document.getElementById(`${activeTab}-tab`).classList.add('active');
}

// ===== SISTEMA DE DATAS =====
function updateDates() {
    const now = new Date();
    const months = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", 
                   "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    
    // Atualizar data no cabeçalho
    document.getElementById('currentDate').textContent = 
        `${months[now.getMonth()]} ${now.getFullYear()}`;
    document.getElementById('currentDay').textContent = 
        `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()].toLowerCase()}`;
    
    // Atualizar data na rotina
    routine.today.date = `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()].toLowerCase()}`;
    document.getElementById('todayDate').textContent = `HOJE - ${routine.today.date}`;
}

// ===== MÓDULO: FINANÇAS =====
function loadFinances() {
    // Atualizar valores financeiros
    document.querySelector('.summary-card.income h3').textContent = 
        formatCurrency(finances.income);
    document.querySelector('.summary-card.expense h3').textContent = 
        formatCurrency(finances.expenses);
    document.querySelector('.total-balance h2').textContent = 
        formatCurrency(finances.balance);
    document.querySelector('.savings-header h3').textContent = 
        `+${finances.savingsRate.toFixed(1)}%`;
    
    // Atualizar orçamento
    const budgetSpent = document.querySelector('.budget-card p');
    const budgetRemaining = document.querySelector('.remaining');
    const budgetProgress = document.querySelector('.budget-progress');
    
    budgetSpent.textContent = 
        `${formatCurrency(finances.budget.spent)} gastos de ${formatCurrency(finances.budget.total)}`;
    budgetRemaining.textContent = 
        `Restante: ${formatCurrency(finances.budget.remaining)}`;
    
    const progressPercentage = (finances.budget.spent / finances.budget.total) * 100;
    budgetProgress.style.width = `${progressPercentage}%`;
    
    // Atualizar categorias
    const categoriesList = document.querySelector('.categories-list');
    categoriesList.innerHTML = '';
    
    finances.categories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.innerHTML = `
            <div class="category-color" style="background-color: ${category.color};"></div>
            <span>${category.name}</span>
            <span class="category-value">${formatCurrency(category.value)}</span>
        `;
        categoriesList.appendChild(categoryItem);
    });
    
    // Carregar transações
    loadTransactions();
}

function loadTransactions() {
    const transactionList = document.getElementById('transactionList');
    
    // Gerar transações de exemplo se não houver
    if (finances.transactions.length === 0) {
        finances.transactions = [
            { id: 1, type: 'income', description: 'Salário', amount: 3500, date: '2026-01-24', category: 'salary' },
            { id: 2, type: 'expense', description: 'Supermercado', amount: 450, date: '2026-01-23', category: 'food' },
            { id: 3, type: 'expense', description: 'Transporte', amount: 120, date: '2026-01-22', category: 'transport' },
            { id: 4, type: 'expense', description: 'Academia', amount: 89.90, date: '2026-01-21', category: 'health' },
            { id: 5, type: 'income', description: 'Freelance', amount: 800, date: '2026-01-20', category: 'other' }
        ];
        saveData('finances', finances);
    }
    
    transactionList.innerHTML = '';
    
    finances.transactions.slice(0, 5).forEach(transaction => {
        const transactionItem = document.createElement('div');
        transactionItem.className = 'transaction-item';
        transactionItem.innerHTML = `
            <div class="transaction-info">
                <span class="transaction-desc">${transaction.description}</span>
                <span class="transaction-date">${formatDate(transaction.date)}</span>
            </div>
            <span class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}
            </span>
        `;
        transactionList.appendChild(transactionItem);
    });
}

function showAddTransactionModal() {
    const modal = document.getElementById('transactionModal');
    const dateInput = document.getElementById('modalTransactionDate');
    
    // Definir data atual como padrão
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    // Mostrar modal
    modal.style.display = 'flex';
}

function closeTransactionModal() {
    document.getElementById('transactionModal').style.display = 'none';
    clearTransactionForm();
}

function clearTransactionForm() {
    document.getElementById('modalTransactionDesc').value = '';
    document.getElementById('modalTransactionAmount').value = '';
    document.getElementById('modalTransactionCategory').value = 'other';
    document.getElementById('modalTransactionType').value = 'expense';
}

function saveTransaction() {
    const type = document.getElementById('modalTransactionType').value;
    const description = document.getElementById('modalTransactionDesc').value.trim();
    const amount = parseFloat(document.getElementById('modalTransactionAmount').value);
    const category = document.getElementById('modalTransactionCategory').value;
    const date = document.getElementById('modalTransactionDate').value;
    
    // Validação
    if (!description || isNaN(amount) || amount <= 0) {
        showToast("⚠️ Preencha todos os campos corretamente!", "error");
        return;
    }
    
    // Criar nova transação
    const newTransaction = {
        id: Date.now(),
        type: type,
        description: description,
        amount: amount,
        category: category,
        date: date
    };
    
    // Adicionar à lista
    finances.transactions.unshift(newTransaction);
    
    // Atualizar finanças
    if (type === 'income') {
        finances.income += amount;
        finances.balance += amount;
    } else {
        finances.expenses += amount;
        finances.budget.spent += amount;
        finances.budget.remaining = finances.budget.total - finances.budget.spent;
        finances.balance -= amount;
        
        // Adicionar à categoria correspondente
        const categoryIndex = finances.categories.findIndex(c => 
            c.name.toLowerCase() === getCategoryName(category).toLowerCase());
        
        if (categoryIndex !== -1) {
            finances.categories[categoryIndex].value += amount;
        }
    }
    
    // Recalcular taxa de economia
    finances.savingsRate = ((finances.savings / finances.income) * 100).toFixed(1);
    
    // Salvar e atualizar
    saveData('finances', finances);
    loadFinances();
    closeTransactionModal();
    
    showToast("💰 Transação adicionada com sucesso!");
}

function getCategoryName(categoryKey) {
    const categories = {
        'salary': 'Salário',
        'food': 'Alimentação',
        'transport': 'Transporte',
        'entertainment': 'Lazer',
        'health': 'Saúde',
        'education': 'Educação',
        'other': 'Outros'
    };
    return categories[categoryKey] || 'Outros';
}

// ===== MÓDULO: ROTINA =====
function loadRoutine() {
    // Atualizar estatísticas
    document.querySelector('.routine-stats .stat-card:first-child h3').textContent = 
        routine.mostDone.name;
    document.querySelector('.routine-stats .stat-card:first-child p').textContent = 
        `${routine.mostDone.count}x`;
    
    document.querySelector('.routine-stats .stat-card:last-child h3').textContent = 
        routine.month.name;
    document.querySelector('.routine-stats .stat-card:last-child p').textContent = 
        `${routine.month.activeDays} ativos`;
    
    // Atualizar hoje
    document.getElementById('todayDate').textContent = `HOJE - ${routine.today.date}`;
    document.getElementById('todayCompleted').textContent = 
        `${routine.today.completed}/${routine.today.total}`;
    document.getElementById('todayPercentage').textContent = 
        `${routine.today.percentage}%`;
    
    // Carregar hábitos
    loadHabits();
    
    // Atualizar gráfico da semana
    updateWeekChart();
}

function loadHabits() {
    const habitsList = document.getElementById('habitsList');
    habitsList.innerHTML = '';
    
    // Ordenar hábitos: completados primeiro
    const sortedHabits = [...routine.habits].sort((a, b) => 
        (a.completed === b.completed) ? 0 : a.completed ? -1 : 1
    );
    
    sortedHabits.forEach(habit => {
        const habitItem = document.createElement('div');
        habitItem.className = 'habit-item';
        habitItem.innerHTML = `
            <div class="habit-checkbox ${habit.completed ? 'checked' : ''}" 
                 onclick="toggleHabit(${habit.id})">
                ${habit.completed ? '✓' : ''}
            </div>
            <div class="habit-info">
                <span class="habit-name">${habit.name}</span>
                <span class="habit-points">+${habit.points}</span>
            </div>
            <div class="habit-streak">${habit.streak} 🔥</div>
        `;
        habitsList.appendChild(habitItem);
    });
    
    // Atualizar contadores
    updateHabitCounters();
}

function toggleHabit(habitId) {
    const habit = routine.habits.find(h => h.id === habitId);
    if (!habit) return;
    
    habit.completed = !habit.completed;
    
    // Atualizar contadores
    if (habit.completed) {
        routine.today.completed++;
        habit.streak++;
        
        // Atualizar "mais feito"
        if (habit.streak > routine.mostDone.count) {
            routine.mostDone = { name: habit.name, count: habit.streak };
        }
        
        showToast(`✅ ${habit.name} completado! +${habit.points} pontos`);
    } else {
        routine.today.completed--;
        habit.streak = Math.max(0, habit.streak - 1);
    }
    
    // Recalcular porcentagem
    routine.today.percentage = Math.round((routine.today.completed / routine.today.total) * 100);
    
    // Salvar e atualizar
    saveData('routine', routine);
    loadRoutine();
}

function addNewHabit() {
    const nameInput = document.getElementById('newHabitInput');
    const pointsInput = document.getElementById('habitPoints');
    
    const name = nameInput.value.trim();
    const points = parseInt(pointsInput.value) || 25;
    
    if (!name) {
        showToast("⚠️ Digite um nome para o hábito!");
        nameInput.focus();
        return;
    }
    
    const newHabit = {
        id: Date.now(),
        name: name,
        points: points,
        completed: false,
        streak: 0
    };
    
    routine.habits.push(newHabit);
    routine.today.total++;
    
    // Limpar inputs
    nameInput.value = '';
    pointsInput.value = '25';
    
    // Salvar e atualizar
    saveData('routine', routine);
    loadRoutine();
    
    showToast(`⚡ Novo hábito "${name}" adicionado!`);
}

function updateHabitCounters() {
    // Atualizar contadores no cabeçalho
    document.getElementById('todayCompleted').textContent = 
        `${routine.today.completed}/${routine.today.total}`;
    document.getElementById('todayPercentage').textContent = 
        `${routine.today.percentage}%`;
    
    // Atualizar contador de dias ativos do mês
    if (routine.today.completed > 0) {
        const today = new Date().toDateString();
        const activeDays = JSON.parse(localStorage.getItem('activeDays') || '[]');
        
        if (!activeDays.includes(today)) {
            activeDays.push(today);
            localStorage.setItem('activeDays', JSON.stringify(activeDays));
            routine.month.activeDays = activeDays.length;
            saveData('routine', routine);
        }
    }
}

function updateWeekChart() {
    // Atualizar barras da semana
    const weekBars = document.querySelectorAll('.day-bar');
    const todayIndex = new Date().getDay(); // 0 = Domingo, 6 = Sábado
    
    weekBars.forEach((bar, index) => {
        // Remover classe active de todas
        bar.classList.remove('active');
        
        // Definir valores (simulação)
        const values = [80, 60, 90, 40, 70, 14, 0];
        bar.setAttribute('data-value', values[index]);
        bar.style.setProperty('--value', values[index]);
        
        // Marcar hoje como ativo
        if (index === todayIndex - 1) { // Ajuste para nossa ordem (Seg-Sáb)
            bar.classList.add('active');
        }
    });
}

// ===== MÓDULO: ATLAS/TRILHAS =====
function loadTrails() {
    const timeline = document.querySelector('.trail-timeline');
    if (!timeline) return;
    
    timeline.innerHTML = '';
    
    const trail = trails[0];
    if (!trail) return;
    
    // Atualizar cabeçalho da trilha
    document.querySelector('.trail-header h3').textContent = 
        `TRILHA A - ${trail.name}`;
    document.querySelector('.progress-value').textContent = 
        `${trail.progress}%`;
    
    // Atualizar estatísticas
    document.querySelectorAll('.trail-stat')[0].querySelector('strong').textContent = 
        `${trail.completedDays}/${trail.totalDays}`;
    document.querySelectorAll('.trail-stat')[1].querySelector('strong').textContent = 
        `${trail.currentStreak} dias`;
    document.querySelectorAll('.trail-stat')[2].querySelector('strong').textContent = 
        trail.level;
    
    // Criar linha do tempo
    for (let i = 1; i <= trail.totalDays; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'timeline-day';
        dayElement.textContent = i;
        
        if (i <= trail.completedDays) {
            dayElement.classList.add('completed');
            dayElement.title = `Dia ${i} - Concluído`;
        } else if (i === trail.completedDays + 1) {
            dayElement.classList.add('current');
            dayElement.title = `Dia ${i} - Em progresso`;
        } else {
            dayElement.classList.add('future');
            dayElement.title = `Dia ${i} - Futuro`;
        }
        
        dayElement.onclick = () => toggleTrailDay(i);
        timeline.appendChild(dayElement);
    }
}

function toggleTrailDay(day) {
    const trail = trails[0];
    if (!trail) return;
    
    if (day <= trail.completedDays) {
        // Desmarcar dia
        trail.completedDays = day - 1;
        showToast(`⏪ Dia ${day} desmarcado`);
    } else if (day === trail.completedDays + 1) {
        // Marcar dia
        trail.completedDays = day;
        trail.currentStreak++;
        
        // Verificar se quebrou a sequência anterior
        if (day > 1) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();
            const lastCompletion = localStorage.getItem('lastTrailCompletion');
            
            if (lastCompletion !== yesterdayStr) {
                trail.currentStreak = 1;
                showToast("🔁 Sequência reiniciada");
            }
        }
        
        localStorage.setItem('lastTrailCompletion', new Date().toDateString());
        showToast(`✅ Dia ${day} concluído! Sequência: ${trail.currentStreak} dias`);
        
        // Atualizar nível
        if (trail.completedDays >= 60) {
            trail.level = "Avançado";
        } else if (trail.completedDays >= 30) {
            trail.level = "Intermediário";
        }
    } else {
        showToast("⚠️ Complete os dias anteriores primeiro!");
        return;
    }
    
    // Recalcular progresso
    trail.progress = Math.round((trail.completedDays / trail.totalDays) * 100);
    
    // Salvar e atualizar
    saveData('trails', trails);
    loadTrails();
}

function createNewTrail() {
    const nameInput = document.getElementById('trailName');
    const daysInput = document.getElementById('trailDays');
    
    const name = nameInput.value.trim();
    const days = parseInt(daysInput.value);
    
    if (!name || isNaN(days) || days < 1) {
        showToast("⚠️ Preencha todos os campos corretamente!");
        return;
    }
    
    if (days > 365) {
        showToast("⚠️ A trilha não pode ter mais de 365 dias!");
        return;
    }
    
    const newTrail = {
        id: Date.now(),
        name: name.toUpperCase(),
        type: `Trilha ${String.fromCharCode(65 + trails.length)}`,
        totalDays: days,
        completedDays: 0,
        currentStreak: 0,
        level: "Iniciante",
        progress: 0
    };
    
    trails.push(newTrail);
    
    // Limpar inputs
    nameInput.value = '';
    daysInput.value = '';
    
    // Salvar e atualizar
    saveData('trails', trails);
    loadTrails();
    
    showToast(`🗺️ Nova trilha "${name}" criada!`);
}

// ===== MÓDULO: METAS =====
function loadGoals() {
    const goalsGrid = document.querySelector('.goals-grid');
    if (!goalsGrid) return;
    
    // Carregar metas salvas
    if (goals.length === 0) {
        goals = [
            {
                id: 1,
                title: "Economizar R$ 10.000",
                description: "Reserva de emergência completa",
                category: "finance",
                deadline: "2026-06-30",
                value: 10000,
                progress: 65,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: "Ler 12 livros",
                description: "Um livro por mês",
                category: "learning",
                deadline: "2026-12-31",
                value: 12,
                progress: 25,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                title: "Perder 5kg",
                description: "Alcançar peso ideal",
                category: "health",
                deadline: "2026-03-31",
                value: 5,
                progress: 40,
                createdAt: new Date().toISOString()
            }
        ];
        saveData('goals', goals);
    }
    
    goalsGrid.innerHTML = '';
    
    goals.forEach(goal => {
        const goalCard = document.createElement('div');
        goalCard.className = `goal-card ${goal.category}`;
        goalCard.innerHTML = `
            <div class="goal-header">
                <h4 class="goal-title">${goal.title}</h4>
                <div class="goal-actions">
                    <button class="goal-action-btn" onclick="editGoal(${goal.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="goal-action-btn" onclick="deleteGoal(${goal.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p class="goal-description">${goal.description}</p>
            <div class="goal-progress">
                <div class="goal-progress-bar">
                    <div class="goal-progress-fill" style="width: ${goal.progress}%"></div>
                </div>
                <div class="goal-progress-text">
                    <span>${goal.progress}%</span>
                    <span>${formatCurrency(goal.value)}</span>
                </div>
            </div>
            <div class="goal-deadline">
                <i class="far fa-calendar"></i>
                <span>${formatDate(goal.deadline)}</span>
            </div>
        `;
        goalsGrid.appendChild(goalCard);
    });
}

function addNewGoal() {
    const titleInput = document.getElementById('goalTitle');
    const descInput = document.getElementById('goalDescription');
    const categoryInput = document.getElementById('goalCategory');
    const deadlineInput = document.getElementById('goalDeadline');
    const valueInput = document.getElementById('goalValue');
    
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const category = categoryInput.value;
    const deadline = deadlineInput.value;
    const value = parseFloat(valueInput.value) || 0;
    
    if (!title || !deadline) {
        showToast("⚠️ Preencha título e data limite!");
        return;
    }
    
    const newGoal = {
        id: Date.now(),
        title: title,
        description: description,
        category: category,
        deadline: deadline,
        value: value,
        progress: 0,
        createdAt: new Date().toISOString()
    };
    
    goals.push(newGoal);
    
    // Limpar formulário
    titleInput.value = '';
    descInput.value = '';
    categoryInput.value = 'finance';
    deadlineInput.value = '';
    valueInput.value = '';
    
    // Salvar e atualizar
    saveData('goals', goals);
    loadGoals();
    
    showToast(`🎯 Nova meta "${title}" adicionada!`);
}

function editGoal(goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    // Preencher formulário com dados da meta
    document.getElementById('goalTitle').value = goal.title;
    document.getElementById('goalDescription').value = goal.description;
    document.getElementById('goalCategory').value = goal.category;
    document.getElementById('goalDeadline').value = goal.deadline;
    document.getElementById('goalValue').value = goal.value;
    
    // Rolar para o formulário
    document.querySelector('.add-goal-card').scrollIntoView({ behavior: 'smooth' });
    
    showToast(`📝 Editando meta "${goal.title}"`);
}

function deleteGoal(goalId) {
    if (!confirm("Tem certeza que deseja excluir esta meta?")) return;
    
    goals = goals.filter(g => g.id !== goalId);
    saveData('goals', goals);
    loadGoals();
    
    showToast("🗑️ Meta excluída!");
}

// ===== MÓDULO: MENU =====
function loadMenuStats() {
    // Atualizar estatísticas do menu
    document.getElementById('totalHabits').textContent = routine.habits.length;
    document.getElementById('totalTransactions').textContent = finances.transactions.length;
    document.getElementById('totalGoals').textContent = goals.length;
    
    // Calcular dias ativos
    const activeDays = JSON.parse(localStorage.getItem('activeDays') || '[]');
    document.getElementById('totalDays').textContent = activeDays.length;
}

function exportAllData() {
    const allData = {
        finances: finances,
        routine: routine,
        trails: trails,
        goals: goals,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = `dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    showToast("📤 Dados exportados com sucesso!");
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
                const importedData = JSON.parse(reader.result);
                
                if (!importedData.finances || !importedData.routine) {
                    throw new Error("Arquivo inválido");
                }
                
                if (confirm("Importar dados? Isso substituirá seus dados atuais.")) {
                    finances = importedData.finances;
                    routine = importedData.routine;
                    trails = importedData.trails || [];
                    goals = importedData.goals || [];
                    
                    // Salvar tudo
                    saveAllData();
                    
                    // Recarregar tudo
                    loadFinances();
                    loadRoutine();
                    loadTrails();
                    loadGoals();
                    loadMenuStats();
                    
                    showToast("📥 Dados importados com sucesso!", "success");
                }
            } catch (err) {
                showToast("❌ Erro ao importar dados!", "error");
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function clearAllData() {
    if (!confirm("⚠️ TEM CERTEZA? Isso apagará TODOS os seus dados permanentemente!")) {
        return;
    }
    
    // Limpar todos os dados
    finances = {
        income: 0,
        expenses: 0,
        savings: 0,
        balance: 0,
        savingsRate: 0,
        budget: { total: 0, spent: 0, remaining: 0 },
        categories: [],
        transactions: []
    };
    
    routine = {
        mostDone: { name: "Nenhum", count: 0 },
        month: { name: new Date().toLocaleString('pt-BR', { month: 'long' }), activeDays: 0 },
        today: { date: "", completed: 0, total: 0, percentage: 0 },
        habits: []
    };
    
    trails = [];
    goals = [];
    
    // Limpar localStorage
    localStorage.clear();
    
    // Recarregar tudo
    loadFinances();
    loadRoutine();
    loadTrails();
    loadGoals();
    loadMenuStats();
    
    showToast("🗑️ Todos os dados foram apagados!", "warning");
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    showToast(newTheme === 'dark' ? "🌙 Tema escuro ativado" : "☀️ Tema claro ativado");
}

function showConfig() {
    showToast("⚙️ Configurações (em desenvolvimento)");
}

function showAbout() {
    showToast("📱 Dashboard v1.0 • Desenvolvido com ❤️");
}

// ===== SISTEMA DE PERSISTÊNCIA =====
function loadAllData() {
    // Carregar tema
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    
    // Carregar dados
    finances = loadData('finances', finances);
    routine = loadData('routine', routine);
    trails = loadData('trails', trails);
    goals = loadData('goals', goals);
}

function loadData(key, defaultValue) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultValue;
    } catch (err) {
        console.error(`Erro ao carregar ${key}:`, err);
        return defaultValue;
    }
}

function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
        console.error(`Erro ao salvar ${key}:`, err);
        showToast("❌ Erro ao salvar dados!", "error");
    }
}

function saveAllData() {
    saveData('finances', finances);
    saveData('routine', routine);
    saveData('trails', trails);
    saveData('goals', goals);
}

// ===== UTILITÁRIOS =====
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    }).format(value);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    // Definir cor baseada no tipo
    const colors = {
        'info': '#4f46e5',
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b'
    };
    
    toast.textContent = message;
    toast.style.background = colors[type] || colors.info;
    toast.style.display = 'block';
    
    // Esconder após 3 segundos
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function setupEventListeners() {
    // Fechar modal ao clicar fora
    window.onclick = function(event) {
        const modal = document.getElementById('transactionModal');
        if (event.target === modal) {
            closeTransactionModal();
        }
    };
    
    // Tecla ESC fecha modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeTransactionModal();
        }
    });
}

// ===== INICIALIZAÇÃO DO SERVICE WORKER (PWA) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker registrado:', registration.scope);
            })
            .catch(error => {
                console.log('Falha no Service Worker:', error);
            });
    });
}

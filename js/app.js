// ===== CONFIGURAÇÕES GLOBAIS =====
const APP_CONFIG = {
    name: 'Trilha 1A',
    version: '2.0.0',
    apiUrl: 'https://api.trilha1a.com',
    defaultLanguage: 'pt-BR',
    theme: 'light',
    currencies: {
        'BRL': 'R$',
        'USD': '$',
        'EUR': '€'
    }
};

// ===== ESTADO DO APLICATIVO =====
const AppState = {
    user: null,
    dashboard: null,
    finance: null,
    tasks: [],
    habits: [],
    goals: [],
    notifications: [],
    currentView: 'dashboard',
    isLoading: false,
    darkMode: false
};

// ===== UTILITÁRIOS =====
const Utils = {
    // Formatação de números
    formatCurrency: (value, currency = 'BRL') => {
        const formatter = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency
        });
        return formatter.format(value);
    },

    formatNumber: (value, decimals = 2) => {
        return Number(value).toLocaleString('pt-BR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },

    formatPercentage: (value) => {
        return `${Math.round(value * 100)}%`;
    },

    // Formatação de datas
    formatDate: (date, format = 'long') => {
        const d = new Date(date);
        const options = {
            short: { day: '2-digit', month: '2-digit', year: 'numeric' },
            medium: { day: '2-digit', month: 'long', year: 'numeric' },
            long: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }
        };
        return d.toLocaleDateString('pt-BR', options[format] || options.long);
    },

    formatTime: (date) => {
        return new Date(date).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Validações
    isValidEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    isValidPassword: (password) => {
        return password.length >= 8;
    },

    // Manipulação de arrays
    groupBy: (array, key) => {
        return array.reduce((result, item) => {
            const group = item[key];
            if (!result[group]) {
                result[group] = [];
            }
            result[group].push(item);
            return result;
        }, {});
    },

    sortBy: (array, key, order = 'asc') => {
        return [...array].sort((a, b) => {
            if (order === 'asc') {
                return a[key] > b[key] ? 1 : -1;
            } else {
                return a[key] < b[key] ? 1 : -1;
            }
        });
    },

    // Local Storage
    setLocalStorage: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
        }
    },

    getLocalStorage: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Erro ao ler do localStorage:', error);
            return null;
        }
    },

    removeLocalStorage: (key) => {
        localStorage.removeItem(key);
    },

    // Debounce
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Deep clone
    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },

    // Gerar ID único
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// ===== INICIALIZAÇÃO DO APLICATIVO =====
function initializeApp() {
    console.log('🚀 Inicializando Trilha 1A...');
    
    // Carregar configurações
    loadSettings();
    
    // Carregar dados do usuário
    loadUserData();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Inicializar componentes
    initializeComponents();
    
    // Atualizar interface
    updateUI();
    
    console.log('✅ Aplicativo inicializado com sucesso!');
}

function loadSettings() {
    const settings = Utils.getLocalStorage('app_settings') || {};
    
    // Aplicar tema
    if (settings.theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        AppState.darkMode = true;
    }
    
    // Aplicar configurações
    Object.assign(AppState, settings);
}

function loadUserData() {
    const userData = Utils.getLocalStorage('user_data') || {
        id: Utils.generateId(),
        name: 'Matheus',
        email: 'matheus@exemplo.com',
        rank: 'SARGENTO',
        xp: 2450,
        avatar: 'M',
        preferences: {}
    };
    
    AppState.user = userData;
    
    // Carregar dados do dashboard
    AppState.dashboard = Utils.getLocalStorage('dashboard_data') || getDefaultDashboardData();
    
    // Carregar finanças
    AppState.finance = Utils.getLocalStorage('finance_data') || getDefaultFinanceData();
    
    // Carregar tarefas
    AppState.tasks = Utils.getLocalStorage('tasks_data') || getDefaultTasks();
    
    // Carregar hábitos
    AppState.habits = Utils.getLocalStorage('habits_data') || getDefaultHabits();
    
    // Carregar metas
    AppState.goals = Utils.getLocalStorage('goals_data') || getDefaultGoals();
    
    // Carregar notificações
    AppState.notifications = Utils.getLocalStorage('notifications') || getDefaultNotifications();
}

function getDefaultDashboardData() {
    return {
        dailyProgress: 90,
        tasksCompleted: 9,
        totalTasks: 10,
        habitsCompleted: 3,
        totalHabits: 6,
        monthlyBudget: 2637,
        xpTotal: 2450,
        rankProgress: 49,
        weeklyStats: [60, 80, 45, 90, 70, 85, 95]
    };
}

function getDefaultFinanceData() {
    return {
        period: 'DÉCEMBRO 2025',
        income: 10000,
        expenses: 2637,
        balance: 7363,
        categories: [
            { name: 'Moradia', spent: 1500, budget: 2500 },
            { name: 'Alimentação', spent: 746, budget: 1500 },
            { name: 'Transporte', spent: 124, budget: 250 },
            { name: 'Saúde', spent: 67, budget: 200 },
            { name: 'Lazer', spent: 200, budget: 450 },
            { name: 'Educação', spent: 0, budget: 850 },
            { name: 'Assinaturas', spent: 0, budget: 125 }
        ]
    };
}

function getDefaultTasks() {
    return [
        { id: Utils.generateId(), text: 'Treinar', completed: true, time: '07:00', priority: 'high' },
        { id: Utils.generateId(), text: '45 minutos de inglês', completed: true, time: '10:00', priority: 'medium' },
        { id: Utils.generateId(), text: 'Dieta', completed: false, time: '12:00', priority: 'high' },
        { id: Utils.generateId(), text: 'Reunião com equipe', completed: false, time: '14:00', priority: 'medium' },
        { id: Utils.generateId(), text: 'Estudar programação', completed: false, time: '16:00', priority: 'high' }
    ];
}

function getDefaultHabits() {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 8);
    
    return [
        {
            id: Utils.generateId(),
            name: 'ACORDAR CEDO',
            description: 'Acordar às 5h da manhã',
            frequency: 'daily',
            days: [true, true, false, true, false, false, false, false, false],
            streak: 2,
            bestStreak: 5
        },
        {
            id: Utils.generateId(),
            name: 'TREINO DIÁRIO',
            description: 'Treino físico de 45 minutos',
            frequency: 'daily',
            days: [true, true, true, true, false, false, false, false, false],
            streak: 4,
            bestStreak: 7
        },
        {
            id: Utils.generateId(),
            name: 'LEITURA 30MIN',
            description: 'Leitura de desenvolvimento pessoal',
            frequency: 'daily',
            days: [true, false, false, false, false, false, false, false, false],
            streak: 1,
            bestStreak: 3
        },
        {
            id: Utils.generateId(),
            name: 'LER A BÍBLIA/MEDITAR',
            description: 'Momento espiritual diário',
            frequency: 'daily',
            days: [false, false, false, false, false, false, false, false, false],
            streak: 0,
            bestStreak: 0
        },
        {
            id: Utils.generateId(),
            name: 'BEBER 3L ÁGUA',
            description: 'Hidratação adequada',
            frequency: 'daily',
            days: [true, true, false, false, false, false, false, false, false],
            streak: 2,
            bestStreak: 4
        },
        {
            id: Utils.generateId(),
            name: 'SEM CELULAR 1H',
            description: 'Desconectar 1 hora antes de dormir',
            frequency: 'daily',
            days: [false, false, false, false, false, false, false, false, false],
            streak: 0,
            bestStreak: 0
        }
    ];
}

function getDefaultGoals() {
    return [
        {
            id: Utils.generateId(),
            title: 'Treino Físico',
            description: '30 dias consecutivos de treino',
            icon: 'dumbbell',
            progress: 70,
            target: 100,
            deadline: '2026-02-28',
            category: 'saude'
        },
        {
            id: Utils.generateId(),
            title: 'Leitura',
            description: 'Ler 12 livros este ano',
            icon: 'book',
            progress: 25,
            target: 100,
            deadline: '2026-12-31',
            category: 'educacao'
        },
        {
            id: Utils.generateId(),
            title: 'Economia',
            description: 'Economizar R$ 10.000 este ano',
            icon: 'piggy-bank',
            progress: 45,
            target: 100,
            deadline: '2026-12-31',
            category: 'financas'
        }
    ];
}

function getDefaultNotifications() {
    return [
        { id: Utils.generateId(), title: 'Nova conquista!', message: 'Você completou 7 dias de treino consecutivo', type: 'success', read: false, time: '2h atrás' },
        { id: Utils.generateId(), title: 'Meta próxima', message: 'Faltam 3 dias para completar o desafio de leitura', type: 'info', read: false, time: '1d atrás' },
        { id: Utils.generateId(), title: 'Orçamento alerta', message: 'Gasto com alimentação chegou a 80% do orçamento', type: 'warning', read: true, time: '2d atrás' }
    ];
}

// ===== CONFIGURAÇÃO DE EVENT LISTENERS =====
function setupEventListeners() {
    // Navegação
    document.addEventListener('click', handleNavigation);
    
    // Botões principais
    document.addEventListener('click', handleButtons);
    
    // Formulários
    document.addEventListener('submit', handleForms);
    
    // Checkboxes e radios
    document.addEventListener('change', handleCheckboxes);
    
    // Modais
    document.addEventListener('click', handleModals);
    
    // Teclado
    document.addEventListener('keydown', handleKeyboard);
    
    // Redimensionamento
    window.addEventListener('resize', Utils.debounce(handleResize, 250));
    
    // Before unload
    window.addEventListener('beforeunload', handleBeforeUnload);
}

function handleNavigation(e) {
    const navLink = e.target.closest('.nav-link');
    if (navLink) {
        e.preventDefault();
        const view = navLink.dataset.view || 'dashboard';
        navigateTo(view);
        
        // Atualizar navegação ativa
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        navLink.classList.add('active');
    }
}

function handleButtons(e) {
    const button = e.target.closest('button');
    if (!button) return;
    
    const action = button.id || button.dataset.action;
    
    switch (action) {
        case 'atlasBtn':
            handleAtlasButton();
            break;
        case 'addTransactionBtn':
            showTransactionModal();
            break;
        case 'addTaskBtn':
            showTaskModal();
            break;
        case 'newHabitBtn':
            showHabitModal();
            break;
        case 'viewReportsBtn':
            showReports();
            break;
        case 'toggleTheme':
            toggleTheme();
            break;
        case 'toggleMenu':
            toggleMobileMenu();
            break;
        case 'logout':
            handleLogout();
            break;
    }
}

function handleForms(e) {
    e.preventDefault();
    const form = e.target;
    const formId = form.id;
    
    switch (formId) {
        case 'transactionForm':
            handleTransactionSubmit(form);
            break;
        case 'taskForm':
            handleTaskSubmit(form);
            break;
        case 'habitForm':
            handleHabitSubmit(form);
            break;
        case 'goalForm':
            handleGoalSubmit(form);
            break;
        case 'settingsForm':
            handleSettingsSubmit(form);
            break;
    }
}

function handleCheckboxes(e) {
    const checkbox = e.target;
    
    if (checkbox.classList.contains('task-checkbox')) {
        toggleTaskCompletion(checkbox.dataset.taskId);
    } else if (checkbox.classList.contains('day-checkbox')) {
        toggleHabitDay(checkbox.dataset.habitId, checkbox.dataset.dayIndex);
    }
}

function handleModals(e) {
    const modalClose = e.target.closest('.modal-close, .modal-cancel');
    if (modalClose) {
        closeModal(modalClose.closest('.modal-overlay'));
    }
    
    if (e.target.classList.contains('modal-overlay')) {
        closeModal(e.target);
    }
}

function handleKeyboard(e) {
    // Ctrl + S para salvar
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveAllData();
        showNotification('Tudo salvo com sucesso!', 'success');
    }
    
    // Esc para fechar modais
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal-overlay.active');
        if (openModal) {
            closeModal(openModal);
        }
    }
    
    // Navegação por teclado
    if (e.altKey) {
        switch (e.key) {
            case '1':
                navigateTo('dashboard');
                break;
            case '2':
                navigateTo('finance');
                break;
            case '3':
                navigateTo('tasks');
                break;
            case '4':
                navigateTo('habits');
                break;
            case '5':
                navigateTo('progress');
                break;
        }
    }
}

function handleResize() {
    // Atualizar layout responsivo
    updateResponsiveLayout();
}

function handleBeforeUnload(e) {
    // Salvar dados antes de sair
    saveAllData();
    
    // Mostrar mensagem de confirmação
    e.preventDefault();
    e.returnValue = '';
}

// ===== FUNÇÕES DE NAVEGAÇÃO =====
function navigateTo(view) {
    AppState.currentView = view;
    updateUI();
    
    // Rolar para o topo
    window.scrollTo(0, 0);
    
    // Registrar no histórico
    history.pushState({ view }, '', `#${view}`);
    
    console.log(`Navegado para: ${view}`);
}

// ===== ATUALIZAÇÃO DA INTERFACE =====
function updateUI() {
    // Atualizar data atual
    updateCurrentDate();
    
    // Atualizar informações do usuário
    updateUserInfo();
    
    // Carregar view atual
    loadView(AppState.currentView);
    
    // Atualizar estatísticas
    updateStats();
    
    // Atualizar notificações
    updateNotifications();
    
    // Atualizar tema
    updateTheme();
}

function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = Utils.formatDate(new Date(), 'long');
    }
}

function updateUserInfo() {
    const user = AppState.user;
    if (!user) return;
    
    // Atualizar nome
    const nameElements = document.querySelectorAll('.user-name');
    nameElements.forEach(el => {
        el.textContent = user.name;
    });
    
    // Atualizar rank
    const rankElements = document.querySelectorAll('.user-rank, .rank-title');
    rankElements.forEach(el => {
        if (el.classList.contains('user-rank')) {
            el.textContent = `Nível: ${user.rank}`;
        } else {
            el.textContent = user.rank;
        }
    });
    
    // Atualizar XP
    const xpElements = document.querySelectorAll('.user-xp, .rank-progress-text');
    xpElements.forEach(el => {
        if (el.classList.contains('user-xp')) {
            el.textContent = `${user.xp} XP`;
        }
    });
    
    // Atualizar avatar
    const avatarElements = document.querySelectorAll('.user-avatar');
    avatarElements.forEach(el => {
        el.textContent = user.avatar || user.name.charAt(0);
    });
}

function loadView(view) {
    const appContainer = document.getElementById('appContainer');
    if (!appContainer) return;
    
    let html = '';
    
    switch (view) {
        case 'dashboard':
            html = getDashboardHTML();
            break;
        case 'finance':
            html = getFinanceHTML();
            break;
        case 'tasks':
            html = getTasksHTML();
            break;
        case 'habits':
            html = getHabitsHTML();
            break;
        case 'progress':
            html = getProgressHTML();
            break;
        case 'settings':
            html = getSettingsHTML();
            break;
        default:
            html = getDashboardHTML();
    }
    
    // Atualizar apenas o conteúdo principal
    const mainContent = appContainer.querySelector('.main-content');
    if (mainContent) {
        mainContent.innerHTML = html;
    } else {
        // Primeira carga
        appContainer.innerHTML = getSidebarHTML() + html;
    }
    
    // Inicializar componentes específicos da view
    initializeViewComponents(view);
}

function getSidebarHTML() {
    return `
        <aside class="sidebar">
            <div class="sidebar-header">
                <a href="#" class="sidebar-logo" data-view="dashboard">
                    <div class="logo-icon">1A</div>
                    <div class="logo-text">TRILHA <span>1A</span></div>
                </a>
            </div>
            
            <nav class="sidebar-nav">
                <div class="nav-section">
                    <h3 class="nav-title">Principal</h3>
                    <ul class="nav-list">
                        <li class="nav-item">
                            <a href="#" class="nav-link active" data-view="dashboard">
                                <i class="fas fa-home nav-icon"></i>
                                <span>Dashboard</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#" class="nav-link" data-view="finance">
                                <i class="fas fa-chart-line nav-icon"></i>
                                <span>Financeiro</span>
                                <span class="nav-badge">${AppState.notifications.filter(n => !n.read).length}</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#" class="nav-link" data-view="tasks">
                                <i class="fas fa-tasks nav-icon"></i>
                                <span>Tarefas</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#" class="nav-link" data-view="habits">
                                <i class="fas fa-calendar-check nav-icon"></i>
                                <span>Rotina</span>
                            </a>
                        </li>
                    </ul>
                </div>
                
                <div class="nav-section">
                    <h3 class="nav-title">Progresso</h3>
                    <ul class="nav-list">
                        <li class="nav-item">
                            <a href="#" class="nav-link" data-view="progress">
                                <i class="fas fa-chart-bar nav-icon"></i>
                                <span>Progresso</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#" class="nav-link">
                                <i class="fas fa-trophy nav-icon"></i>
                                <span>Conquistas</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#" class="nav-link">
                                <i class="fas fa-bullseye nav-icon"></i>
                                <span>Metas</span>
                            </a>
                        </li>
                    </ul>
                </div>
                
                <div class="nav-section">
                    <h3 class="nav-title">Configurações</h3>
                    <ul class="nav-list">
                        <li class="nav-item">
                            <a href="#" class="nav-link" data-view="settings">
                                <i class="fas fa-cog nav-icon"></i>
                                <span>Configurações</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#" class="nav-link">
                                <i class="fas fa-question-circle nav-icon"></i>
                                <span>Ajuda</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#" class="nav-link" data-action="logout">
                                <i class="fas fa-sign-out-alt nav-icon"></i>
                                <span>Sair</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
            
            <div class="sidebar-footer">
                <div class="user-profile">
                    <div class="user-avatar">${AppState.user?.avatar || 'M'}</div>
                    <div class="user-info">
                        <div class="user-name">${AppState.user?.name || 'Matheus'}</div>
                        <div class="user-rank">Nível: ${AppState.user?.rank || 'SARGENTO'}</div>
                        <div class="user-xp">${AppState.user?.xp || 2450} XP</div>
                    </div>
                    <button class="btn btn-icon" id="toggleTheme" title="Alternar tema">
                        <i class="fas fa-moon"></i>
                    </button>
                </div>
            </div>
        </aside>
        
        <button class="mobile-menu-toggle" id="toggleMenu">
            <i class="fas fa-bars"></i>
        </button>
        <div class="sidebar-overlay" id="sidebarOverlay"></div>
    `;
}

// ===== FUNÇÕES ESPECÍFICAS DAS VIEWS =====
function getDashboardHTML() {
    return `
        <div class="main-content">
            <div class="header">
                <div class="header-left">
                    <h1 class="page-title">Dashboard</h1>
                    <div class="current-date" id="currentDate"></div>
                </div>
                <div class="header-right">
                    <button class="atlas-btn" id="atlasBtn">
                        <i class="fas fa-robot"></i>
                        FALAR COM O ATLAS
                    </button>
                    <div class="notification-bell" id="notificationBell">
                        <i class="fas fa-bell"></i>
                        <span class="notification-count">${AppState.notifications.filter(n => !n.read).length}</span>
                    </div>
                </div>
            </div>
            
            <div class="quick-stats" id="quickStats">
                <!-- Preenchido dinamicamente -->
            </div>
            
            <div class="dashboard-grid" id="dashboardGrid">
                <!-- Preenchido dinamicamente -->
            </div>
        </div>
    `;
}

function initializeViewComponents(view) {
    switch (view) {
        case 'dashboard':
            initializeDashboard();
            break;
        case 'finance':
            initializeFinance();
            break;
        case 'tasks':
            initializeTasks();
            break;
        case 'habits':
            initializeHabits();
            break;
        case 'progress':
            initializeProgress();
            break;
        case 'settings':
            initializeSettings();
            break;
    }
}

function initializeDashboard() {
    // Atualizar estatísticas rápidas
    updateQuickStats();
    
    // Carregar grid do dashboard
    loadDashboardGrid();
    
    // Configurar gráficos
    initializeCharts();
}

function updateQuickStats() {
    const container = document.getElementById('quickStats');
    if (!container) return;
    
    const stats = calculateQuickStats();
    
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-tasks"></i>
            </div>
            <div class="stat-info">
                <div class="stat-value">${stats.tasksCompleted}/${stats.totalTasks}</div>
                <div class="stat-label">Tarefas Hoje</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-calendar-check"></i>
            </div>
            <div class="stat-info">
                <div class="stat-value">${stats.habitsCompleted}</div>
                <div class="stat-label">Hábitos Concluídos</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-wallet"></i>
            </div>
            <div class="stat-info">
                <div class="stat-value">${Utils.formatCurrency(stats.monthlyBudget)}</div>
                <div class="stat-label">Orçamento Mensal</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-trophy"></i>
            </div>
            <div class="stat-info">
                <div class="stat-value">${stats.xpTotal}</div>
                <div class="stat-label">XP Total</div>
            </div>
        </div>
    `;
}

function calculateQuickStats() {
    const today = new Date().toDateString();
    
    return {
        tasksCompleted: AppState.tasks.filter(t => t.completed).length,
        totalTasks: AppState.tasks.length,
        habitsCompleted: AppState.habits.filter(h => h.days[h.days.length - 1]).length,
        monthlyBudget: AppState.finance?.balance || 0,
        xpTotal: AppState.user?.xp || 0
    };
}

function loadDashboardGrid() {
    const grid = document.getElementById('dashboardGrid');
    if (!grid) return;
    
    grid.innerHTML = `
        <!-- Card Financeiro -->
        <div class="card card-large">
            ${getFinanceCardHTML()}
        </div>
        
        <!-- Card Resumo do Dia -->
        <div class="card">
            ${getDailySummaryCardHTML()}
        </div>
        
        <!-- Card Rotina -->
        <div class="card card-large">
            ${getRoutineCardHTML()}
        </div>
        
        <!-- Card Progresso Atlas -->
        <div class="card">
            ${getProgressCardHTML()}
        </div>
    `;
    
    // Inicializar interatividade
    initializeCardInteractions();
}

// ... (continuação com todas as outras funções)

// ===== FUNÇÕES DE GERENCIAMENTO =====
function saveAllData() {
    console.log('💾 Salvando todos os dados...');
    
    // Salvar configurações
    Utils.setLocalStorage('app_settings', {
        theme: AppState.darkMode ? 'dark' : 'light',
        language: APP_CONFIG.defaultLanguage
    });
    
    // Salvar dados do usuário
    Utils.setLocalStorage('user_data', AppState.user);
    
    // Salvar outros dados
    Utils.setLocalStorage('dashboard_data', AppState.dashboard);
    Utils.setLocalStorage('finance_data', AppState.finance);
    Utils.setLocalStorage('tasks_data', AppState.tasks);
    Utils.setLocalStorage('habits_data', AppState.habits);
    Utils.setLocalStorage('goals_data', AppState.goals);
    Utils.setLocalStorage('notifications', AppState.notifications);
    
    console.log('✅ Dados salvos com sucesso!');
}

function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Animação de entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Fechar automaticamente
    const autoClose = setTimeout(() => {
        closeNotification(notification);
    }, duration);
    
    // Fechar manualmente
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(autoClose);
        closeNotification(notification);
    });
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'warning': return 'exclamation-triangle';
        case 'danger': return 'times-circle';
        default: return 'info-circle';
    }
}

function closeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        notification.remove();
    }, 300);
}

// ===== EXPORTAÇÃO =====
window.Trilha1A = {
    init: initializeApp,
    state: AppState,
    utils: Utils,
    config: APP_CONFIG,
    
    // Métodos públicos
    saveData: saveAllData,
    showNotification: showNotification,
    navigateTo: navigateTo,
    
    // Eventos
    on: function(event, callback) {
        document.addEventListener(`trilha1a:${event}`, callback);
    },
    
    emit: function(event, data) {
        document.dispatchEvent(new CustomEvent(`trilha1a:${event}`, { detail: data }));
    }
};

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

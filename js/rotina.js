// ===== MÓDULO DE ROTINA E HÁBITOS =====
const RoutineModule = {
    // Dados de rotina
    data: {
        habits: [],
        routines: [],
        streaks: {},
        history: []
    },
    
    // Inicializar módulo
    init: function() {
        this.loadData();
        this.setupEventListeners();
        this.updateUI();
        this.checkDailyHabits();
    },
    
    // Carregar dados
    loadData: function() {
        const savedData = Utils.getLocalStorage('routine_module');
        if (savedData) {
            this.data = savedData;
        } else {
            this.data = this.getDefaultData();
        }
    },
    
    // Dados padrão
    getDefaultData: function() {
        const today = new Date();
        const days = [];
        
        // Gerar últimos 9 dias
        for (let i = 8; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            days.push(date.getDate());
        }
        
        return {
            habits: [
                {
                    id: 'habit-1',
                    name: 'ACORDAR CEDO',
                    description: 'Acordar às 5h da manhã',
                    icon: 'sun',
                    color: '#ffd166',
                    frequency: 'daily',
                    time: '05:00',
                    days: [true, true, false, true, false, false, false, false, false],
                    streak: 2,
                    bestStreak: 5,
                    createdAt: '2025-12-01'
                },
                {
                    id: 'habit-2',
                    name: 'TREINO DIÁRIO',
                    description: 'Treino físico de 45 minutos',
                    icon: 'dumbbell',
                    color: '#ef476f',
                    frequency: 'daily',
                    time: '07:00',
                    days: [true, true, true, true, false, false, false, false, false],
                    streak: 4,
                    bestStreak: 7,
                    createdAt: '2025-12-01'
                },
                {
                    id: 'habit-3',
                    name: 'LEITURA 30MIN',
                    description: 'Leitura de desenvolvimento pessoal',
                    icon: 'book',
                    color: '#06d6a0',
                    frequency: 'daily',
                    time: '21:00',
                    days: [true, false, false, false, false, false, false, false, false],
                    streak: 1,
                    bestStreak: 3,
                    createdAt: '2025-12-05'
                },
                {
                    id: 'habit-4',
                    name: 'LER A BÍBLIA/MEDITAR',
                    description: 'Momento espiritual diário',
                    icon: 'pray',
                    color: '#8338ec',
                    frequency: 'daily',
                    time: '06:00',
                    days: [false, false, false, false, false, false, false, false, false],
                    streak: 0,
                    bestStreak: 0,
                    createdAt: '2025-12-10'
                },
                {
                    id: 'habit-5',
                    name: 'BEBER 3L ÁGUA',
                    description: 'Hidratação adequada',
                    icon: 'tint',
                    color: '#118ab2',
                    frequency: 'daily',
                    time: null,
                    days: [true, true, false, false, false, false, false, false, false],
                    streak: 2,
                    bestStreak: 4,
                    createdAt: '2025-12-01'
                },
                {
                    id: 'habit-6',
                    name: 'SEM CELULAR 1H',
                    description: 'Desconectar 1 hora antes de dormir',
                    icon: 'mobile-alt',
                    color: '#8ac926',
                    frequency: 'daily',
                    time: '22:00',
                    days: [false, false, false, false, false, false, false, false, false],
                    streak: 0,
                    bestStreak: 0,
                    createdAt: '2025-12-15'
                }
            ],
            routines: [
                {
                    id: 'routine-1',
                    name: 'Rotina Matinal',
                    description: 'Rotina para começar bem o dia',
                    habits: ['habit-1', 'habit-4', 'habit-5'],
                    time: '05:00 - 07:00',
                    active: true
                },
                {
                    id: 'routine-2',
                    name: 'Rotina Noturna',
                    description: 'Rotina para melhorar o sono',
                    habits: ['habit-3', 'habit-6'],
                    time: '21:00 - 22:00',
                    active: true
                }
            ],
            streaks: {
                'habit-1': 2,
                'habit-2': 4,
                'habit-3': 1,
                'habit-4': 0,
                'habit-5': 2,
                'habit-6': 0
            },
            history: [
                {
                    date: '2025-12-19',
                    habitsCompleted: 3,
                    totalHabits: 6,
                    streak: 4
                }
            ]
        };
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        document.addEventListener('click', (e) => {
            // Habit day checkbox
            if (e.target.closest('.day-checkbox')) {
                const checkbox = e.target.closest('.day-checkbox');
                const habitId = checkbox.dataset.habitId;
                const dayIndex = parseInt(checkbox.dataset.dayIndex);
                
                this.toggleHabitDay(habitId, dayIndex);
            }
            
            // New habit button
            if (e.target.matches('.btn-new-habit')) {
                this.showNewHabitModal();
            }
            
            // Edit habit button
            if (e.target.matches('.btn-edit-habit')) {
                const habitId = e.target.dataset.habitId;
                this.showEditHabitModal(habitId);
            }
            
            // Delete habit button
            if (e.target.matches('.btn-delete-habit')) {
                const habitId = e.target.dataset.habitId;
                this.deleteHabit(habitId);
            }
            
            // Complete habit button
            if (e.target.matches('.btn-complete-habit')) {
                const habitId = e.target.dataset.habitId;
                this.completeHabitToday(habitId);
            }
            
            // New routine button
            if (e.target.matches('.btn-new-routine')) {
                this.showNewRoutineModal();
            }
        });
    },
    
    // Atualizar interface
    updateUI: function() {
        this.updateCalendar();
        this.updateHabitsList();
        this.updateRoutines();
        this.updateStats();
        this.updateCharts();
    },
    
    // Atualizar calendário
    updateCalendar: function() {
        const today = new Date();
        const calendarDays = [];
        
        // Gerar últimos 9 dias
        for (let i = 8; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            calendarDays.push({
                date: date,
                dayOfWeek: date.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase(),
                dayOfMonth: date.getDate(),
                isToday: i === 0
            });
        }
        
        // Atualizar cabeçalho do calendário
        const headerContainer = document.querySelector('.calendar-header');
        if (headerContainer) {
            headerContainer.innerHTML = calendarDays.map(day => 
                `<div>${day.dayOfWeek}</div>`
            ).join('');
        }
        
        // Atualizar dias do calendário
        const daysContainer = document.querySelector('.calendar-days');
        if (daysContainer) {
            daysContainer.innerHTML = calendarDays.map(day => 
                `<div class="day ${day.isToday ? 'today' : ''}">${day.dayOfMonth}</div>`
            ).join('');
        }
    },
    
    // Atualizar lista de hábitos
    updateHabitsList: function() {
        const container = document.getElementById('habitsList');
        if (!container) return;
        
        container.innerHTML = this.data.habits.map(habit => `
            <div class="habit-row" data-habit-id="${habit.id}">
                <div class="habit-info">
                    <div class="habit-icon" style="background: ${habit.color}">
                        <i class="fas fa-${habit.icon}"></i>
                    </div>
                    <div class="habit-details">
                        <div class="habit-name">${habit.name}</div>
                        <div class="habit-description">${habit.description}</div>
                        <div class="habit-streak">
                            <i class="fas fa-fire"></i>
                            Sequência: ${habit.streak} dias (Recorde: ${habit.bestStreak})
                        </div>
                    </div>
                </div>
                <div class="habit-days">
                    ${this.generateDayCheckboxes(habit)}
                </div>
                <div class="habit-actions">
                    <button class="btn btn-icon btn-complete-habit" data-habit-id="${habit.id}" title="Concluir hoje">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-icon btn-edit-habit" data-habit-id="${habit.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-icon btn-delete-habit" data-habit-id="${habit.id}" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    // Gerar checkboxes dos dias
    generateDayCheckboxes: function(habit) {
        const today = new Date();
        let html = '';
        
        for (let i = 8; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const isToday = i === 0;
            const isCompleted = habit.days[8 - i];
            
            html += `
                <div class="day-checkbox ${isCompleted ? 'checked' : ''} ${isToday ? 'today' : ''}"
                     data-habit-id="${habit.id}"
                     data-day-index="${8 - i}"
                     title="${date.toLocaleDateString('pt-BR')}">
                    ${isCompleted ? '<i class="fas fa-check"></i>' : (isToday ? 'Hoje' : date.getDate())}
                </div>
            `;
        }
        
        return html;
    },
    
    // Atualizar rotinas
    updateRoutines: function() {
        const container = document.getElementById('routinesList');
        if (!container) return;
        
        container.innerHTML = this.data.routines.map(routine => `
            <div class="routine-card">
                <div class="routine-header">
                    <h4 class="routine-name">${routine.name}</h4>
                    <span class="routine-time">${routine.time}</span>
                </div>
                <div class="routine-description">${routine.description}</div>
                <div class="routine-habits">
                    ${this.getRoutineHabitsHTML(routine)}
                </div>
                <div class="routine-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.calculateRoutineProgress(routine)}%"></div>
                    </div>
                    <span class="progress-text">${this.calculateRoutineProgress(routine)}% concluído</span>
                </div>
                <div class="routine-actions">
                    <button class="btn btn-icon" onclick="RoutineModule.toggleRoutine('${routine.id}')" title="${routine.active ? 'Desativar' : 'Ativar'}">
                        <i class="fas fa-${routine.active ? 'pause' : 'play'}"></i>
                    </button>
                    <button class="btn btn-icon" onclick="RoutineModule.editRoutine('${routine.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    // Obter HTML dos hábitos da rotina
    getRoutineHabitsHTML: function(routine) {
        const habits = this.data.habits.filter(habit => routine.habits.includes(habit.id));
        return habits.map(habit => `
            <span class="habit-tag" style="border-left-color: ${habit.color}">
                <i class="fas fa-${habit.icon}"></i>
                ${habit.name}
            </span>
        `).join('');
    },
    
    // Calcular progresso da rotina
    calculateRoutineProgress: function(routine) {
        const today = new Date().toDateString();
        const habitIds = routine.habits;
        
        // Contar hábitos concluídos hoje
        const completedToday = this.data.habits.filter(habit => 
            habitIds.includes(habit.id) && habit.days[habit.days.length - 1]
        ).length;
        
        return habitIds.length > 0 ? Math.round((completedToday / habitIds.length) * 100) : 0;
    },
    
    // Atualizar estatísticas
    updateStats: function() {
        const stats = this.calculateStats();
        
        // Atualizar containers de estatísticas
        document.querySelectorAll('.stat-habits-today').forEach(el => {
            el.textContent = `${stats.completedToday}/${stats.totalHabits}`;
        });
        
        document.querySelectorAll('.stat-streak-current').forEach(el => {
            el.textContent = stats.currentStreak;
        });
        
        document.querySelectorAll('.stat-consistency').forEach(el => {
            el.textContent = `${stats.consistency}%`;
        });
        
        document.querySelectorAll('.stat-success-rate').forEach(el => {
            el.textContent = `${stats.successRate}%`;
        });
    },
    
    // Calcular estatísticas
    calculateStats: function() {
        const today = new Date().toDateString();
        const habits = this.data.habits;
        
        // Hábitos concluídos hoje
        const completedToday = habits.filter(habit => 
            habit.days[habit.days.length - 1]
        ).length;
        
        // Sequência atual (maior sequência entre todos os hábitos)
        const currentStreak = Math.max(...habits.map(habit => habit.streak));
        
        // Consistência semanal
        const weekCompletion = habits.map(habit => {
            const last7Days = habit.days.slice(-7);
            return last7Days.filter(Boolean).length / 7;
        }).reduce((a, b) => a + b, 0) / habits.length;
        
        // Taxa de sucesso geral
        const totalCompletions = habits.reduce((sum, habit) => 
            sum + habit.days.filter(Boolean).length, 0
        );
        const totalOpportunities = habits.length * 30; // Últimos 30 dias
        const successRate = totalOpportunities > 0 ? 
            Math.round((totalCompletions / totalOpportunities) * 100) : 0;
        
        return {
            completedToday,
            totalHabits: habits.length,
            currentStreak,
            consistency: Math.round(weekCompletion * 100),
            successRate
        };
    },
    
    // Atualizar gráficos
    updateCharts: function() {
        this.updateHabitChart();
        this.updateStreakChart();
        this.updateConsistencyChart();
    },
    
    // Gráfico de hábitos
    updateHabitChart: function() {
        const ctx = document.getElementById('habitChart');
        if (!ctx) return;
        
        const habits = this.data.habits;
        const labels = habits.map(habit => habit.name);
        const successRates = habits.map(habit => {
            const completed = habit.days.filter(Boolean).length;
            return Math.round((completed / habit.days.length) * 100);
        });
        const colors = habits.map(habit => habit.color);
        
        this.renderChart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Taxa de Sucesso (%)',
                    data: successRates,
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    },
    
    // Gráfico de sequências
    updateStreakChart: function() {
        const ctx = document.getElementById('streakChart');
        if (!ctx) return;
        
        const habits = this.data.habits;
        const labels = habits.map(habit => habit.name);
        const streaks = habits.map(habit => habit.streak);
        const bestStreaks = habits.map(habit => habit.bestStreak);
        const colors = habits.map(habit => habit.color);
        
        this.renderChart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Sequência Atual',
                        data: streaks,
                        backgroundColor: colors,
                        borderColor: colors,
                        borderWidth: 1
                    },
                    {
                        label: 'Melhor Sequência',
                        data: bestStreaks,
                        backgroundColor: colors.map(c => c + '80'),
                        borderColor: colors,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: false,
                        beginAtZero: true
                    }
                }
            }
        });
    },
    
    // Gráfico de consistência
    updateConsistencyChart: function() {
        const ctx = document.getElementById('consistencyChart');
        if (!ctx) return;
        
        // Calcular consistência diária dos últimos 14 dias
        const days = [];
        const consistencyData = [];
        const today = new Date();
        
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('pt-BR', { weekday: 'short' }));
            
            // Calcular consistência deste dia
            const dayIndex = 8 + i; // Considerando os últimos 14 dias
            const dayCompletions = this.data.habits.filter(habit => 
                habit.days[dayIndex] || false
            ).length;
            
            const consistency = this.data.habits.length > 0 ? 
                Math.round((dayCompletions / this.data.habits.length) * 100) : 0;
            
            consistencyData.push(consistency);
        }
        
        this.renderChart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Consistência Diária (%)',
                    data: consistencyData,
                    borderColor: '#3a86ff',
                    backgroundColor: 'rgba(58, 134, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    },
    
    // Renderizar gráfico
    renderChart: function(ctx, config) {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js não carregado');
            return;
        }
        
        // Destruir gráfico existente
        if (ctx.chart) {
            ctx.chart.destroy();
        }
        
        // Criar novo gráfico
        ctx.chart = new Chart(ctx, config);
    },
    
    // Alternar dia do hábito
    toggleHabitDay: function(habitId, dayIndex) {
        const habit = this.data.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        // Alternar estado
        habit.days[dayIndex] = !habit.days[dayIndex];
        
        // Atualizar sequência
        this.updateHabitStreak(habit);
        
        // Salvar e atualizar
        this.saveData();
        this.updateUI();
        
        showNotification('Hábito atualizado!', 'success');
    },
    
    // Completar hábito hoje
    completeHabitToday: function(habitId) {
        const habit = this.data.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        // Marcar último dia como concluído
        habit.days[habit.days.length - 1] = true;
        
        // Atualizar sequência
        this.updateHabitStreak(habit);
        
        // Salvar e atualizar
        this.saveData();
        this.updateUI();
        
        showNotification(`${habit.name} concluído hoje!`, 'success');
    },
    
    // Atualizar sequência do hábito
    updateHabitStreak: function(habit) {
        let streak = 0;
        const days = [...habit.days].reverse(); // Do mais recente para o mais antigo
        
        for (let day of days) {
            if (day) {
                streak++;
            } else {
                break;
            }
        }
        
        habit.streak = streak;
        
        // Atualizar melhor sequência
        if (streak > habit.bestStreak) {
            habit.bestStreak = streak;
            if (streak >= 7) {
                showNotification(`🎉 Novo recorde! ${streak} dias em sequência!`, 'success');
            }
        }
    },
    
    // Adicionar novo hábito
    addHabit: function(habitData) {
        const newHabit = {
            id: Utils.generateId(),
            name: habitData.name,
            description: habitData.description || '',
            icon: habitData.icon || 'check-circle',
            color: habitData.color || '#3a86ff',
            frequency: habitData.frequency || 'daily',
            time: habitData.time || null,
            days: new Array(9).fill(false), // Últimos 9 dias
            streak: 0,
            bestStreak: 0,
            createdAt: new Date().toISOString().split('T')[0]
        };
        
        this.data.habits.push(newHabit);
        this.saveData();
        this.updateUI();
        
        showNotification('Novo hábito criado!', 'success');
    },
    
    // Editar hábito
    editHabit: function(habitId, updates) {
        const index = this.data.habits.findIndex(h => h.id === habitId);
        if (index === -1) return;
        
        this.data.habits[index] = { ...this.data.habits[index], ...updates };
        this.saveData();
        this.updateUI();
        
        showNotification('Hábito atualizado!', 'success');
    },
    
    // Excluir hábito
    deleteHabit: function(habitId) {
        if (!confirm('Tem certeza que deseja excluir este hábito?')) return;
        
        const index = this.data.habits.findIndex(h => h.id === habitId);
        if (index === -1) return;
        
        // Remover de rotinas
        this.data.routines.forEach(routine => {
            routine.habits = routine.habits.filter(id => id !== habitId);
        });
        
        // Remover hábito
        this.data.habits.splice(index, 1);
        this.saveData();
        this.updateUI();
        
        showNotification('Hábito excluído!', 'success');
    },
    
    // Adicionar rotina
    addRoutine: function(routineData) {
        const newRoutine = {
            id: Utils.generateId(),
            name: routineData.name,
            description: routineData.description || '',
            habits: routineData.habits || [],
            time: routineData.time || '',
            active: true
        };
        
        this.data.routines.push(newRoutine);
        this.saveData();
        this.updateUI();
        
        showNotification('Nova rotina criada!', 'success');
    },
    
    // Editar rotina
    editRoutine: function(routineId, updates) {
        const index = this.data.routines.findIndex(r => r.id === routineId);
        if (index === -1) return;
        
        this.data.routines[index] = { ...this.data.routines[index], ...updates };
        this.saveData();
        this.updateUI();
        
        showNotification('Rotina atualizada!', 'success');
    },
    
    // Alternar rotina ativa/inativa
    toggleRoutine: function(routineId) {
        const index = this.data.routines.findIndex(r => r.id === routineId);
        if (index === -1) return;
        
        this.data.routines[index].active = !this.data.routines[index].active;
        this.saveData();
        this.updateUI();
        
        const status = this.data.routines[index].active ? 'ativada' : 'desativada';
        showNotification(`Rotina ${status}!`, 'info');
    },
    
    // Verificar hábitos diários (executar uma vez por dia)
    checkDailyHabits: function() {
        const lastCheck = Utils.getLocalStorage('last_habit_check');
        const today = new Date().toDateString();
        
        if (lastCheck !== today) {
            // Resetar checkboxes do dia anterior (opcional)
            // Ou implementar lógica de notificação
            
            Utils.setLocalStorage('last_habit_check', today);
        }
    },
    
    // Mostrar modal de novo hábito
    showNewHabitModal: function() {
        const modalHTML = `
            <div class="modal-overlay active">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">Novo Hábito</h3>
                        <button class="modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="habitForm">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Nome do Hábito</label>
                                <input type="text" class="form-control" name="name" required placeholder="Ex: Acordar cedo">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Descrição (opcional)</label>
                                <textarea class="form-control" name="description" rows="2" placeholder="Descreva seu hábito"></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Ícone</label>
                                <div class="icon-selector">
                                    ${this.getIconOptionsHTML()}
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Cor</label>
                                <div class="color-selector">
                                    ${this.getColorOptionsHTML()}
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Horário (opcional)</label>
                                <input type="time" class="form-control" name="time">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Frequência</label>
                                <select class="form-control" name="frequency" required>
                                    <option value="daily">Diário</option>
                                    <option value="weekly">Semanal</option>
                                    <option value="monthly">Mensal</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline modal-cancel">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Criar Hábito</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Configurar submit
        document.getElementById('habitForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const selectedIcon = document.querySelector('.icon-option.selected');
            const selectedColor = document.querySelector('.color-option.selected');
            
            const habitData = {
                name: formData.get('name'),
                description: formData.get('description'),
                icon: selectedIcon ? selectedIcon.dataset.icon : 'check-circle',
                color: selectedColor ? selectedColor.dataset.color : '#3a86ff',
                frequency: formData.get('frequency'),
                time: formData.get('time') || null
            };
            
            this.addHabit(habitData);
            this.closeModal();
        });
        
        // Configurar seleção de ícones e cores
        this.setupIconSelector();
        this.setupColorSelector();
    },
    
    // Obter opções de ícones
    getIconOptionsHTML: function() {
        const icons = ['sun', 'moon', 'dumbbell', 'book', 'heart', 'tint', 'mobile-alt', 'apple-alt', 'running', 'medkit', 'graduation-cap', 'pray'];
        return icons.map(icon => `
            <div class="icon-option" data-icon="${icon}">
                <i class="fas fa-${icon}"></i>
            </div>
        `).join('');
    },
    
    // Obter opções de cores
    getColorOptionsHTML: function() {
        const colors = ['#3a86ff', '#06d6a0', '#ffd166', '#ef476f', '#8338ec', '#118ab2', '#8ac926', '#ff9e6d'];
        return colors.map(color => `
            <div class="color-option" data-color="${color}" style="background: ${color}"></div>
        `).join('');
    },
    
    // Configurar seletor de ícones
    setupIconSelector: function() {
        document.querySelectorAll('.icon-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.icon-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
            });
        });
        
        // Selecionar primeiro ícone por padrão
        document.querySelector('.icon-option')?.classList.add('selected');
    },
    
    // Configurar seletor de cores
    setupColorSelector: function() {
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.color-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
            });
        });
        
        // Selecionar primeira cor por padrão
        document.querySelector('.color-option')?.classList.add('selected');
    },
    
    // Mostrar modal de editar hábito
    showEditHabitModal: function(habitId) {
        const habit = this.data.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        // Implementação similar ao modal de novo hábito, mas preenchido
        // com os dados do hábito existente
    },
    
    // Mostrar modal de nova rotina
    showNewRoutineModal: function() {
        // Implementação similar aos outros modais
    },
    
    // Fechar modal
    closeModal: function() {
        const modal = document.querySelector('.modal-overlay.active');
        if (modal) {
            modal.remove();
        }
    },
    
    // Salvar dados
    saveData: function() {
        Utils.setLocalStorage('routine_module', this.data);
        
        // Atualizar AppState global
        if (window.AppState) {
            AppState.habits = this.data.habits;
        }
    },
    
    // Exportar dados
    exportData: function(format = 'csv') {
        const data = format === 'json' ? 
            JSON.stringify(this.data, null, 2) : 
            this.generateHabitsCSV();
        
        const blob = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `habitos-${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        
        URL.revokeObjectURL(url);
    },
    
    // Gerar CSV de hábitos
    generateHabitsCSV: function() {
        const headers = ['Nome', 'Descrição', 'Frequência', 'Sequência Atual', 'Melhor Sequência', 'Data de Criação'];
        const rows = this.data.habits.map(habit => [
            habit.name,
            `"${habit.description}"`,
            habit.frequency,
            habit.streak,
            habit.bestStreak,
            habit.createdAt
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    },
    
    // Importar dados
    importData: function(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const importedData = JSON.parse(content);
                
                // Validar estrutura
                if (this.validateImportedData(importedData)) {
                    this.data.habits = [...this.data.habits, ...importedData.habits];
                    this.data.routines = [...this.data.routines, ...importedData.routines];
                    
                    this.saveData();
                    this.updateUI();
                    
                    showNotification('Hábitos importados com sucesso!', 'success');
                } else {
                    showNotification('Formato de arquivo inválido', 'danger');
                }
            } catch (error) {
                showNotification('Erro ao importar dados: ' + error.message, 'danger');
            }
        };
        
        reader.readAsText(file);
    },
    
    // Validar dados importados
    validateImportedData: function(data) {
        return data && 
               Array.isArray(data.habits) && 
               Array.isArray(data.routines);
    }
};

// Inicializar módulo de rotina
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-module="routine"]')) {
        RoutineModule.init();
    }
});

// Exportar módulo
window.RoutineModule = RoutineModule;

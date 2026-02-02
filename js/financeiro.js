// ===== MÓDULO FINANCEIRO =====
const FinanceModule = {
    // Dados financeiros
    data: {
        transactions: [],
        categories: [],
        budgets: {},
        goals: []
    },
    
    // Inicializar módulo
    init: function() {
        this.loadData();
        this.setupEventListeners();
        this.updateUI();
    },
    
    // Carregar dados
    loadData: function() {
        const savedData = Utils.getLocalStorage('finance_module');
        if (savedData) {
            this.data = savedData;
        } else {
            this.data = this.getDefaultData();
        }
    },
    
    // Dados padrão
    getDefaultData: function() {
        return {
            transactions: [
                {
                    id: Utils.generateId(),
                    type: 'income',
                    amount: 10000,
                    category: 'salario',
                    description: 'Salário mensal',
                    date: '2025-12-01',
                    recurring: true
                },
                {
                    id: Utils.generateId(),
                    type: 'expense',
                    amount: 1500,
                    category: 'moradia',
                    description: 'Aluguel',
                    date: '2025-12-05',
                    recurring: true
                },
                {
                    id: Utils.generateId(),
                    type: 'expense',
                    amount: 746,
                    category: 'alimentacao',
                    description: 'Supermercado',
                    date: '2025-12-10',
                    recurring: false
                }
            ],
            categories: [
                { id: 'moradia', name: 'Moradia', color: '#3a86ff', icon: 'home', budget: 2500 },
                { id: 'alimentacao', name: 'Alimentação', color: '#06d6a0', icon: 'utensils', budget: 1500 },
                { id: 'transporte', name: 'Transporte', color: '#ffd166', icon: 'car', budget: 250 },
                { id: 'saude', name: 'Saúde', color: '#ef476f', icon: 'heart', budget: 200 },
                { id: 'lazer', name: 'Lazer', color: '#8338ec', icon: 'film', budget: 450 },
                { id: 'educacao', name: 'Educação', color: '#118ab2', icon: 'graduation-cap', budget: 850 },
                { id: 'assinaturas', name: 'Assinaturas', color: '#8ac926', icon: 'newspaper', budget: 125 }
            ],
            budgets: {
                '2025-12': {
                    income: 10000,
                    expenses: 2637,
                    balance: 7363,
                    categories: {
                        moradia: { spent: 1500, budget: 2500 },
                        alimentacao: { spent: 746, budget: 1500 },
                        transporte: { spent: 124, budget: 250 },
                        saude: { spent: 67, budget: 200 },
                        lazer: { spent: 200, budget: 450 },
                        educacao: { spent: 0, budget: 850 },
                        assinaturas: { spent: 0, budget: 125 }
                    }
                }
            },
            goals: [
                {
                    id: Utils.generateId(),
                    name: 'Economizar R$ 10.000',
                    target: 10000,
                    current: 4500,
                    deadline: '2026-12-31',
                    category: 'economia'
                }
            ]
        };
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-add-transaction')) {
                this.showAddTransactionModal();
            }
            if (e.target.matches('.btn-edit-transaction')) {
                const id = e.target.dataset.id;
                this.showEditTransactionModal(id);
            }
            if (e.target.matches('.btn-delete-transaction')) {
                const id = e.target.dataset.id;
                this.deleteTransaction(id);
            }
        });
    },
    
    // Atualizar interface
    updateUI: function() {
        this.updateSummary();
        this.updateTransactionsList();
        this.updateCategories();
        this.updateCharts();
    },
    
    // Atualizar resumo
    updateSummary: function() {
        const currentMonth = this.getCurrentMonth();
        const budget = this.data.budgets[currentMonth];
        
        if (!budget) return;
        
        // Atualizar valores
        document.querySelectorAll('.budget-income').forEach(el => {
            el.textContent = Utils.formatCurrency(budget.income);
        });
        
        document.querySelectorAll('.budget-expenses').forEach(el => {
            el.textContent = Utils.formatCurrency(budget.expenses);
        });
        
        document.querySelectorAll('.budget-balance').forEach(el => {
            el.textContent = Utils.formatCurrency(budget.balance);
        });
        
        // Atualizar progresso
        const progress = (budget.balance / budget.income) * 100;
        document.querySelectorAll('.budget-progress-fill').forEach(el => {
            el.style.width = `${progress}%`;
        });
    },
    
    // Atualizar lista de transações
    updateTransactionsList: function() {
        const container = document.getElementById('transactionsList');
        if (!container) return;
        
        const transactions = this.data.transactions.slice(0, 10); // Últimas 10
        
        container.innerHTML = transactions.map(transaction => `
            <div class="transaction-item" data-id="${transaction.id}">
                <div class="transaction-icon ${transaction.type}">
                    <i class="fas fa-${transaction.type === 'income' ? 'arrow-down' : 'arrow-up'}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-category">${this.getCategoryName(transaction.category)}</div>
                    <div class="transaction-date">${Utils.formatDate(transaction.date, 'short')}</div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${Utils.formatCurrency(transaction.amount)}
                </div>
                <div class="transaction-actions">
                    <button class="btn btn-icon btn-edit-transaction" data-id="${transaction.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-icon btn-delete-transaction" data-id="${transaction.id}" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    // Atualizar categorias
    updateCategories: function() {
        const container = document.getElementById('categoriesList');
        if (!container) return;
        
        const currentMonth = this.getCurrentMonth();
        const budget = this.data.budgets[currentMonth];
        
        if (!budget) return;
        
        container.innerHTML = this.data.categories.map(category => {
            const catBudget = budget.categories[category.id] || { spent: 0, budget: 0 };
            const percentage = catBudget.budget > 0 ? (catBudget.spent / catBudget.budget) * 100 : 0;
            
            return `
                <div class="category-item">
                    <div class="category-header">
                        <div class="category-info">
                            <div class="category-icon" style="background: ${category.color}">
                                <i class="fas fa-${category.icon}"></i>
                            </div>
                            <div class="category-name">${category.name}</div>
                        </div>
                        <div class="category-amount">
                            ${Utils.formatCurrency(catBudget.spent)} / ${Utils.formatCurrency(catBudget.budget)}
                        </div>
                    </div>
                    <div class="category-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%; background: ${category.color}"></div>
                        </div>
                        <div class="progress-percentage">${Math.round(percentage)}%</div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Atualizar gráficos
    updateCharts: function() {
        this.updateExpenseChart();
        this.updateIncomeExpenseChart();
        this.updateBudgetChart();
    },
    
    // Gráfico de despesas por categoria
    updateExpenseChart: function() {
        const ctx = document.getElementById('expenseChart');
        if (!ctx) return;
        
        const currentMonth = this.getCurrentMonth();
        const budget = this.data.budgets[currentMonth];
        
        if (!budget) return;
        
        const categories = this.data.categories.filter(cat => budget.categories[cat.id]?.spent > 0);
        const data = categories.map(cat => budget.categories[cat.id].spent);
        const labels = categories.map(cat => cat.name);
        const colors = categories.map(cat => cat.color);
        
        // Implementar gráfico com Chart.js
        this.renderChart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    },
    
    // Gráfico de receitas vs despesas
    updateIncomeExpenseChart: function() {
        const ctx = document.getElementById('incomeExpenseChart');
        if (!ctx) return;
        
        const months = Object.keys(this.data.budgets).slice(-6); // Últimos 6 meses
        const incomeData = months.map(month => this.data.budgets[month]?.income || 0);
        const expenseData = months.map(month => this.data.budgets[month]?.expenses || 0);
        
        this.renderChart(ctx, {
            type: 'bar',
            data: {
                labels: months.map(m => m.split('-')[1]), // Apenas o mês
                datasets: [
                    {
                        label: 'Receitas',
                        data: incomeData,
                        backgroundColor: '#06d6a0'
                    },
                    {
                        label: 'Despesas',
                        data: expenseData,
                        backgroundColor: '#ef476f'
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    },
    
    // Gráfico de orçamento
    updateBudgetChart: function() {
        const ctx = document.getElementById('budgetChart');
        if (!ctx) return;
        
        const currentMonth = this.getCurrentMonth();
        const budget = this.data.budgets[currentMonth];
        
        if (!budget) return;
        
        const categories = this.data.categories.filter(cat => budget.categories[cat.id]);
        const spentData = categories.map(cat => budget.categories[cat.id].spent);
        const budgetData = categories.map(cat => budget.categories[cat.id].budget);
        const labels = categories.map(cat => cat.name);
        
        this.renderChart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Gasto',
                        data: spentData,
                        backgroundColor: '#3a86ff'
                    },
                    {
                        label: 'Orçamento',
                        data: budgetData,
                        backgroundColor: '#e9ecef'
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
                        stacked: true,
                        beginAtZero: true
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
    
    // Adicionar transação
    addTransaction: function(transaction) {
        transaction.id = Utils.generateId();
        transaction.date = transaction.date || new Date().toISOString().split('T')[0];
        
        this.data.transactions.unshift(transaction);
        
        // Atualizar orçamento do mês
        this.updateBudgetForTransaction(transaction);
        
        // Salvar e atualizar
        this.saveData();
        this.updateUI();
        
        showNotification('Transação adicionada com sucesso!', 'success');
    },
    
    // Editar transação
    editTransaction: function(id, updates) {
        const index = this.data.transactions.findIndex(t => t.id === id);
        if (index === -1) return;
        
        // Remover do orçamento antigo
        const oldTransaction = this.data.transactions[index];
        this.updateBudgetForTransaction(oldTransaction, true); // true = remove
        
        // Atualizar transação
        this.data.transactions[index] = { ...oldTransaction, ...updates };
        
        // Adicionar ao orçamento novo
        this.updateBudgetForTransaction(this.data.transactions[index]);
        
        // Salvar e atualizar
        this.saveData();
        this.updateUI();
        
        showNotification('Transação atualizada com sucesso!', 'success');
    },
    
    // Excluir transação
    deleteTransaction: function(id) {
        if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
        
        const index = this.data.transactions.findIndex(t => t.id === id);
        if (index === -1) return;
        
        // Remover do orçamento
        const transaction = this.data.transactions[index];
        this.updateBudgetForTransaction(transaction, true);
        
        // Remover transação
        this.data.transactions.splice(index, 1);
        
        // Salvar e atualizar
        this.saveData();
        this.updateUI();
        
        showNotification('Transação excluída com sucesso!', 'success');
    },
    
    // Atualizar orçamento para uma transação
    updateBudgetForTransaction: function(transaction, remove = false) {
        const month = transaction.date.substring(0, 7); // YYYY-MM
        const amount = remove ? -transaction.amount : transaction.amount;
        
        // Inicializar orçamento do mês se não existir
        if (!this.data.budgets[month]) {
            this.data.budgets[month] = {
                income: 0,
                expenses: 0,
                balance: 0,
                categories: {}
            };
        }
        
        const budget = this.data.budgets[month];
        
        // Atualizar totais
        if (transaction.type === 'income') {
            budget.income += amount;
        } else {
            budget.expenses += amount;
        }
        budget.balance = budget.income - budget.expenses;
        
        // Atualizar categoria
        if (transaction.type === 'expense') {
            if (!budget.categories[transaction.category]) {
                const category = this.data.categories.find(c => c.id === transaction.category);
                budget.categories[transaction.category] = {
                    spent: 0,
                    budget: category?.budget || 0
                };
            }
            
            budget.categories[transaction.category].spent += amount;
        }
    },
    
    // Mostrar modal de adicionar transação
    showAddTransactionModal: function() {
        const modalHTML = `
            <div class="modal-overlay active">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">Nova Transação</h3>
                        <button class="modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="transactionForm">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Tipo</label>
                                <div class="form-radio-group">
                                    <label class="radio-label">
                                        <input type="radio" name="type" value="income" checked>
                                        <span class="radio-custom"></span>
                                        <span class="radio-text">Receita</span>
                                    </label>
                                    <label class="radio-label">
                                        <input type="radio" name="type" value="expense">
                                        <span class="radio-custom"></span>
                                        <span class="radio-text">Despesa</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Valor</label>
                                <input type="number" class="form-control" name="amount" required step="0.01" min="0.01">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Descrição</label>
                                <input type="text" class="form-control" name="description" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Categoria</label>
                                <select class="form-control" name="category" required>
                                    <option value="">Selecione uma categoria</option>
                                    ${this.data.categories.map(cat => `
                                        <option value="${cat.id}">${cat.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Data</label>
                                <input type="date" class="form-control" name="date" value="${new Date().toISOString().split('T')[0]}" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="recurring">
                                    <span class="checkbox-custom"></span>
                                    <span class="checkbox-text">Transação recorrente</span>
                                </label>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline modal-cancel">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Configurar submit
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const transaction = {
                type: formData.get('type'),
                amount: parseFloat(formData.get('amount')),
                description: formData.get('description'),
                category: formData.get('category'),
                date: formData.get('date'),
                recurring: formData.get('recurring') === 'on'
            };
            
            this.addTransaction(transaction);
            this.closeModal();
        });
    },
    
    // Mostrar modal de editar transação
    showEditTransactionModal: function(id) {
        const transaction = this.data.transactions.find(t => t.id === id);
        if (!transaction) return;
        
        // Similar ao modal de adicionar, mas preenchido com os dados da transação
        // Implementação similar ao showAddTransactionModal
    },
    
    // Fechar modal
    closeModal: function() {
        const modal = document.querySelector('.modal-overlay.active');
        if (modal) {
            modal.remove();
        }
    },
    
    // Obter nome da categoria
    getCategoryName: function(categoryId) {
        const category = this.data.categories.find(c => c.id === categoryId);
        return category ? category.name : 'Outros';
    },
    
    // Obter mês atual no formato YYYY-MM
    getCurrentMonth: function() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    },
    
    // Salvar dados
    saveData: function() {
        Utils.setLocalStorage('finance_module', this.data);
    },
    
    // Exportar dados
    exportData: function(format = 'csv') {
        let data;
        
        switch (format) {
            case 'csv':
                data = this.generateCSV();
                break;
            case 'json':
                data = JSON.stringify(this.data, null, 2);
                break;
            case 'pdf':
                this.generatePDF();
                return;
        }
        
        const blob = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financas-${this.getCurrentMonth()}.${format}`;
        a.click();
        
        URL.revokeObjectURL(url);
    },
    
    // Gerar CSV
    generateCSV: function() {
        const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor'];
        const rows = this.data.transactions.map(t => [
            t.date,
            t.type === 'income' ? 'Receita' : 'Despesa',
            `"${t.description}"`,
            this.getCategoryName(t.category),
            t.amount
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    },
    
    // Gerar PDF (simplificado)
    generatePDF: function() {
        // Implementação básica - na prática usar uma biblioteca como jsPDF
        showNotification('Exportação PDF em desenvolvimento', 'info');
    },
    
    // Importar dados
    importData: function(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const importedData = JSON.parse(content);
                
                // Validar e mesclar dados
                this.mergeImportedData(importedData);
                
                showNotification('Dados importados com sucesso!', 'success');
            } catch (error) {
                showNotification('Erro ao importar dados: ' + error.message, 'danger');
            }
        };
        
        reader.readAsText(file);
    },
    
    // Mesclar dados importados
    mergeImportedData: function(importedData) {
        // Implementar lógica de merge
        // Por segurança, apenas adicionar transações que não existem
    }
};

// Inicializar módulo financeiro
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-module="finance"]')) {
        FinanceModule.init();
    }
});

// Exportar módulo
window.FinanceModule = FinanceModule;

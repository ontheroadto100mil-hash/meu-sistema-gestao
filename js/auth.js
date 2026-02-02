// ===== MÓDULO DE AUTENTICAÇÃO E USUÁRIO =====
const AuthModule = {
    // Estado do usuário
    currentUser: null,
    isAuthenticated: false,
    
    // Inicializar módulo
    init: function() {
        this.loadUserFromStorage();
        this.setupEventListeners();
        this.updateAuthUI();
    },
    
    // Carregar usuário do storage
    loadUserFromStorage: function() {
        const userData = Utils.getLocalStorage('trilha1a_user');
        if (userData && userData.id) {
            this.currentUser = userData;
            this.isAuthenticated = true;
            
            // Emitir evento de login
            this.emitAuthEvent('login', this.currentUser);
        }
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        // Formulário de login
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'loginForm') {
                e.preventDefault();
                this.handleLogin(e.target);
            }
            
            if (e.target.id === 'registerForm') {
                e.preventDefault();
                this.handleRegister(e.target);
            }
        });
        
        // Botão de logout
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="logout"]')) {
                this.handleLogout();
            }
        });
    },
    
    // Atualizar UI de autenticação
    updateAuthUI: function() {
        const authElements = document.querySelectorAll('[data-auth]');
        
        authElements.forEach(element => {
            const authState = element.dataset.auth;
            
            if (authState === 'authenticated') {
                element.style.display = this.isAuthenticated ? '' : 'none';
            } else if (authState === 'anonymous') {
                element.style.display = this.isAuthenticated ? 'none' : '';
            }
        });
        
        // Atualizar informações do usuário
        if (this.isAuthenticated && this.currentUser) {
            this.updateUserInfo();
        }
    },
    
    // Atualizar informações do usuário na UI
    updateUserInfo: function() {
        document.querySelectorAll('.user-name').forEach(el => {
            el.textContent = this.currentUser.name;
        });
        
        document.querySelectorAll('.user-avatar').forEach(el => {
            el.textContent = this.currentUser.avatar || this.currentUser.name.charAt(0);
        });
        
        document.querySelectorAll('.user-email').forEach(el => {
            el.textContent = this.currentUser.email;
        });
    },
    
    // Manipular login
    handleLogin: function(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const remember = formData.get('remember') === 'on';
        
        // Validação básica
        if (!this.validateEmail(email)) {
            this.showAuthError('Por favor, insira um email válido.');
            return;
        }
        
        if (!this.validatePassword(password)) {
            this.showAuthError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        
        // Simular requisição de login
        this.showLoading(true);
        
        setTimeout(() => {
            this.showLoading(false);
            
            // Em produção, aqui seria uma requisição real para o backend
            const user = this.authenticateUser(email, password);
            
            if (user) {
                this.login(user, remember);
                this.showAuthSuccess('Login realizado com sucesso!');
            } else {
                this.showAuthError('Email ou senha incorretos.');
            }
        }, 1000);
    },
    
    // Manipular registro
    handleRegister: function(form) {
        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const terms = formData.get('terms') === 'on';
        
        // Validações
        if (!name || name.trim().length < 2) {
            this.showAuthError('Por favor, insira um nome válido.');
            return;
        }
        
        if (!this.validateEmail(email)) {
            this.showAuthError('Por favor, insira um email válido.');
            return;
        }
        
        if (!this.validatePassword(password)) {
            this.showAuthError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showAuthError('As senhas não coincidem.');
            return;
        }
        
        if (!terms) {
            this.showAuthError('Você deve aceitar os termos de uso.');
            return;
        }
        
        // Simular requisição de registro
        this.showLoading(true);
        
        setTimeout(() => {
            this.showLoading(false);
            
            // Verificar se o usuário já existe
            if (this.userExists(email)) {
                this.showAuthError('Este email já está em uso.');
                return;
            }
            
            // Criar novo usuário
            const user = this.createUser(name, email, password);
            this.register(user);
            
            this.showAuthSuccess('Conta criada com sucesso!');
        }, 1500);
    },
    
    // Autenticar usuário (simulado)
    authenticateUser: function(email, password) {
        // Em produção, isso seria uma verificação no backend
        const users = this.getStoredUsers();
        return users.find(user => 
            user.email === email && 
            this.verifyPassword(password, user.password)
        );
    },
    
    // Verificar senha (simulado)
    verifyPassword: function(inputPassword, storedHash) {
        // Em produção, usar bcrypt ou similar
        return inputPassword === storedHash;
    },
    
    // Verificar se usuário existe
    userExists: function(email) {
        const users = this.getStoredUsers();
        return users.some(user => user.email === email);
    },
    
    // Criar novo usuário
    createUser: function(name, email, password) {
        return {
            id: Utils.generateId(),
            name: name.trim(),
            email: email.toLowerCase(),
            password: password, // Em produção, hash isso!
            avatar: name.charAt(0).toUpperCase(),
            rank: 'RECRUTA',
            xp: 0,
            level: 1,
            createdAt: new Date().toISOString(),
            preferences: {
                theme: 'light',
                language: 'pt-BR',
                notifications: true
            },
            stats: {
                totalTasks: 0,
                completedTasks: 0,
                totalHabits: 0,
                completedHabits: 0,
                streak: 0,
                bestStreak: 0
            }
        };
    },
    
    // Fazer login
    login: function(user, remember = false) {
        this.currentUser = user;
        this.isAuthenticated = true;
        
        // Salvar usuário
        this.saveUserToStorage(user, remember);
        
        // Atualizar UI
        this.updateAuthUI();
        
        // Emitir evento
        this.emitAuthEvent('login', user);
        
        // Redirecionar para dashboard
        if (window.navigateTo) {
            window.navigateTo('dashboard');
        }
    },
    
    // Registrar novo usuário
    register: function(user) {
        // Adicionar à lista de usuários
        const users = this.getStoredUsers();
        users.push(user);
        this.saveUsersToStorage(users);
        
        // Fazer login automaticamente
        this.login(user);
    },
    
    // Fazer logout
    handleLogout: function() {
        if (confirm('Tem certeza que deseja sair?')) {
            this.logout();
        }
    },
    
    // Logout
    logout: function() {
        // Emitir evento antes de limpar
        this.emitAuthEvent('logout', this.currentUser);
        
        // Limpar dados da sessão
        if (!Utils.getLocalStorage('remember_me')) {
            Utils.removeLocalStorage('trilha1a_user');
        }
        
        // Resetar estado
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Atualizar UI
        this.updateAuthUI();
        
        // Redirecionar para login
        if (window.navigateTo) {
            window.navigateTo('login');
        }
        
        showNotification('Logout realizado com sucesso!', 'info');
    },
    
    // Atualizar perfil do usuário
    updateProfile: function(updates) {
        if (!this.isAuthenticated) return;
        
        // Atualizar dados do usuário
        Object.assign(this.currentUser, updates);
        
        // Salvar
        this.saveUserToStorage(this.currentUser);
        
        // Atualizar UI
        this.updateUserInfo();
        
        // Emitir evento
        this.emitAuthEvent('profileUpdate', this.currentUser);
        
        return true;
    },
    
    // Alterar senha
    changePassword: function(currentPassword, newPassword) {
        if (!this.isAuthenticated) return false;
        
        // Verificar senha atual
        if (!this.verifyPassword(currentPassword, this.currentUser.password)) {
            this.showAuthError('Senha atual incorreta.');
            return false;
        }
        
        // Validar nova senha
        if (!this.validatePassword(newPassword)) {
            this.showAuthError('A nova senha deve ter pelo menos 6 caracteres.');
            return false;
        }
        
        // Atualizar senha
        this.currentUser.password = newPassword; // Em produção, hash isso!
        
        // Salvar
        this.saveUserToStorage(this.currentUser);
        
        this.showAuthSuccess('Senha alterada com sucesso!');
        return true;
    },
    
    // Excluir conta
    deleteAccount: function(password) {
        if (!this.isAuthenticated) return false;
        
        // Verificar senha
        if (!this.verifyPassword(password, this.currentUser.password)) {
            this.showAuthError('Senha incorreta.');
            return false;
        }
        
        if (!confirm('ATENÇÃO: Esta ação é irreversível. Todos os seus dados serão perdidos. Tem certeza?')) {
            return false;
        }
        
        // Emitir evento
        this.emitAuthEvent('accountDelete', this.currentUser);
        
        // Remover usuário da lista
        const users = this.getStoredUsers();
        const updatedUsers = users.filter(user => user.id !== this.currentUser.id);
        this.saveUsersToStorage(updatedUsers);
        
        // Limpar dados locais
        Utils.removeLocalStorage('trilha1a_user');
        Utils.removeLocalStorage('remember_me');
        
        // Limpar todos os dados do aplicativo
        const keys = [
            'dashboard_data',
            'finance_data',
            'tasks_data',
            'habits_data',
            'goals_data',
            'notifications',
            'app_settings'
        ];
        
        keys.forEach(key => Utils.removeLocalStorage(key));
        
        // Resetar estado
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Atualizar UI
        this.updateAuthUI();
        
        // Redirecionar para página inicial
        if (window.location) {
            window.location.reload();
        }
        
        return true;
    },
    
    // Salvar usuário no storage
    saveUserToStorage: function(user, remember = false) {
        // Remover senha antes de salvar (em produção, nunca salvar senha em localStorage!)
        const userToStore = { ...user };
        delete userToStore.password;
        
        Utils.setLocalStorage('trilha1a_user', userToStore);
        
        if (remember) {
            Utils.setLocalStorage('remember_me', true);
        }
    },
    
    // Obter usuários armazenados
    getStoredUsers: function() {
        return Utils.getLocalStorage('trilha1a_users') || [];
    },
    
    // Salvar lista de usuários
    saveUsersToStorage: function(users) {
        // Em produção, isso seria feito no backend
        Utils.setLocalStorage('trilha1a_users', users);
    },
    
    // Validar email
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Validar senha
    validatePassword: function(password) {
        return password && password.length >= 6;
    },
    
    // Mostrar erro de autenticação
    showAuthError: function(message) {
        const errorElement = document.getElementById('authError');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // Ocultar automaticamente após 5 segundos
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        } else {
            showNotification(message, 'danger');
        }
    },
    
    // Mostrar sucesso de autenticação
    showAuthSuccess: function(message) {
        showNotification(message, 'success');
    },
    
    // Mostrar loading
    showLoading: function(show) {
        const buttons = document.querySelectorAll('#loginForm button[type="submit"], #registerForm button[type="submit"]');
        buttons.forEach(button => {
            if (show) {
                button.innerHTML = '<span class="loading"></span>';
                button.disabled = true;
            } else {
                button.innerHTML = button.dataset.originalText || 'Entrar';
                button.disabled = false;
            }
        });
    },
    
    // Emitir evento de autenticação
    emitAuthEvent: function(event, data) {
        const customEvent = new CustomEvent(`auth:${event}`, {
            detail: data,
            bubbles: true
        });
        document.dispatchEvent(customEvent);
    },
    
    // Verificar autenticação
    checkAuth: function() {
        return this.isAuthenticated;
    },
    
    // Obter usuário atual
    getUser: function() {
        return this.currentUser;
    },
    
    // Obter token (simulado)
    getToken: function() {
        return this.isAuthenticated ? 'simulated_token_' + this.currentUser.id : null;
    },
    
    // Verificar permissões (simplificado)
    hasPermission: function(permission) {
        if (!this.isAuthenticated) return false;
        
        // Implementação básica de permissões
        const userPermissions = this.currentUser.permissions || ['user'];
        return userPermissions.includes(permission) || userPermissions.includes('admin');
    },
    
    // Atualizar estatísticas do usuário
    updateUserStats: function(statsUpdate) {
        if (!this.isAuthenticated) return;
        
        // Atualizar estatísticas
        Object.assign(this.currentUser.stats, statsUpdate);
        
        // Calcular XP baseado nas estatísticas
        this.calculateXP();
        
        // Atualizar rank baseado no XP
        this.updateRank();
        
        // Salvar
        this.saveUserToStorage(this.currentUser);
        
        // Emitir evento de atualização
        this.emitAuthEvent('statsUpdate', this.currentUser.stats);
    },
    
    // Calcular XP
    calculateXP: function() {
        const stats = this.currentUser.stats;
        
        // Fórmula básica de XP
        let xp = 0;
        xp += stats.completedTasks * 10; // 10 XP por tarefa
        xp += stats.completedHabits * 5; // 5 XP por hábito
        xp += stats.streak * 20; // 20 XP por dia de sequência
        xp += stats.bestStreak * 50; // 50 XP por recorde
        
        this.currentUser.xp = xp;
    },
    
    // Atualizar rank baseado no XP
    updateRank: function() {
        const xp = this.currentUser.xp;
        let rank = 'RECRUTA';
        
        if (xp >= 5000) rank = 'TENENTE';
        else if (xp >= 2500) rank = 'SARGENTO';
        else if (xp >= 1000) rank = 'CABO';
        else if (xp >= 500) rank = 'SOLDADO';
        else if (xp >= 100) rank = 'RECRUTA';
        
        this.currentUser.rank = rank;
        this.currentUser.level = Math.floor(xp / 100) + 1;
    },
    
    // Adicionar XP
    addXP: function(amount, reason) {
        if (!this.isAuthenticated) return;
        
        const oldXP = this.currentUser.xp;
        const oldRank = this.currentUser.rank;
        
        this.currentUser.xp += amount;
        this.updateRank();
        
        // Verificar se subiu de rank
        if (this.currentUser.rank !== oldRank) {
            showNotification(`🎉 Parabéns! Você alcançou o rank ${this.currentUser.rank}!`, 'success');
            this.emitAuthEvent('rankUp', {
                oldRank,
                newRank: this.currentUser.rank,
                xpGained: amount
            });
        }
        
        // Salvar
        this.saveUserToStorage(this.currentUser);
        
        // Emitir evento
        this.emitAuthEvent('xpGained', {
            amount,
            oldXP,
            newXP: this.currentUser.xp,
            reason
        });
        
        return amount;
    }
};

// Inicializar módulo de autenticação
document.addEventListener('DOMContentLoaded', () => {
    AuthModule.init();
});

// Exportar módulo
window.AuthModule = AuthModule;

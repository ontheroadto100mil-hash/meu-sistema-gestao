// ===== MÓDULO DE GRÁFICOS E VISUALIZAÇÕES =====
const ChartModule = {
    // Instâncias de gráficos
    charts: {},
    
    // Configurações padrão
    defaults: {
        colors: {
            primary: '#3a86ff',
            secondary: '#8338ec',
            success: '#06d6a0',
            warning: '#ffd166',
            danger: '#ef476f',
            info: '#118ab2',
            light: '#e9ecef',
            dark: '#212529'
        },
        fonts: {
            family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            size: 12
        },
        animations: {
            duration: 1000,
            easing: 'easeOutQuart'
        }
    },
    
    // Inicializar módulo
    init: function() {
        this.setupGlobalChartConfig();
        this.renderAllCharts();
        this.setupResizeHandler();
    },
    
    // Configurar configuração global do Chart.js
    setupGlobalChartConfig: function() {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js não está carregado');
            return;
        }
        
        // Configurações globais
        Chart.defaults.font.family = this.defaults.fonts.family;
        Chart.defaults.font.size = this.defaults.fonts.size;
        Chart.defaults.color = '#6c757d';
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
        
        // Plugin para gradientes
        this.registerGradientPlugin();
        
        // Plugin para tooltip personalizado
        this.registerCustomTooltipPlugin();
    },
    
    // Registrar plugin de gradientes
    registerGradientPlugin: function() {
        Chart.register({
            id: 'gradientBackground',
            beforeDraw: function(chart) {
                const ctx = chart.ctx;
                const chartArea = chart.chartArea;
                
                // Aplicar gradiente apenas para gráficos de linha e barra
                if (chart.config.type === 'line' || chart.config.type === 'bar') {
                    const datasets = chart.data.datasets;
                    
                    datasets.forEach((dataset, i) => {
                        if (dataset.gradient) {
                            const meta = chart.getDatasetMeta(i);
                            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                            
                            if (Array.isArray(dataset.gradient)) {
                                dataset.gradient.forEach((stop, index) => {
                                    gradient.addColorStop(index / (dataset.gradient.length - 1), stop);
                                });
                            } else {
                                gradient.addColorStop(0, dataset.gradient + '00');
                                gradient.addColorStop(1, dataset.gradient + '80');
                            }
                            
                            dataset.backgroundColor = gradient;
                        }
                    });
                }
            }
        });
    },
    
    // Registrar plugin de tooltip personalizado
    registerCustomTooltipPlugin: function() {
        const customTooltip = {
            id: 'customTooltip',
            afterDraw: function(chart) {
                const tooltip = chart.tooltip;
                
                if (tooltip && tooltip.opacity > 0) {
                    const ctx = chart.ctx;
                    const x = tooltip.caretX;
                    const y = tooltip.caretY;
                    
                    // Salvar estado do contexto
                    ctx.save();
                    
                    // Desenhar linha vertical
                    ctx.beginPath();
                    ctx.moveTo(x, chart.chartArea.top);
                    ctx.lineTo(x, chart.chartArea.bottom);
                    ctx.setLineDash([5, 5]);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                    ctx.stroke();
                    
                    // Desenhar ponto
                    ctx.beginPath();
                    ctx.arc(x, y, 6, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = tooltip.labelColors[0].borderColor;
                    ctx.stroke();
                    
                    // Restaurar estado
                    ctx.restore();
                }
            }
        };
        
        Chart.register(customTooltip);
    },
    
    // Renderizar todos os gráficos na página
    renderAllCharts: function() {
        // Gráfico de progresso semanal
        this.renderWeeklyProgressChart();
        
        // Gráfico de tarefas diárias
        this.renderDailyTasksChart();
        
        // Gráfico de finanças
        this.renderFinanceChart();
        
        // Gráfico de hábitos
        this.renderHabitsChart();
        
        // Gráfico de consistência
        this.renderConsistencyChart();
    },
    
    // Gráfico de progresso semanal
    renderWeeklyProgressChart: function() {
        const ctx = document.getElementById('weeklyProgressChart');
        if (!ctx) return;
        
        const data = {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Progresso (%)',
                data: [95, 60, 80, 45, 90, 70, 85],
                backgroundColor: this.createGradient(ctx, this.defaults.colors.primary),
                borderColor: this.defaults.colors.primary,
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false,
                barPercentage: 0.7,
                categoryPercentage: 0.7
            }]
        };
        
        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(33, 37, 41, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Progresso: ${context.raw}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6c757d',
                            font: {
                                weight: 500
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#6c757d',
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animation: {
                    duration: this.defaults.animations.duration,
                    easing: this.defaults.animations.easing
                }
            }
        };
        
        this.createChart(ctx, 'weeklyProgress', config);
    },
    
    // Gráfico de tarefas diárias
    renderDailyTasksChart: function() {
        const ctx = document.getElementById('dailyTasksChart');
        if (!ctx) return;
        
        const data = {
            labels: ['Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom', 'Seg'],
            datasets: [{
                label: 'Tarefas Concluídas',
                data: [12, 9, 6, 3, 5, 8, 10],
                backgroundColor: this.createGradient(ctx, this.defaults.colors.success),
                borderColor: this.defaults.colors.success,
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        };
        
        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        };
        
        this.createChart(ctx, 'dailyTasks', config);
    },
    
    // Gráfico de finanças
    renderFinanceChart: function() {
        const ctx = document.getElementById('financeChart');
        if (!ctx) return;
        
        const data = {
            labels: ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Educação', 'Assinaturas'],
            datasets: [{
                label: 'Gasto',
                data: [1500, 746, 124, 67, 200, 0, 0],
                backgroundColor: [
                    this.defaults.colors.primary,
                    this.defaults.colors.success,
                    this.defaults.colors.warning,
                    this.defaults.colors.danger,
                    this.defaults.colors.secondary,
                    this.defaults.colors.info,
                    '#8ac926'
                ],
                borderWidth: 1
            }]
        };
        
        const config = {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${context.label}: R$ ${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        };
        
        this.createChart(ctx, 'finance', config);
    },
    
    // Gráfico de hábitos
    renderHabitsChart: function() {
        const ctx = document.getElementById('habitsChart');
        if (!ctx) return;
        
        const data = {
            labels: ['Acordar Cedo', 'Treino', 'Leitura', 'Meditação', 'Água', 'Sem Celular'],
            datasets: [{
                label: 'Taxa de Sucesso',
                data: [60, 80, 30, 10, 50, 20],
                backgroundColor: this.createGradient(ctx, this.defaults.colors.secondary),
                borderColor: this.defaults.colors.secondary,
                borderWidth: 2,
                borderRadius: 6
            }]
        };
        
        const config = {
            type: 'bar',
            data: data,
            options: {
                indexAxis: 'y',
                responsive: true,
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        };
        
        this.createChart(ctx, 'habits', config);
    },
    
    // Gráfico de consistência
    renderConsistencyChart: function() {
        const ctx = document.getElementById('consistencyChart');
        if (!ctx) return;
        
        const data = {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [
                {
                    label: 'Consistência',
                    data: [65, 70, 75, 80, 85, 82, 78, 85, 88, 90, 87, 92],
                    borderColor: this.defaults.colors.primary,
                    backgroundColor: this.createGradient(ctx, this.defaults.colors.primary),
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }
            ]
        };
        
        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        };
        
        this.createChart(ctx, 'consistency', config);
    },
    
    // Criar gradiente
    createGradient: function(ctx, color) {
        if (!ctx) return color;
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, color + 'CC');
        gradient.addColorStop(1, color + '33');
        
        return gradient;
    },
    
    // Criar gráfico
    createChart: function(ctx, id, config) {
        if (this.charts[id]) {
            this.charts[id].destroy();
        }
        
        this.charts[id] = new Chart(ctx, config);
    },
    
    // Configurar handler de redimensionamento
    setupResizeHandler: function() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.resizeAllCharts();
            }, 250);
        });
    },
    
    // Redimensionar todos os gráficos
    resizeAllCharts: function() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.resize();
            }
        });
    },
    
    // Atualizar gráfico específico
    updateChart: function(chartId, newData) {
        const chart = this.charts[chartId];
        if (!chart) return;
        
        chart.data = newData;
        chart.update();
    },
    
    // Destruir gráfico
    destroyChart: function(chartId) {
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
            delete this.charts[chartId];
        }
    },
    
    // Exportar gráfico como imagem
    exportChart: function(chartId, format = 'png') {
        const chart = this.charts[chartId];
        if (!chart) return;
        
        const image = chart.toBase64Image();
        const link = document.createElement('a');
        link.href = image;
        link.download = `grafico-${chartId}-${new Date().getTime()}.${format}`;
        link.click();
    },
    
    // Obter dados do gráfico
    getChartData: function(chartId) {
        const chart = this.charts[chartId];
        return chart ? chart.data : null;
    },
    
    // Configurações pré-definidas
    getPredefinedConfig: function(type) {
        const configs = {
            progress: {
                type: 'bar',
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    }
                }
            },
            financial: {
                type: 'line',
                options: {
                    scales: {
                        y: {
                            ticks: {
                                callback: function(value) {
                                    return 'R$ ' + value.toLocaleString('pt-BR');
                                }
                            }
                        }
                    }
                }
            },
            category: {
                type: 'doughnut',
                options: {
                    cutout: '70%'
                }
            }
        };
        
        return configs[type] || {};
    }
};

// Inicializar módulo de gráficos
document.addEventListener('DOMContentLoaded', () => {
    ChartModule.init();
});

// Exportar módulo
window.ChartModule = ChartModule;

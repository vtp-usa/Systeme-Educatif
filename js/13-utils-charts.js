// ============================================================
// js/13-utils-charts.js — Refresh, logout, showAlert, admin dashboard charts
// Lines 7992-8332 of original Ecole-Main-System.html
// ============================================================

        // Refresh the current section
        function refreshPage() {
            var btn = document.getElementById('refresh-btn');
            btn.classList.add('spinning');
            // Re-invoke showSection for the currently active section
            if (appState._activeSectionId) {
                showSection(appState._activeSectionId, appState._activeNavId);
            }
            // Remove spin class after animation completes so it can replay next time
            setTimeout(function() { btn.classList.remove('spinning'); }, 600);
        }

        // Handle Logout
        function handleLogout() {
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
                appState.currentUser = null;
                document.getElementById('app-container').classList.remove('active');
                document.getElementById('login-screen').classList.remove('hidden');
                document.getElementById('login-form').reset();
            }
        }
        
        // Show Alert
        function showAlert(message, type) {
            const alert = document.getElementById('alert');
            const alertMessage = document.getElementById('alert-message');
            
            alert.className = `alert alert-${type} active`;
            alertMessage.textContent = message;
            
            setTimeout(() => {
                alert.classList.remove('active');
            }, 4000);
        }
        
        // Initialize Charts (for Admin Portal)
        let charts = {};
        
        function initializeAdminCharts() {
            // Only initialize if user is admin and charts haven't been created yet
            if (appState.currentUser && appState.currentUser.role === 'admin') {
                // Destroy existing charts if they exist
                Object.values(charts).forEach(chart => {
                    if (chart) chart.destroy();
                });
                charts = {};
                
                // Wait a bit for the DOM to be ready
                setTimeout(() => {
                    createAveragePerClassChart();
                    createCEPResultsChart();
                    createPerformanceTrendChart();
                }, 100);
            }
        }
        
        function createAveragePerClassChart() {
            const ctx = document.getElementById('averagePerClassChart');
            if (!ctx) return;

            // Build dynamic labels + data for each class
            const levelOrder = ['CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2'];
            const sortedClasses = [...appState.classes].sort((a, b) => {
                return levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
            });

            var labels = [];
            var data = [];
            var bgColors = [
                'rgba(212, 95, 59, 0.8)',
                'rgba(227, 156, 61, 0.8)',
                'rgba(74, 144, 164, 0.8)',
                'rgba(45, 122, 78, 0.8)',
                'rgba(139, 111, 71, 0.8)',
                'rgba(74, 144, 164, 0.6)'
            ];
            var borderColors = [
                'rgba(212, 95, 59, 1)',
                'rgba(227, 156, 61, 1)',
                'rgba(74, 144, 164, 1)',
                'rgba(45, 122, 78, 1)',
                'rgba(139, 111, 71, 1)',
                'rgba(74, 144, 164, 1)'
            ];

            sortedClasses.forEach(function(classInfo) {
                var classStudents = appState.students.filter(function(s) { return s.classId === classInfo.id; });
                var studentAverages = [];
                classStudents.forEach(function(student) {
                    var totalSum = 0, totalCount = 0;
                    Object.values(appState.grades).forEach(function(entry) {
                        entry.grades.forEach(function(g) {
                            if (g.studentId === student.id) {
                                totalSum += g.grade;
                                totalCount++;
                            }
                        });
                    });
                    if (totalCount > 0) {
                        studentAverages.push(totalSum / totalCount);
                    }
                });
                labels.push(classInfo.level);
                data.push(studentAverages.length > 0
                    ? parseFloat((studentAverages.reduce(function(s, v) { return s + v; }, 0) / studentAverages.length).toFixed(2))
                    : 0);
            });

            charts.averagePerClass = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Moyenne de Classe',
                        data: data,
                        backgroundColor: bgColors.slice(0, labels.length),
                        borderColor: borderColors.slice(0, labels.length),
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 20,
                            ticks: {
                                callback: function(value) {
                                    return value + '/20';
                                }
                            },
                            grid: {
                                color: 'rgba(107, 93, 79, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
        
        function createCEPResultsChart() {
            const ctx = document.getElementById('cepResultsChart');
            if (!ctx) return;

            // Gather live CM2 data — only admitted students feed the chart
            var cm2Class = appState.classes.find(function(c) { return c.level === 'CM2'; });
            var cm2Students = cm2Class ? appState.students.filter(function(s) { return s.classId === cm2Class.id; }) : [];

            var admisM = 0, admisF = 0;
            cm2Students.forEach(function(s) {
                if (appState.cepResults[s.id] === 'oui') {
                    s.sex === 'M' ? admisM++ : admisF++;
                }
            });

            var hasData = (admisM + admisF) > 0;

            charts.cepResults = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Garçons', 'Filles'],
                    datasets: [{
                        data: hasData ? [admisM, admisF] : [1, 1],
                        backgroundColor: [
                            'rgba(74, 144, 164, 0.88)',
                            'rgba(180, 80, 140, 0.88)'
                        ],
                        borderColor: '#FFFFFF',
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 14,
                                font: { size: 13 },
                                generateLabels: function(chart) {
                                    var d = chart.data;
                                    return d.labels.map(function(label, i) {
                                        return {
                                            text: label + ' (' + d.datasets[0].data[i] + ')',
                                            fillStyle: d.datasets[0].backgroundColor[i],
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    var label = context.label || '';
                                    var value = context.parsed || 0;
                                    var total = context.dataset.data.reduce(function(a, b) { return a + b; }, 0);
                                    var pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                                    return label + ' : ' + value + ' élève(s) (' + pct + '%)';
                                }
                            }
                        }
                    }
                },
                plugins: hasData ? [] : [{
                    id: 'centerText',
                    beforeDraw: function(chart) {
                        var width  = chart.width;
                        var height = chart.height;
                        var ctx2   = chart.ctx;
                        ctx2.restore();
                        ctx2.font = '14px DM Sans, sans-serif';
                        ctx2.fillStyle = '#9ca3af';
                        ctx2.textAlign = 'center';
                        ctx2.textBaseline = 'middle';
                        ctx2.fillText('Aucun élève admis au CEP', width / 2, height / 2);
                        ctx2.save();
                    }
                }]
            });
        }
        
        function createPerformanceTrendChart() {
            const ctx = document.getElementById('performanceTrendChart');
            if (!ctx) return;
            
            charts.performanceTrend = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['2022', '2023', '2024'],
                    datasets: [
                        {
                            label: 'Taux de Réussite CEP (%)',
                            data: [78, 82, 87],
                            borderColor: 'rgba(45, 122, 78, 1)',
                            backgroundColor: 'rgba(45, 122, 78, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 6,
                            pointBackgroundColor: 'rgba(45, 122, 78, 1)',
                            pointBorderColor: '#FFFFFF',
                            pointBorderWidth: 2
                        },
                        {
                            label: 'Moyenne Générale École',
                            data: [12.8, 13.4, 14.2],
                            borderColor: 'rgba(227, 156, 61, 1)',
                            backgroundColor: 'rgba(227, 156, 61, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 6,
                            pointBackgroundColor: 'rgba(227, 156, 61, 1)',
                            pointBorderColor: '#FFFFFF',
                            pointBorderWidth: 2,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                padding: 15,
                                font: {
                                    size: 12,
                                    weight: '600'
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            },
                            grid: {
                                color: 'rgba(107, 93, 79, 0.1)'
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            beginAtZero: true,
                            max: 20,
                            ticks: {
                                callback: function(value) {
                                    return value + '/20';
                                }
                            },
                            grid: {
                                drawOnChartArea: false,
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
        
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            loadData();
        });

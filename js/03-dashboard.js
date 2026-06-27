// ============================================================
// js/03-dashboard.js — Dashboard stats, parent overview, progress charts
// Lines 3406-3921 of original Ecole-Main-System.html
// ============================================================

        // Update Dashboard based on Role
        function updateDashboard() {
            const statsContainer = document.getElementById('stats-container');
            const adminChartsSection = document.getElementById('admin-charts-section');
            const welcomeCard = document.getElementById('welcome-card');
            let stats = [];
            
            if (appState.currentUser.role === 'admin') {
                // Apply logo watermark when dashboard loads
                applyLogoToWatermarks();

                // Compute Moyenne Générale École: average of each class's Moyenne Classe
                var classAverages = [];
                appState.classes.forEach(function(classInfo) {
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
                    // Only include class if at least one student has grades
                    if (studentAverages.length > 0) {
                        var classAvg = studentAverages.reduce(function(s, v) { return s + v; }, 0) / studentAverages.length;
                        classAverages.push(classAvg);
                    }
                });
                var moyenneEcole = classAverages.length > 0
                    ? (classAverages.reduce(function(s, v) { return s + v; }, 0) / classAverages.length).toFixed(2)
                    : '-';

                // Count students in CM2 (the CEP class) and how many are marked Admis
                var cm2Class = appState.classes.find(function(c) { return c.level === 'CM2'; });
                var cm2Students = cm2Class ? appState.students.filter(function(s) { return s.classId === cm2Class.id; }) : [];
                var cm2Total = cm2Students.length;
                var cm2Admis = cm2Students.filter(function(s) { return appState.cepResults[s.id] === 'oui'; }).length;

                stats = [
                    { icon: '🎓', label: 'Taux de Réussite CEP', value: cm2Total > 0 ? Math.round((cm2Admis / cm2Total) * 100) + '%' : '0%', trend: '+5% vs année précédente', trendClass: 'trend-positive' },
                    { icon: '✓', label: 'Admis CEP 2024', value: cm2Admis + '/' + cm2Total, trend: 'Élèves de CM2', trendClass: '' },
                    { icon: '📊', label: 'Moyenne Générale École', value: moyenneEcole === '-' ? '-' : moyenneEcole + '/20', trend: classAverages.length > 0 ? classAverages.length + ' classe(s) avec notes' : 'Aucune note enregistrée', trendClass: '' }
                ];
                
                // Show admin charts in dashboard
                if (adminChartsSection) {
                    adminChartsSection.style.display = 'block';
                    // Initialize charts after a short delay to ensure DOM is ready
                    setTimeout(() => {
                        initializeAdminCharts();
                    }, 100);
                }
                
                // Hide welcome card for admin
                if (welcomeCard) welcomeCard.style.display = 'none';
                
            } else if (appState.currentUser.role === 'teacher') {
                const myStudents = getTeacherStudents();

                // Compute Moyenne Classe: average of each student's Moyenne Générale
                var studentAverages = [];
                myStudents.forEach(function(student) {
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
                var moyenneClasse = studentAverages.length > 0
                    ? (studentAverages.reduce(function(s, v) { return s + v; }, 0) / studentAverages.length).toFixed(2)
                    : '-';

                stats = [
                    { icon: '👨‍🎓', label: 'Mes Élèves', value: myStudents.length.toString() },
                    { icon: '📝', label: 'Moyenne Classe', value: moyenneClasse === '-' ? '-' : moyenneClasse + '/20' }
                ];
                
                // Hide admin sections
                if (adminChartsSection) adminChartsSection.style.display = 'none';
                if (welcomeCard) welcomeCard.style.display = 'block';
                
                
            } else if (appState.currentUser.role === 'parent') {
                const children = getParentChildren();
                const avgGrade = children.length > 0 
                    ? (children.reduce((sum, child) => sum + (child.averages.trimester3 || 0), 0) / children.length).toFixed(1)
                    : '0';
                stats = [
                    { icon: '👨‍🎓', label: 'Mes Enfants', value: children.length.toString() },
                    { icon: '📝', label: 'Moyenne Générale', value: avgGrade + '/20' }
                ];
                
                // Hide admin sections
                if (adminChartsSection) adminChartsSection.style.display = 'none';
                if (welcomeCard) welcomeCard.style.display = 'none';
                
            } else if (appState.currentUser.role === 'student') {
                var studentId = appState.currentUser.studentId;
                var student = appState.students.find(function(s) { return s.id === studentId; });
                
                if (student) {
                    // Calculate student's average
                    var totalSum = 0, totalCount = 0;
                    Object.values(appState.grades).forEach(function(entry) {
                        entry.grades.forEach(function(g) {
                            if (g.studentId === studentId) {
                                totalSum += g.grade;
                                totalCount++;
                            }
                        });
                    });
                    var myAverage = totalCount > 0 ? (totalSum / totalCount).toFixed(2) : '-';
                    
                    // Count absences
                    var myAbsences = appState.absences.filter(function(a) { return a.studentId === studentId; }).length;
                    
                    // Count pending homework
                    var classInfo = appState.classes.find(function(c) { return c.id === student.classId; });
                    var pendingHomework = appState.homework.filter(function(h) { 
                        return h.classId === student.classId && 
                               (!appState.homeworkSubmissions[h.id] || !appState.homeworkSubmissions[h.id][studentId] || !appState.homeworkSubmissions[h.id][studentId].submitted);
                    }).length;
                    
                    // Merit points
                    var meritPoints = appState.meritPoints[studentId] || 0;
                    
                    stats = [
                        { icon: '📝', label: 'Ma Moyenne', value: myAverage === '-' ? '-' : myAverage + '/20' },
                        { icon: '📋', label: 'Mes Absences', value: myAbsences.toString() },
                        { icon: '📚', label: 'Devoirs En Cours', value: pendingHomework.toString() },
                        { icon: '⭐', label: 'Points de Mérite', value: meritPoints.toString() }
                    ];
                } else {
                    stats = [];
                }
                
                // Hide admin sections
                if (adminChartsSection) adminChartsSection.style.display = 'none';
                if (welcomeCard) welcomeCard.style.display = 'block';
                
            } else if (appState.currentUser.role === 'econome') {
                // Total payments, total amount, students with pending
                var totalPayments = appState.payments.length;
                var totalAmount   = appState.payments.reduce(function(sum, p) { return sum + p.amount; }, 0);
                // Count unique students who have paid
                var paidStudentIds = {};
                appState.payments.forEach(function(p) { paidStudentIds[p.studentId] = true; });
                var paidCount = Object.keys(paidStudentIds).length;
                stats = [
                    { icon: '💰', label: 'Paiements Enregistrés', value: totalPayments.toString() },
                    { icon: '📊', label: 'Montant Total', value: totalAmount.toLocaleString('fr-FR') + ' FCFA' },
                    { icon: '👨‍🎓', label: 'Élèves Payants', value: paidCount + ' / ' + appState.students.length }
                ];
                // Hide admin sections
                if (adminChartsSection) adminChartsSection.style.display = 'none';
                if (welcomeCard) welcomeCard.style.display = 'none';
                
            }
            
            statsContainer.innerHTML = stats.map(stat => `
                <div class="stat-card">
                    <div class="stat-icon">${stat.icon}</div>
                    <div class="stat-label">${stat.label}</div>
                    <div class="stat-value">${stat.value}</div>
                    ${stat.trend ? `<div style="font-size: 0.875rem; color: ${stat.trendClass === 'trend-positive' ? 'var(--green)' : 'var(--gray-text)'}; margin-top: 0.5rem;">${stat.trend}</div>` : ''}
                </div>
            `).join('');
            
            // Add Total d'Élèves par Classe card for admin
            if (appState.currentUser.role === 'admin') {
                const classTotalsCard = createClassTotalsCard();
                statsContainer.innerHTML += classTotalsCard;
            }
            
            // Load parent's children overview if parent
            if (appState.currentUser.role === 'parent') {
                loadParentChildrenOverview();
            }
        }
        
        // Create Class Totals Card
        function createClassTotalsCard() {
            // Sort classes by level
            const levelOrder = ['CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2'];
            const sortedClasses = [...appState.classes].sort((a, b) => {
                return levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
            });
            
            const tableRows = sortedClasses.map(classInfo => {
                const studentCount = appState.students.filter(s => s.classId === classInfo.id).length;
                return `
                    <tr style="border-bottom: 1px solid var(--border);">
                        <td style="padding: 0.5rem 0; font-weight: 600; color: var(--dark-text);">${classInfo.level}</td>
                        <td style="padding: 0.5rem 0; text-align: right; color: var(--gray-text); font-weight: 600;">${studentCount}</td>
                    </tr>
                `;
            }).join('');
            
            return `
                <div class="stat-card" style="border-left: 4px solid var(--sky);">
                    <div class="stat-icon">📋</div>
                    <div class="stat-label" style="margin-bottom: 1rem;">Total d'Élèves par Classe</div>
                    <div style="margin-top: 0.75rem;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
        
        // Get Parent's Children
        function getParentChildren() {
            if (!appState.currentUser || !appState.currentUser.childrenIds) return [];
            return appState.students.filter(s => appState.currentUser.childrenIds.includes(s.id));
        }
        
        // Load Parent's Children Overview (Dashboard)
        function loadParentChildrenOverview() {
            const container = document.getElementById('parent-children-overview');
            const children = getParentChildren();
            
            if (children.length === 0) {
                container.style.display = 'none';
                return;
            }
            
            container.style.display = 'block';
            container.innerHTML = children.map(child => {
                const classInfo = appState.classes.find(c => c.id === child.classId);
                const latestAvg = child.averages.trimester3 || child.averages.trimester2 || child.averages.trimester1 || 0;
                
                return `
                    <div class="card" style="margin-bottom: 1.5rem;">
                        <div class="card-header" style="background: linear-gradient(135deg, var(--earth) 0%, var(--savanna) 100%); color: var(--white);">
                            <h3 class="card-title" style="color: var(--white); display: flex; justify-content: space-between; align-items: center;">
                                <span>👨‍🎓 ${child.name}</span>
                                <span style="font-size: 0.9rem; opacity: 0.9;">${child.matricule}</span>
                            </h3>
                        </div>
                        <div class="card-body">
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                                <div>
                                    <div style="font-size: 0.875rem; color: var(--gray-text);">Classe</div>
                                    <div style="font-size: 1.1rem; font-weight: 700; color: var(--earth);">${classInfo ? classInfo.name : 'N/A'}</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.875rem; color: var(--gray-text);">Enseignant</div>
                                    <div style="font-size: 1.1rem; font-weight: 600; color: var(--earth);">${classInfo ? classInfo.teacher : 'N/A'}</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.875rem; color: var(--gray-text);">Moyenne Actuelle</div>
                                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--green);">${latestAvg.toFixed(1)}/20</div>
                                </div>
                            </div>
                            
                            <div style="background: var(--light-bg); padding: 1rem; border-radius: 8px;">
                                <div style="font-weight: 600; margin-bottom: 0.75rem; color: var(--earth);">Moyennes par Trimestre</div>
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                                    <div style="text-align: center; padding: 0.75rem; background: var(--white); border-radius: 8px; border: 2px solid var(--border);">
                                        <div style="font-size: 0.75rem; color: var(--gray-text); margin-bottom: 0.25rem;">1er Trimestre</div>
                                        <div style="font-size: 1.3rem; font-weight: 700; color: ${child.averages.trimester1 >= 14 ? 'var(--green)' : child.averages.trimester1 >= 10 ? 'var(--ochre)' : 'var(--terracotta)'};">
                                            ${child.averages.trimester1 ? child.averages.trimester1.toFixed(1) : '-'}/20
                                        </div>
                                    </div>
                                    <div style="text-align: center; padding: 0.75rem; background: var(--white); border-radius: 8px; border: 2px solid var(--border);">
                                        <div style="font-size: 0.75rem; color: var(--gray-text); margin-bottom: 0.25rem;">2ème Trimestre</div>
                                        <div style="font-size: 1.3rem; font-weight: 700; color: ${child.averages.trimester2 >= 14 ? 'var(--green)' : child.averages.trimester2 >= 10 ? 'var(--ochre)' : 'var(--terracotta)'};">
                                            ${child.averages.trimester2 ? child.averages.trimester2.toFixed(1) : '-'}/20
                                        </div>
                                    </div>
                                    <div style="text-align: center; padding: 0.75rem; background: var(--white); border-radius: 8px; border: 2px solid var(--border);">
                                        <div style="font-size: 0.75rem; color: var(--gray-text); margin-bottom: 0.25rem;">3ème Trimestre</div>
                                        <div style="font-size: 1.3rem; font-weight: 700; color: ${child.averages.trimester3 >= 14 ? 'var(--green)' : child.averages.trimester3 >= 10 ? 'var(--ochre)' : 'var(--terracotta)'};">
                                            ${child.averages.trimester3 ? child.averages.trimester3.toFixed(1) : '-'}/20
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Load Parent Reports
        function loadParentReports() {
            const parentView = document.getElementById('parent-reports-view');
            const defaultView = document.getElementById('default-reports-view');
            const children = getParentChildren();
            
            if (children.length === 0) {
                parentView.style.display = 'none';
                defaultView.style.display = 'block';
                return;
            }
            
            parentView.style.display = 'block';
            defaultView.style.display = 'none';
            
            parentView.innerHTML = children.map(child => {
                const classInfo = appState.classes.find(c => c.id === child.classId);
                
                return `
                    <div class="card" style="margin-bottom: 2rem;">
                        <div class="card-header" style="background: linear-gradient(135deg, var(--earth) 0%, var(--savanna) 100%); color: var(--white);">
                            <h3 class="card-title" style="color: var(--white);">
                                📋 Bulletin Scolaire - ${child.name}
                            </h3>
                        </div>
                        <div class="card-body">
                            <!-- Student Info -->
                            <div style="background: var(--light-bg); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                                    <div>
                                        <div style="font-size: 0.875rem; color: var(--gray-text); margin-bottom: 0.25rem;">Nom Complet</div>
                                        <div style="font-size: 1.1rem; font-weight: 700; color: var(--earth);">${child.name}</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 0.875rem; color: var(--gray-text); margin-bottom: 0.25rem;">Matricule</div>
                                        <div style="font-size: 1.1rem; font-weight: 600; color: var(--earth);">${child.matricule}</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 0.875rem; color: var(--gray-text); margin-bottom: 0.25rem;">Classe</div>
                                        <div style="font-size: 1.1rem; font-weight: 700; color: var(--earth);">${classInfo ? classInfo.name : 'N/A'}</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 0.875rem; color: var(--gray-text); margin-bottom: 0.25rem;">Enseignant</div>
                                        <div style="font-size: 1.1rem; font-weight: 600; color: var(--earth);">${classInfo ? classInfo.teacher : 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Grades Table -->
                            <h4 style="margin-bottom: 1rem; color: var(--earth); font-size: 1.2rem;">📊 Moyennes Trimestrielles</h4>
                            <div style="overflow-x: auto;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <thead>
                                        <tr style="background: linear-gradient(135deg, var(--earth) 0%, var(--savanna) 100%); color: var(--white);">
                                            <th style="padding: 1rem; text-align: left; border-radius: 8px 0 0 0;">Trimestre</th>
                                            <th style="padding: 1rem; text-align: center;">Moyenne</th>
                                            <th style="padding: 1rem; text-align: center;">Appréciation</th>
                                            <th style="padding: 1rem; text-align: center; border-radius: 0 8px 0 0;">Évolution</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${generateTrimesterRows(child)}
                                    </tbody>
                                </table>
                            </div>
                            
                            <!-- Performance Chart -->
                            <div style="margin-top: 2rem; background: var(--light-bg); padding: 1.5rem; border-radius: 8px;">
                                <h4 style="margin-bottom: 1rem; color: var(--earth);">📈 Évolution de la Moyenne</h4>
                                <canvas id="chart-${child.id}" style="max-height: 250px;"></canvas>
                            </div>
                            
                            <!-- Comments Section -->
                            <div style="margin-top: 1.5rem; padding: 1.5rem; background: var(--white); border: 2px solid var(--border); border-radius: 8px;">
                                <h4 style="margin-bottom: 0.75rem; color: var(--earth);">💬 Observations Générales</h4>
                                <p style="color: var(--gray-text); line-height: 1.6;">
                                    ${generateComments(child)}
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Initialize charts for each child
            setTimeout(() => {
                children.forEach(child => {
                    createStudentProgressChart(child);
                });
            }, 100);
        }
        
        // Generate Trimester Rows
        function generateTrimesterRows(child) {
            const trimesters = [
                { name: '1er Trimestre', value: child.averages.trimester1, prev: null },
                { name: '2ème Trimestre', value: child.averages.trimester2, prev: child.averages.trimester1 },
                { name: '3ème Trimestre', value: child.averages.trimester3, prev: child.averages.trimester2 }
            ];
            
            return trimesters.map(tri => {
                const avg = tri.value || 0;
                const appreciation = avg >= 16 ? 'Très Bien' : avg >= 14 ? 'Bien' : avg >= 12 ? 'Assez Bien' : avg >= 10 ? 'Passable' : 'Insuffisant';
                const color = avg >= 14 ? 'var(--green)' : avg >= 10 ? 'var(--ochre)' : 'var(--terracotta)';
                
                let evolution = '-';
                let evolutionColor = 'var(--gray-text)';
                if (tri.prev !== null && tri.value) {
                    const diff = tri.value - tri.prev;
                    if (diff > 0) {
                        evolution = `+${diff.toFixed(1)} ↗`;
                        evolutionColor = 'var(--green)';
                    } else if (diff < 0) {
                        evolution = `${diff.toFixed(1)} ↘`;
                        evolutionColor = 'var(--terracotta)';
                    } else {
                        evolution = '0.0 →';
                        evolutionColor = 'var(--gray-text)';
                    }
                }
                
                return `
                    <tr style="border-bottom: 1px solid var(--border);">
                        <td style="padding: 1rem; font-weight: 600;">${tri.name}</td>
                        <td style="padding: 1rem; text-align: center; font-size: 1.3rem; font-weight: 700; color: ${color};">
                            ${tri.value ? tri.value.toFixed(1) : '-'}/20
                        </td>
                        <td style="padding: 1rem; text-align: center; font-weight: 600; color: ${color};">
                            ${tri.value ? appreciation : '-'}
                        </td>
                        <td style="padding: 1rem; text-align: center; font-weight: 600; color: ${evolutionColor};">
                            ${evolution}
                        </td>
                    </tr>
                `;
            }).join('');
        }
        
        // Generate Comments
        function generateComments(child) {
            const latestAvg = child.averages.trimester3 || child.averages.trimester2 || child.averages.trimester1;
            
            if (latestAvg >= 16) {
                return `Excellent travail! ${child.name.split(' ')[1]} démontre une grande maîtrise des compétences et un engagement remarquable. Continuez ainsi!`;
            } else if (latestAvg >= 14) {
                return `Très bon travail! ${child.name.split(' ')[1]} montre de solides compétences et un bon investissement dans les apprentissages. Quelques efforts supplémentaires pour atteindre l'excellence.`;
            } else if (latestAvg >= 12) {
                return `Bon travail. ${child.name.split(' ')[1]} progresse de manière satisfaisante. Il/Elle doit poursuivre ses efforts et approfondir certains acquis pour améliorer ses résultats.`;
            } else if (latestAvg >= 10) {
                return `Travail acceptable. ${child.name.split(' ')[1]} doit redoubler d'efforts et renforcer ses bases dans plusieurs matières. Un accompagnement supplémentaire est recommandé.`;
            } else {
                return `Des efforts importants sont nécessaires. ${child.name.split(' ')[1]} rencontre des difficultés qui nécessitent une attention particulière et un soutien renforcé. Nous recommandons un suivi personnalisé.`;
            }
        }
        
        // Create Student Progress Chart
        function createStudentProgressChart(child) {
            const ctx = document.getElementById(`chart-${child.id}`);
            if (!ctx) return;
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['1er Trimestre', '2ème Trimestre', '3ème Trimestre'],
                    datasets: [{
                        label: 'Moyenne',
                        data: [
                            child.averages.trimester1 || null,
                            child.averages.trimester2 || null,
                            child.averages.trimester3 || null
                        ],
                        borderColor: 'rgba(45, 122, 78, 1)',
                        backgroundColor: 'rgba(45, 122, 78, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 8,
                        pointBackgroundColor: 'rgba(45, 122, 78, 1)',
                        pointBorderColor: '#FFFFFF',
                        pointBorderWidth: 3,
                        pointHoverRadius: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
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
        

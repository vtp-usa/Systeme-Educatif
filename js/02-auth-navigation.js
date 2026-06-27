// ============================================================
// js/02-auth-navigation.js — Login, role config, navigation, section switching
// Lines 3092-3405 of original Ecole-Main-System.html
// ============================================================

        // Navigation Configuration by Role
        const navigationConfig = {
            admin: [
                { id: 'dashboard', icon: '📊', label: 'Tableau de Bord', section: 'dashboard-section' },
                { id: 'students', icon: '👨‍🎓', label: 'Registration Élèves', section: 'students-section' },
                { id: 'absences', icon: '📋', label: 'Absences', section: 'absences-section' },
                { id: 'grades', icon: '📝', label: 'Moyennes Et Resultats', section: 'grades-section' },
                { id: 'bulletin', icon: '📋', label: 'Bulletin', section: 'bulletin-section' },
                { id: 'schedule', icon: '📅', label: 'Emploi du Temps', section: 'schedule-section' },
                { id: 'reports', icon: '📄', label: 'Rapports', section: 'reports-section' },
                { id: 'admin', icon: '👨‍🏫', label: 'Registration Enseignant', section: 'admin-section' },
                { id: 'archives', icon: '📚', label: 'Archives', section: 'archives-section' },
                { id: 'config', icon: '⚙️', label: 'Configuration', section: 'config-section' },
                { id: 'communications', icon: '💬', label: 'Communications', section: 'communications-section' }
            ],
            teacher: [
                { id: 'dashboard', icon: '📊', label: 'Tableau de Bord', section: 'dashboard-section' },
                { id: 'students', icon: '👨‍🎓', label: 'Élèves', section: 'students-section' },
                { id: 'absences', icon: '📋', label: 'Absences', section: 'absences-section' },
                { id: 'grades', icon: '📝', label: 'Notes', section: 'grades-section' },
                { id: 'homework', icon: '📚', label: 'Devoirs', section: 'homework-section' },
                { id: 'schedule', icon: '📅', label: 'Emploi du Temps', section: 'schedule-section' },
                { id: 'communications', icon: '💬', label: 'Messages', section: 'communications-section' },
                { id: 'reports', icon: '📄', label: 'Rapports', section: 'reports-section' }
            ],
            parent: [
                { id: 'dashboard', icon: '📊', label: 'Tableau de Bord', section: 'dashboard-section' },
                { id: 'absences', icon: '📋', label: 'Absences', section: 'absences-section' },
                { id: 'homework', icon: '📚', label: 'Devoirs', section: 'homework-section' },
                { id: 'payments', icon: '💰', label: 'Paiements', section: 'payments-section' },
                { id: 'bulletin', icon: '📄', label: 'Bulletins', section: 'bulletin-section' },
                { id: 'communications', icon: '💬', label: 'Messages', section: 'communications-section' },
                { id: 'profile', icon: '👤', label: 'Mon Profil', section: 'profile-section' }
            ],
            student: [
                { id: 'dashboard', icon: '📊', label: 'Tableau de Bord', section: 'dashboard-section' },
                { id: 'grades', icon: '📝', label: 'Mes Notes', section: 'grades-section' },
                { id: 'absences', icon: '📋', label: 'Mes Absences', section: 'absences-section' },
                { id: 'homework', icon: '📚', label: 'Mes Devoirs', section: 'homework-section' },
                { id: 'schedule', icon: '📅', label: 'Emploi du Temps', section: 'schedule-section' },
                { id: 'bulletin', icon: '📄', label: 'Mon Bulletin', section: 'bulletin-section' },
                { id: 'announcements', icon: '📢', label: 'Annonces', section: 'announcements-section' },
                { id: 'profile', icon: '👤', label: 'Mon Profil', section: 'profile-section' }
            ],
            econome: [
                { id: 'dashboard', icon: '📊', label: 'Tableau de Bord', section: 'dashboard-section' },
                { id: 'payments', icon: '💰', label: 'Paiements', section: 'payments-section' }
            ]
        };
        
        // Role Display Names and Avatars
        const roleConfig = {
            admin: { name: 'Administrateur', avatar: '👨‍💼' },
            teacher: { name: 'Enseignant', avatar: '👨‍🏫' },
            parent: { name: 'Parent', avatar: '👨‍👩‍👧' },
            student: { name: 'Élève', avatar: '👨‍🎓' },
            econome: { name: 'Économe', avatar: '💰' }
        };
        
        // Handle Login
        function handleLogin(event) {
            event.preventDefault();
            
            const role = document.querySelector('input[name="role"]:checked').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Find matching user
            const user = appState.users.find(u => 
                u.username === username && 
                u.password === password && 
                u.role === role
            );
            
            if (user) {
                appState.currentUser = user;
                showApp();
                showAlert('Connexion réussie! Bienvenue ' + user.fullName, 'success');
            } else {
                alert('Identifiants incorrects. Veuillez vérifier votre nom d\'utilisateur, mot de passe et rôle.');
            }
        }
        
        // Show Application
        function showApp() {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('app-container').classList.add('active');
            
            // Update user profile
            const config = roleConfig[appState.currentUser.role];
            document.getElementById('sidebar-username').textContent = appState.currentUser.fullName;
            document.getElementById('sidebar-role').textContent = config.name;
            document.getElementById('sidebar-avatar').textContent = config.avatar;
            
            // Build navigation
            buildNavigation();

            // Refresh button: visible only for admin and teacher
            document.getElementById('refresh-btn').style.display =
                (appState.currentUser.role === 'parent') ? 'none' : 'flex';
            
            // Load saved data
            loadData();
            
            // Update dashboard
            updateDashboard();
            
            // Setup event listeners for teacher
            if (appState.currentUser.role === 'teacher') {
                setupTeacherEventListeners();
            }
        }
        
        // Setup Teacher Event Listeners
        function setupTeacherEventListeners() {
            // Load grades table when subject changes
            const subjectSelect = document.getElementById('grade-subject');
            if (subjectSelect) {
                subjectSelect.addEventListener('change', function() {
                    if (this.value) {
                        loadGradesTable();
                    }
                });
            }
        }
        
        // Build Navigation based on Role
        function buildNavigation() {
            const navMenu = document.getElementById('nav-menu');
            const navItems = navigationConfig[appState.currentUser.role];
            
            navMenu.innerHTML = navItems.map(item => `
                <li class="nav-item">
                    <a href="#" class="nav-link ${item.id === 'dashboard' ? 'active' : ''}" 
                       onclick="showSection('${item.section}', '${item.id}'); return false;">
                        <span class="nav-icon">${item.icon}</span>
                        <span>${item.label}</span>
                    </a>
                </li>
            `).join('');
        }
        
        // Show Section
        function showSection(sectionId, navId) {
            // Remember active section for refresh
            appState._activeSectionId = sectionId;
            appState._activeNavId    = navId;

            // Hide all sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show selected section
            document.getElementById(sectionId).classList.add('active');
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            document.querySelector(`[onclick*="${sectionId}"]`).classList.add('active');
            
            // Load data based on section and role
            if (sectionId === 'dashboard-section') {
                updateDashboard();
            } else if (sectionId === 'students-section') {
                // Update section title based on role
                const studentsHeaderTitle = document.querySelector('#students-section .header-title');
                if (studentsHeaderTitle) {
                    studentsHeaderTitle.textContent = appState.currentUser.role === 'admin' ? 'Registration Élèves' : 'Ma Classe';
                }
                
                // Update table header based on role
                const tableHeader = document.getElementById('students-table-header');
                if (appState.currentUser.role === 'admin') {
                    // Admin sees full table with Actions column
                    tableHeader.innerHTML = `
                        <tr style="background: linear-gradient(135deg, var(--earth) 0%, var(--savanna) 100%); color: var(--white);">
                            <th style="padding: 1rem; text-align: left; border-radius: 8px 0 0 0; width: 50px;">#</th>
                            <th style="padding: 1rem; text-align: left;">Nom Complet</th>
                            <th style="padding: 1rem; text-align: left;">Matricule</th>
                            <th style="padding: 1rem; text-align: center;">Sexe</th>
                            <th style="padding: 1rem; text-align: left;">Date de Naissance</th>
                            <th style="padding: 1rem; text-align: center;">Âge</th>
                            <th style="padding: 1rem; text-align: left;">👨‍👩‍👧 Parent</th>
                            <th style="padding: 1rem; text-align: center;">Relation</th>
                            <th style="padding: 1rem; text-align: left;">📞 Téléphone</th>
                            <th style="padding: 1rem; text-align: left;">✉️ Email</th>
                            <th style="padding: 1rem; text-align: center; border-radius: 0 8px 0 0;">Actions</th>
                        </tr>
                    `;
                } else if (appState.currentUser.role === 'teacher') {
                    // Teacher sees view-only table: #, Nom Complet, Matricule, Sexe only
                    tableHeader.innerHTML = `
                        <tr style="background: linear-gradient(135deg, var(--earth) 0%, var(--savanna) 100%); color: var(--white);">
                            <th style="padding: 1rem; text-align: left; border-radius: 8px 0 0 0; width: 50px;">#</th>
                            <th style="padding: 1rem; text-align: left;">Nom Complet</th>
                            <th style="padding: 1rem; text-align: left;">Matricule</th>
                            <th style="padding: 1rem; text-align: center; border-radius: 0 8px 0 0;">Sexe</th>
                        </tr>
                    `;
                }
                
                if (appState.currentUser.role === 'admin') {
                    // Show class selector and management interface for admin
                    document.getElementById('students-class-selector-container').style.display = 'block';
                    document.getElementById('add-student-btn').style.display = 'block';
                    populateClassSelector();
                } else if (appState.currentUser.role === 'teacher') {
                    // Hide class selector and add button for teacher (they only view their class)
                    document.getElementById('students-class-selector-container').style.display = 'none';
                    document.getElementById('add-student-btn').style.display = 'none';
                    loadTeacherStudentsInSection();
                }
            } else if (appState.currentUser.role === 'teacher') {
                if (sectionId === 'grades-section') {
                    document.querySelector('#grades-section .header-title').textContent = 'Notes';
                    loadGradesTable();
                    // Detect current trimestre and configure date picker
                    var ct = getCurrentTrimestre();
                    var datePicker = document.getElementById('grade-date');
                    var badge = document.getElementById('grade-trimestre-badge');
                    if (ct) {
                        badge.textContent = ct.label;
                        badge.style.background = 'linear-gradient(135deg,var(--earth) 0%,var(--savanna) 100%)';
                        badge.style.opacity = '1';
                        datePicker.setAttribute('min', ct.min);
                        datePicker.setAttribute('max', ct.max);
                        datePicker.valueAsDate = new Date();
                    } else {
                        badge.textContent = 'Vacances scolaires';
                        badge.style.background = 'var(--gray-text)';
                        badge.style.opacity = '0.7';
                        datePicker.removeAttribute('min');
                        datePicker.removeAttribute('max');
                        datePicker.value = '';
                    }
                } else if (sectionId === 'absences-section') {
                    loadAbsencesSection();
                } else if (sectionId === 'schedule-section') {
                    loadScheduleTeacher();
                } else if (sectionId === 'communications-section') {
                    loadCommunications();
                } else if (sectionId === 'homework-section') {
                    loadHomework();
                }
            } else if (appState.currentUser.role === 'parent') {
                if (sectionId === 'absences-section') {
                    loadAbsencesSection();
                } else if (sectionId === 'payments-section') {
                    loadPaymentsParent();
                } else if (sectionId === 'bulletin-section') {
                    initBulletinParent();
                } else if (sectionId === 'profile-section') {
                    loadParentProfile();
                } else if (sectionId === 'communications-section') {
                    loadCommunications();
                } else if (sectionId === 'homework-section') {
                    loadHomework();
                }
            } else if (appState.currentUser.role === 'student') {
                if (sectionId === 'grades-section') {
                    loadStudentGrades();
                } else if (sectionId === 'absences-section') {
                    loadStudentAbsences();
                } else if (sectionId === 'bulletin-section') {
                    initBulletinStudent();
                } else if (sectionId === 'homework-section') {
                    loadHomeworkStudent();
                } else if (sectionId === 'schedule-section') {
                    loadScheduleStudent();
                } else if (sectionId === 'announcements-section') {
                    loadAnnouncementsForStudent();
                } else if (sectionId === 'profile-section') {
                    loadStudentProfile();
                }
            } else if (appState.currentUser.role === 'econome') {
                if (sectionId === 'payments-section') {
                    loadPaymentsEconome();
                    loadExemptions();
                }
            } else if (appState.currentUser.role === 'admin') {
                if (sectionId === 'grades-section') {
                    document.querySelector('#grades-section .header-title').textContent = 'Moyennes Et Resultats';
                    switchGradeTab('moyenne');
                } else if (sectionId === 'bulletin-section') {
                    initBulletin();
                } else if (sectionId === 'admin-section') {
                    loadAdminTeachers();
                } else if (sectionId === 'absences-section') {
                    loadAbsencesSection();
                } else if (sectionId === 'schedule-section') {
                    initScheduleAdmin();
                } else if (sectionId === 'archives-section') {
                    loadArchives();
                } else if (sectionId === 'reports-section') {
                    document.getElementById('admin-reports-view').style.display = 'block';
                    document.getElementById('default-reports-view').style.display = 'none';
                } else if (sectionId === 'config-section') {
                    loadSchoolInfo();
                    loadLogoConfigPreview();
                    loadSignatureConfigPreview();
                    loadHeadmasterSignaturePreview();
                    loadClassManagement();
                    loadSubjectManagement();
                    applyLogoToWatermarks();
                } else if (sectionId === 'communications-section') {
                    loadCommunications();
                } else if (sectionId === 'homework-section') {
                    loadHomework();
                }
            }
        }
        

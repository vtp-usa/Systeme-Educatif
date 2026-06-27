// ============================================================
// js/12-student-portal.js — All student-role UI: grades, absences, homework, bulletin, profile
// Lines 7702-7991 of original Ecole-Main-System.html
// ============================================================

        // ---- Student Role Functions ----

        function loadStudentGrades() {
            // Show student's own grades
            var studentId = appState.currentUser.studentId;
            var student = appState.students.find(function(s) { return s.id === studentId; });
            if (!student) return;

            // Update header
            document.querySelector('#grades-section .header-title').textContent = 'Mes Notes';

            // Show only the detailed grades tab
            var tabs = document.querySelectorAll('.grade-tab');
            tabs.forEach(function(tab) {
                if (tab.dataset.tab === 'detailed') {
                    tab.style.display = 'block';
                    tab.classList.add('active');
                } else {
                    tab.style.display = 'none';
                }
            });

            // Load detailed grades for this student only
            switchGradeTab('detailed');
        }

        function loadStudentAbsences() {
            // Show student's own absences
            var studentId = appState.currentUser.studentId;
            var student = appState.students.find(function(s) { return s.id === studentId; });
            if (!student) return;

            var tbody = document.getElementById('absences-tbody');
            var absences = appState.absences.filter(function(a) { return a.studentId === studentId; });

            if (absences.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--gray-text);">Aucune absence enregistrée</td></tr>';
                return;
            }

            tbody.innerHTML = absences.map(function(abs) {
                var date = new Date(abs.date).toLocaleDateString('fr-FR');
                var typeLabel = abs.type === 'Retard' ? '🕐 Retard' : '❌ Absence';
                var statusColor = abs.status === 'Justifié' ? 'var(--earth)' : 'var(--terracotta)';
                var statusLabel = abs.status === 'Justifié' ? '✓ Justifié' : '⚠ Non justifié';
                
                return '<tr>' +
                    '<td>' + date + '</td>' +
                    '<td>' + student.name + '</td>' +
                    '<td><span style="color:' + (abs.type === 'Retard' ? 'var(--savanna)' : 'var(--terracotta)') + ';font-weight:600;">' + typeLabel + '</span></td>' +
                    '<td>' + (abs.subject || 'N/A') + '</td>' +
                    '<td><span style="color:' + statusColor + ';font-weight:600;">' + statusLabel + '</span></td>' +
                    '<td>' + (abs.reason || '-') + '</td>' +
                '</tr>';
            }).join('');
        }

        function initBulletinStudent() {
            // Show student's own bulletin
            var studentId = appState.currentUser.studentId;
            loadBulletin();
            
            // Hide selector, auto-select this student
            var selector = document.getElementById('bulletin-student-select');
            if (selector) {
                selector.value = studentId;
                selector.disabled = true;
                selector.parentElement.style.display = 'none';
            }
        }

        function loadHomeworkStudent() {
            // Show homework assigned to student's class
            var studentId = appState.currentUser.studentId;
            var student = appState.students.find(function(s) { return s.id === studentId; });
            if (!student) return;

            var container = document.getElementById('homework-parent-view');
            container.style.display = 'block';
            document.getElementById('homework-teacher-view').style.display = 'none';

            var homework = appState.homework.filter(function(h) { return h.classId === student.classId; });

            if (homework.length === 0) {
                container.innerHTML = '<div class="card"><div class="card-body"><p style="text-align:center;color:var(--gray-text);">Aucun devoir en cours</p></div></div>';
                return;
            }

            container.innerHTML = '<div class="card">' +
                '<div class="card-header"><h3 class="card-title">Mes Devoirs</h3></div>' +
                '<div class="card-body">' +
                    homework.map(function(hw) {
                        var subject = appState.subjects.find(function(s) { return s.id === hw.subjectId; });
                        var dueDate = new Date(hw.dueDate);
                        var isOverdue = dueDate < new Date();
                        var submission = appState.homeworkSubmissions[hw.id] && appState.homeworkSubmissions[hw.id][studentId];
                        var isSubmitted = submission && submission.submitted;

                        return '<div style="padding:1.25rem;border:2px solid var(--border);border-radius:8px;background:var(--light-bg);margin-bottom:1rem;">' +
                            '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.5rem;">' +
                                '<h4 style="margin:0;color:var(--dark-text);">' + hw.title + '</h4>' +
                                (isSubmitted ? '<span style="background:var(--earth);color:var(--white);padding:0.25rem 0.75rem;border-radius:6px;font-size:0.875rem;font-weight:600;">✓ Rendu</span>' : '') +
                            '</div>' +
                            '<div style="font-size:0.85rem;color:var(--gray-text);margin-bottom:0.75rem;">' + (subject ? subject.name : 'N/A') + ' • Échéance: ' + dueDate.toLocaleDateString('fr-FR') + (isOverdue && !isSubmitted ? ' <span style="color:var(--terracotta);font-weight:600;">⏰ DÉPASSÉ</span>' : '') + '</div>' +
                            '<div style="color:var(--dark-text);line-height:1.6;">' + hw.description + '</div>' +
                        '</div>';
                    }).join('') +
                '</div>' +
            '</div>';
        }

        function loadScheduleStudent() {
            // Show schedule for student's class
            var studentId = appState.currentUser.studentId;
            var student = appState.students.find(function(s) { return s.id === studentId; });
            if (!student) return;

            var classInfo = appState.classes.find(function(c) { return c.id === student.classId; });
            
            // Filter schedule to show only this class
            var scheduleFilter = document.getElementById('schedule-teacher-filter');
            if (scheduleFilter) {
                scheduleFilter.style.display = 'none';
            }

            loadSchedule();
        }

        function loadCommunicationsStudent() {
            // Students see announcements and can message teachers
            var role = 'student';
            
            document.getElementById('communications-admin-view').style.display = 'none';
            document.getElementById('communications-teacher-view').style.display = 'none';
            document.getElementById('communications-parent-view').style.display = 'block';
            
            loadMessagesStudent();
            loadAnnouncementsStudent();
        }

        function loadMessagesStudent() {
            var list = document.getElementById('parent-messages-list');
            if (!list) return;
            
            var studentId = appState.currentUser.studentId;
            var student = appState.students.find(function(s) { return s.id === studentId; });
            if (!student) return;

            // Get teacher for student's class
            var classInfo = appState.classes.find(function(c) { return c.id === student.classId; });
            var teacher = appState.users.find(function(u) { return u.role === 'teacher' && u.classId === classInfo.id; });

            var myMessages = appState.messages.filter(function(m) {
                return (m.senderId === appState.currentUser.id || m.recipientId === appState.currentUser.id);
            });

            if (myMessages.length === 0) {
                list.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--gray-text);">Aucun message</div>';
                return;
            }

            list.innerHTML = myMessages.map(function(msg) {
                var date = new Date(msg.date).toLocaleDateString('fr-FR');
                var isReceived = msg.recipientId === appState.currentUser.id;
                var otherUser = isReceived ? 
                    appState.users.find(function(u) { return u.id === msg.senderId; }) :
                    appState.users.find(function(u) { return u.id === msg.recipientId; });
                
                return '<div style="padding:1.5rem;border:2px solid var(--border);border-radius:12px;background:' + (isReceived ? 'var(--light-bg)' : 'var(--white)') + ';margin-bottom:1rem;">' +
                    '<div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">' +
                        '<h4 style="margin:0;color:var(--dark-text);">' + msg.subject + '</h4>' +
                        (isReceived && !msg.read ? '<span style="background:var(--terracotta);color:var(--white);padding:0.25rem 0.75rem;border-radius:6px;font-size:0.875rem;font-weight:600;">NOUVEAU</span>' : '') +
                    '</div>' +
                    '<div style="color:var(--gray-text);font-size:0.85rem;margin-bottom:0.75rem;">' +
                        (isReceived ? '👤 De: ' : '👤 À: ') + (otherUser ? otherUser.fullName : 'Inconnu') + ' • 📅 ' + date +
                    '</div>' +
                    '<div style="color:var(--dark-text);line-height:1.6;">' + msg.content + '</div>' +
                '</div>';
            }).join('');
        }

        function loadAnnouncementsStudent() {
            var list = document.getElementById('parent-announcements-list');
            if (!list) return;
            
            var relevant = appState.announcements.filter(function(ann) {
                return ann.targetRole === 'all' || ann.targetRole === 'student';
            });
            
            if (relevant.length === 0) {
                list.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--gray-text);">Aucune annonce</div>';
                return;
            }
            
            list.innerHTML = relevant.map(function(ann) {
                var date = new Date(ann.date).toLocaleDateString('fr-FR');
                return '<div style="padding:1.5rem;border:2px solid var(--border);border-radius:12px;background:var(--light-bg);margin-bottom:1rem;">' +
                    '<h4 style="margin:0 0 0.75rem 0;color:var(--dark-text);">' + ann.title + '</h4>' +
                    '<div style="color:var(--gray-text);font-size:0.85rem;margin-bottom:0.5rem;">📅 ' + date + ' • ✍️ ' + ann.author + '</div>' +
                    '<div style="color:var(--dark-text);line-height:1.6;">' + ann.content + '</div>' +
                '</div>';
            }).join('');
        }

        function loadStudentProfile() {
            // Show student's own profile information
            var studentId = appState.currentUser.studentId;
            var student = appState.students.find(function(s) { return s.id === studentId; });
            if (!student) return;

            var classInfo = appState.classes.find(function(c) { return c.id === student.classId; });
            var healthRecord = appState.studentHealthRecords[studentId] || {};

            var profileContainer = document.getElementById('profile-section');
            var existingCard = profileContainer.querySelector('.card');
            
            if (existingCard) {
                existingCard.innerHTML = '<div class="card-header"><h3 class="card-title">Mon Profil</h3></div>' +
                    '<div class="card-body">' +
                        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;">' +
                            '<div>' +
                                '<p style="margin-bottom:1rem;"><strong>Nom:</strong> ' + student.name + '</p>' +
                                '<p style="margin-bottom:1rem;"><strong>Matricule:</strong> ' + student.matricule + '</p>' +
                                '<p style="margin-bottom:1rem;"><strong>Sexe:</strong> ' + (student.sex || 'N/A') + '</p>' +
                                '<p style="margin-bottom:1rem;"><strong>Date de naissance:</strong> ' + (student.birthDate ? new Date(student.birthDate).toLocaleDateString('fr-FR') : 'N/A') + '</p>' +
                                '<p style="margin-bottom:1rem;"><strong>Classe:</strong> ' + (classInfo ? classInfo.name : 'N/A') + '</p>' +
                            '</div>' +
                            '<div>' +
                                '<h4 style="margin-bottom:1rem;color:var(--earth);">Contact Parent</h4>' +
                                '<p style="margin-bottom:0.5rem;"><strong>Nom:</strong> ' + (student.parentName || 'N/A') + '</p>' +
                                '<p style="margin-bottom:0.5rem;"><strong>Relation:</strong> ' + (student.parentRelation || 'N/A') + '</p>' +
                                '<p style="margin-bottom:0.5rem;"><strong>Téléphone:</strong> ' + (student.parentPhone || 'N/A') + '</p>' +
                                '<p style="margin-bottom:0.5rem;"><strong>Email:</strong> ' + (student.parentEmail || 'N/A') + '</p>' +
                            '</div>' +
                        '</div>' +
                        (healthRecord.bloodType || healthRecord.allergies || healthRecord.medicalConditions ? 
                            '<div style="margin-top:2rem;padding-top:1.5rem;border-top:2px solid var(--border);">' +
                                '<h4 style="margin-bottom:1rem;color:var(--earth);">🏥 Informations Médicales</h4>' +
                                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">' +
                                    (healthRecord.bloodType ? '<p><strong>Groupe Sanguin:</strong> ' + healthRecord.bloodType + '</p>' : '') +
                                    (healthRecord.emergencyContact ? '<p><strong>Contact Urgence:</strong> ' + healthRecord.emergencyContact + '</p>' : '') +
                                    (healthRecord.allergies ? '<p><strong>Allergies:</strong> ' + healthRecord.allergies + '</p>' : '') +
                                    (healthRecord.medicalConditions ? '<p><strong>Conditions:</strong> ' + healthRecord.medicalConditions + '</p>' : '') +
                                    (healthRecord.medications ? '<p><strong>Médicaments:</strong> ' + healthRecord.medications + '</p>' : '') +
                                '</div>' +
                            '</div>' : ''
                        ) +
                        '<div style="margin-top:2rem;padding:1rem;background:var(--light-bg);border-radius:8px;">' +
                            '<h4 style="margin-bottom:0.5rem;color:var(--earth);">Changer le Mot de Passe</h4>' +
                            '<form onsubmit="changePassword(event)" style="margin-top:1rem;">' +
                                '<input type="password" id="current-password" class="form-input" placeholder="Mot de passe actuel" required style="margin-bottom:0.75rem;">' +
                                '<input type="password" id="new-password" class="form-input" placeholder="Nouveau mot de passe" required style="margin-bottom:0.75rem;">' +
                                '<input type="password" id="confirm-password" class="form-input" placeholder="Confirmer le mot de passe" required style="margin-bottom:1rem;">' +
                                '<button type="submit" class="btn btn-primary" style="width:100%;">🔒 Modifier le Mot de Passe</button>' +
                            '</form>' +
                        '</div>' +
                    '</div>';
            }
        }

        // ---- End Student Role Functions ----

        // Load announcements for student (announcements section - read only, no messages)
        function loadAnnouncementsForStudent() {
            var list = document.getElementById('student-announcements-list');
            if (!list) return;
            
            var relevant = appState.announcements.filter(function(ann) {
                return ann.targetRole === 'all' || ann.targetRole === 'student';
            });
            
            if (relevant.length === 0) {
                list.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--gray-text);">Aucune annonce pour le moment</div>';
                return;
            }
            
            list.innerHTML = relevant.map(function(ann) {
                var date = new Date(ann.date).toLocaleDateString('fr-FR');
                return '<div style="padding:1.5rem;border:2px solid var(--border);border-radius:12px;background:var(--light-bg);margin-bottom:1rem;">' +
                    '<h4 style="margin:0 0 0.75rem 0;color:var(--dark-text);">' + ann.title + '</h4>' +
                    '<div style="color:var(--gray-text);font-size:0.85rem;margin-bottom:0.5rem;">📅 ' + date + ' • ✍️ ' + ann.author + '</div>' +
                    '<div style="color:var(--dark-text);line-height:1.6;white-space:pre-wrap;">' + ann.content + '</div>' +
                '</div>';
            }).join('');
        }

        // ---- End Schedule ----

        // ---- End Bulletin ----


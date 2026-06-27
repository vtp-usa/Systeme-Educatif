// ============================================================
// js/11-homework-health.js — Homework assignments, health records, security/logging
// Lines 7498-7701 of original Ecole-Main-System.html
// ============================================================


        // ---- Phase 4: Homework/Assignments ----

        function openHomeworkModal() {
            document.getElementById('homework-modal').style.display = 'flex';
            
            var subjectSelect = document.getElementById('homework-subject');
            subjectSelect.innerHTML = '<option value="">Sélectionner</option>';
            appState.subjects.forEach(function(sub) {
                subjectSelect.innerHTML += '<option value="' + sub.id + '">' + sub.name + '</option>';
            });
        }

        function closeHomeworkModal() {
            document.getElementById('homework-modal').style.display = 'none';
            document.getElementById('homework-form').reset();
        }

        function saveHomework(event) {
            event.preventDefault();
            
            var subjectId = parseInt(document.getElementById('homework-subject').value);
            var title = document.getElementById('homework-title').value.trim();
            var description = document.getElementById('homework-description').value.trim();
            var dueDate = document.getElementById('homework-due-date').value;
            
            var homework = {
                id: Date.now(),
                classId: appState.currentUser.classId,
                subjectId: subjectId,
                title: title,
                description: description,
                dueDate: dueDate,
                assignedBy: appState.currentUser.fullName,
                assignedDate: new Date().toISOString()
            };
            
            appState.homework.unshift(homework);
            appState.homeworkSubmissions[homework.id] = {};
            
            saveData();
            logActivity('Devoir assigné: ' + title);
            showAlert('Devoir assigné avec succès', 'success');
            closeHomeworkModal();
            loadHomework();
        }

        function loadHomework() {
            var role = appState.currentUser.role;
            
            if (role === 'teacher') {
                document.getElementById('homework-teacher-view').style.display = 'block';
                document.getElementById('homework-parent-view').style.display = 'none';
                loadHomeworkTeacher();
            } else if (role === 'parent') {
                document.getElementById('homework-teacher-view').style.display = 'none';
                document.getElementById('homework-parent-view').style.display = 'block';
                loadHomeworkParent();
            }
        }

        function loadHomeworkTeacher() {
            var list = document.getElementById('teacher-homework-list');
            var classId = appState.currentUser.classId;
            var homework = appState.homework.filter(function(h) { return h.classId === classId; });
            
            if (homework.length === 0) {
                list.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--gray-text);">Aucun devoir assigné</div>';
                return;
            }
            
            list.innerHTML = homework.map(function(hw) {
                var subject = appState.subjects.find(function(s) { return s.id === hw.subjectId; });
                var dueDate = new Date(hw.dueDate);
                var isOverdue = dueDate < new Date();
                var students = appState.students.filter(function(s) { return s.classId === classId; });
                var submitted = students.filter(function(s) {
                    return appState.homeworkSubmissions[hw.id] && appState.homeworkSubmissions[hw.id][s.id] && appState.homeworkSubmissions[hw.id][s.id].submitted;
                }).length;
                
                return '<div style="padding:1.5rem;border:2px solid var(--border);border-radius:12px;background:var(--light-bg);margin-bottom:1rem;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">' +
                        '<div>' +
                            '<h4 style="margin:0;color:var(--dark-text);">' + hw.title + '</h4>' +
                            '<div style="font-size:0.85rem;color:var(--gray-text);margin-top:0.25rem;">' + (subject ? subject.name : 'N/A') + ' • Échéance: ' + dueDate.toLocaleDateString('fr-FR') + (isOverdue ? ' <span style="color:var(--terracotta);font-weight:600;">⏰ DÉPASSÉ</span>' : '') + '</div>' +
                        '</div>' +
                        '<button onclick="deleteHomework(' + hw.id + ')" style="background:var(--terracotta);color:var(--white);border:none;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;font-size:0.875rem;">🗑️ Supprimer</button>' +
                    '</div>' +
                    '<div style="color:var(--dark-text);margin-bottom:1rem;line-height:1.6;">' + hw.description + '</div>' +
                    '<div style="padding:0.75rem;background:var(--white);border-radius:8px;font-size:0.9rem;color:var(--gray-text);">📊 Complétés: ' + submitted + '/' + students.length + ' élèves</div>' +
                '</div>';
            }).join('');
        }

        function loadHomeworkParent() {
            var container = document.getElementById('parent-homework-cards');
            var childrenIds = appState.currentUser.childrenIds || [];
            
            if (childrenIds.length === 0) {
                container.innerHTML = '<div class="card"><div class="card-body"><p style="text-align:center;color:var(--gray-text);">Aucun enfant associé</p></div></div>';
                return;
            }
            
            container.innerHTML = childrenIds.map(function(childId) {
                var student = appState.students.find(function(s) { return s.id === childId; });
                if (!student) return '';
                
                var homework = appState.homework.filter(function(h) { return h.classId === student.classId; });
                
                return '<div class="card" style="margin-bottom:1.5rem;">' +
                    '<div class="card-header"><h3 class="card-title">Devoirs de ' + student.name + '</h3></div>' +
                    '<div class="card-body">' +
                        (homework.length === 0 ? 
                            '<p style="text-align:center;color:var(--gray-text);">Aucun devoir en cours</p>' :
                            homework.map(function(hw) {
                                var subject = appState.subjects.find(function(s) { return s.id === hw.subjectId; });
                                var dueDate = new Date(hw.dueDate);
                                var isOverdue = dueDate < new Date();
                                
                                return '<div style="padding:1.25rem;border:2px solid var(--border);border-radius:8px;background:var(--light-bg);margin-bottom:1rem;">' +
                                    '<h4 style="margin:0 0 0.5rem 0;color:var(--dark-text);">' + hw.title + '</h4>' +
                                    '<div style="font-size:0.85rem;color:var(--gray-text);margin-bottom:0.75rem;">' + (subject ? subject.name : 'N/A') + ' • Échéance: ' + dueDate.toLocaleDateString('fr-FR') + (isOverdue ? ' <span style="color:var(--terracotta);font-weight:600;">⏰ DÉPASSÉ</span>' : '') + '</div>' +
                                    '<div style="color:var(--dark-text);line-height:1.6;">' + hw.description + '</div>' +
                                '</div>';
                            }).join('')
                        ) +
                    '</div>' +
                '</div>';
            }).join('');
        }

        function deleteHomework(id) {
            if (!confirm('Supprimer ce devoir?')) return;
            appState.homework = appState.homework.filter(function(h) { return h.id !== id; });
            delete appState.homeworkSubmissions[id];
            saveData();
            showAlert('Devoir supprimé', 'success');
            loadHomeworkTeacher();
        }

        // ---- Phase 4: Health Records ----

        function saveStudentHealthRecord(studentId) {
            var healthRecord = {
                bloodType: document.getElementById('student-blood-type').value,
                emergencyContact: document.getElementById('student-emergency-contact').value.trim(),
                allergies: document.getElementById('student-allergies').value.trim(),
                medicalConditions: document.getElementById('student-medical-conditions').value.trim(),
                medications: document.getElementById('student-medications').value.trim()
            };
            
            if (healthRecord.bloodType || healthRecord.emergencyContact || healthRecord.allergies || healthRecord.medicalConditions || healthRecord.medications) {
                appState.studentHealthRecords[studentId] = healthRecord;
            }
        }

        function loadStudentHealthRecord(studentId) {
            var record = appState.studentHealthRecords[studentId];
            if (record) {
                document.getElementById('student-blood-type').value = record.bloodType || '';
                document.getElementById('student-emergency-contact').value = record.emergencyContact || '';
                document.getElementById('student-allergies').value = record.allergies || '';
                document.getElementById('student-medical-conditions').value = record.medicalConditions || '';
                document.getElementById('student-medications').value = record.medications || '';
            } else {
                document.getElementById('student-blood-type').value = '';
                document.getElementById('student-emergency-contact').value = '';
                document.getElementById('student-allergies').value = '';
                document.getElementById('student-medical-conditions').value = '';
                document.getElementById('student-medications').value = '';
            }
        }

        // ---- Phase 4: Security Features ----

        function logActivity(action, details) {
            if (!appState.currentUser) return;
            
            appState.activityLogs.push({
                id: Date.now(),
                userId: appState.currentUser.id,
                userName: appState.currentUser.fullName,
                action: action,
                details: details || '',
                timestamp: new Date().toISOString()
            });
            
            // Keep only last 1000 logs
            if (appState.activityLogs.length > 1000) {
                appState.activityLogs = appState.activityLogs.slice(-1000);
            }
            
            saveData();
        }

        function validatePasswordComplexity(password) {
            if (password.length < 6) {
                return { valid: false, message: 'Le mot de passe doit contenir au moins 6 caractères' };
            }
            return { valid: true };
        }

        // ---- End Phase 4 Functions ----


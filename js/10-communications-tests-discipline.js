// ============================================================
// js/10-communications-tests-discipline.js — Messages, announcements, evaluations, merit points
// Lines 6965-7497 of original Ecole-Main-System.html
// ============================================================

        // ---- Phase 3: Communication System ----

        function loadCommunications() {
            var role = appState.currentUser.role;
            
            if (role === 'admin') {
                document.getElementById('communications-admin-view').style.display = 'block';
                document.getElementById('communications-teacher-view').style.display = 'none';
                document.getElementById('communications-parent-view').style.display = 'none';
                loadAnnouncementsAdmin();
                loadMessagesAdmin();
            } else if (role === 'teacher') {
                document.getElementById('communications-admin-view').style.display = 'none';
                document.getElementById('communications-teacher-view').style.display = 'block';
                document.getElementById('communications-parent-view').style.display = 'none';
                loadMessagesTeacher();
                loadAnnouncementsTeacher();
            } else if (role === 'parent') {
                document.getElementById('communications-admin-view').style.display = 'none';
                document.getElementById('communications-teacher-view').style.display = 'none';
                document.getElementById('communications-parent-view').style.display = 'block';
                loadMessagesParent();
                loadAnnouncementsParent();
            }
        }

        // Announcements
        function openAnnouncementModal() {
            document.getElementById('announcement-modal').style.display = 'flex';
        }

        function closeAnnouncementModal() {
            document.getElementById('announcement-modal').style.display = 'none';
            document.getElementById('announcement-form').reset();
        }

        function saveAnnouncement(event) {
            event.preventDefault();
            
            var title = document.getElementById('announcement-title').value.trim();
            var content = document.getElementById('announcement-content').value.trim();
            var target = document.getElementById('announcement-target').value;
            
            var announcement = {
                id: Date.now(),
                title: title,
                content: content,
                date: new Date().toISOString(),
                author: appState.currentUser.fullName,
                targetRole: target
            };
            
            appState.announcements.unshift(announcement);
            saveData();
            showAlert('Annonce publiée avec succès', 'success');
            closeAnnouncementModal();
            loadAnnouncementsAdmin();
        }

        function loadAnnouncementsAdmin() {
            var list = document.getElementById('announcements-list');
            if (!list) return;
            
            if (appState.announcements.length === 0) {
                list.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--gray-text);">Aucune annonce publiée</div>';
                return;
            }
            
            list.innerHTML = appState.announcements.map(function(ann) {
                var targetText = ann.targetRole === 'all' ? 'Tous' : ann.targetRole === 'teacher' ? 'Enseignants' : 'Parents';
                var date = new Date(ann.date).toLocaleDateString('fr-FR');
                
                return '<div style="padding:1.5rem;border:2px solid var(--border);border-radius:12px;background:var(--light-bg);">' +
                    '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">' +
                        '<h4 style="margin:0;color:var(--dark-text);">' + ann.title + '</h4>' +
                        '<button onclick="deleteAnnouncement(' + ann.id + ')" style="background:var(--terracotta);color:var(--white);border:none;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;font-size:0.875rem;">🗑️ Supprimer</button>' +
                    '</div>' +
                    '<div style="color:var(--gray-text);font-size:0.85rem;margin-bottom:0.5rem;">👥 ' + targetText + ' • 📅 ' + date + ' • ✍️ ' + ann.author + '</div>' +
                    '<div style="color:var(--dark-text);line-height:1.6;">' + ann.content + '</div>' +
                '</div>';
            }).join('');
        }

        function loadAnnouncementsTeacher() {
            var list = document.getElementById('teacher-announcements-list');
            if (!list) return;
            
            var relevant = appState.announcements.filter(function(ann) {
                return ann.targetRole === 'all' || ann.targetRole === 'teacher';
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

        function loadAnnouncementsParent() {
            var list = document.getElementById('parent-announcements-list');
            if (!list) return;
            
            var relevant = appState.announcements.filter(function(ann) {
                return ann.targetRole === 'all' || ann.targetRole === 'parent';
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

        function deleteAnnouncement(id) {
            if (!confirm('Supprimer cette annonce?')) return;
            appState.announcements = appState.announcements.filter(function(a) { return a.id !== id; });
            saveData();
            showAlert('Annonce supprimée', 'success');
            loadAnnouncementsAdmin();
        }

        // Messages
        function openMessageModal() {
            document.getElementById('message-modal').style.display = 'flex';
            
            var select = document.getElementById('message-recipient');
            select.innerHTML = '<option value="">Sélectionner</option>';
            
            if (appState.currentUser.role === 'teacher') {
                // Teachers can message parents of their class
                var classId = appState.currentUser.classId;
                var students = appState.students.filter(function(s) { return s.classId === classId; });
                students.forEach(function(s) {
                    var parent = appState.users.find(function(u) { 
                        return u.role === 'parent' && u.childrenIds && u.childrenIds.includes(s.id); 
                    });
                    if (parent) {
                        select.innerHTML += '<option value="' + parent.id + '">Parent de ' + s.name + ' (' + parent.fullName + ')</option>';
                    }
                });
            } else if (appState.currentUser.role === 'parent') {
                // Parents can message their children's teachers
                var childrenIds = appState.currentUser.childrenIds || [];
                childrenIds.forEach(function(childId) {
                    var student = appState.students.find(function(s) { return s.id === childId; });
                    if (student) {
                        var teacher = appState.users.find(function(u) { 
                            return u.role === 'teacher' && u.classId === student.classId; 
                        });
                        if (teacher) {
                            select.innerHTML += '<option value="' + teacher.id + '">Enseignant de ' + student.name + ' (' + teacher.fullName + ')</option>';
                        }
                    }
                });
            }
        }

        function closeMessageModal() {
            document.getElementById('message-modal').style.display = 'none';
            document.getElementById('message-form').reset();
        }

        function saveMessage(event) {
            event.preventDefault();
            
            var to = parseInt(document.getElementById('message-recipient').value);
            var subject = document.getElementById('message-subject').value.trim();
            var content = document.getElementById('message-content').value.trim();
            
            var message = {
                id: Date.now(),
                from: appState.currentUser.id,
                to: to,
                subject: subject,
                message: content,
                date: new Date().toISOString(),
                read: false
            };
            
            appState.messages.unshift(message);
            saveData();
            showAlert('Message envoyé avec succès', 'success');
            closeMessageModal();
            loadCommunications();
        }

        function loadMessagesAdmin() {
            var list = document.getElementById('admin-messages-list');
            if (!list) return;
            
            if (appState.messages.length === 0) {
                list.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--gray-text);">Aucun message</div>';
                return;
            }
            
            list.innerHTML = '<div style="font-size:0.9rem;color:var(--gray-text);margin-bottom:1rem;">Total: ' + appState.messages.length + ' message(s)</div>';
        }

        function loadMessagesTeacher() {
            var list = document.getElementById('teacher-messages-list');
            if (!list) return;
            
            var userId = appState.currentUser.id;
            var messages = appState.messages.filter(function(m) {
                return m.from === userId || m.to === userId;
            });
            
            if (messages.length === 0) {
                list.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--gray-text);">Aucun message</div>';
                return;
            }
            
            list.innerHTML = messages.map(function(msg) {
                var fromUser = appState.users.find(function(u) { return u.id === msg.from; });
                var toUser = appState.users.find(function(u) { return u.id === msg.to; });
                var date = new Date(msg.date).toLocaleDateString('fr-FR');
                var isIncoming = msg.to === userId;
                
                return '<div style="padding:1.5rem;border:2px solid var(--border);border-radius:12px;background:' + (msg.read || !isIncoming ? 'var(--light-bg)' : '#fff8e1') + ';margin-bottom:1rem;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.5rem;">' +
                        '<div>' +
                            '<strong style="color:var(--dark-text);">' + msg.subject + '</strong>' +
                            '<div style="font-size:0.85rem;color:var(--gray-text);margin-top:0.25rem;">' +
                                (isIncoming ? '📨 De: ' + (fromUser ? fromUser.fullName : 'Inconnu') : '📤 À: ' + (toUser ? toUser.fullName : 'Inconnu')) +
                                ' • ' + date +
                            '</div>' +
                        '</div>' +
                        (isIncoming && !msg.read ? '<span style="background:var(--ochre);color:var(--white);padding:0.25rem 0.75rem;border-radius:6px;font-size:0.75rem;font-weight:600;">NOUVEAU</span>' : '') +
                    '</div>' +
                    '<div style="color:var(--dark-text);margin-top:0.75rem;line-height:1.6;">' + msg.message + '</div>' +
                '</div>';
            }).join('');
        }

        function loadMessagesParent() {
            loadMessagesTeacher(); // Same logic for parents
            document.getElementById('parent-messages-list').innerHTML = document.getElementById('teacher-messages-list').innerHTML;
        }

        // ---- End Phase 3: Communication System ----

        // ---- Phase 3: Test/Exam Management ----

        function openTestModal() {
            document.getElementById('test-modal').style.display = 'flex';
            
            // Populate student dropdown
            var studentSelect = document.getElementById('test-student');
            studentSelect.innerHTML = '<option value="">Sélectionner</option>';
            var classId = appState.currentUser.classId;
            var students = appState.students.filter(function(s) { return s.classId === classId; });
            students.forEach(function(s) {
                studentSelect.innerHTML += '<option value="' + s.id + '">' + s.name + '</option>';
            });
            
            // Populate subject dropdown
            var subjectSelect = document.getElementById('test-subject');
            subjectSelect.innerHTML = '<option value="">Sélectionner</option>';
            appState.subjects.forEach(function(sub) {
                subjectSelect.innerHTML += '<option value="' + sub.id + '">' + sub.name + '</option>';
            });
        }

        function closeTestModal() {
            document.getElementById('test-modal').style.display = 'none';
            document.getElementById('test-form').reset();
        }

        function saveTest(event) {
            event.preventDefault();
            
            var studentId = parseInt(document.getElementById('test-student').value);
            var subjectId = parseInt(document.getElementById('test-subject').value);
            var name = document.getElementById('test-name').value.trim();
            var type = document.getElementById('test-type').value;
            var trimester = parseInt(document.getElementById('test-trimester').value);
            var score = parseFloat(document.getElementById('test-score').value);
            var maxScore = parseFloat(document.getElementById('test-max-score').value);
            var date = document.getElementById('test-date').value;
            
            if (!appState.testScores[studentId]) {
                appState.testScores[studentId] = {};
            }
            if (!appState.testScores[studentId][subjectId]) {
                appState.testScores[studentId][subjectId] = {};
            }
            if (!appState.testScores[studentId][subjectId][trimester]) {
                appState.testScores[studentId][subjectId][trimester] = [];
            }
            
            appState.testScores[studentId][subjectId][trimester].push({
                id: Date.now(),
                name: name,
                type: type,
                score: score,
                maxScore: maxScore,
                date: date
            });
            
            saveData();
            showAlert('Évaluation enregistrée avec succès', 'success');
            closeTestModal();
            loadTests();
        }

        function loadTests() {
            var tbody = document.getElementById('tests-table-body');
            if (!tbody) return;
            
            // Populate filter dropdowns
            var studentSelect = document.getElementById('test-filter-student');
            var classId = appState.currentUser.classId;
            var students = appState.students.filter(function(s) { return s.classId === classId; });
            studentSelect.innerHTML = '<option value="">Tous les élèves</option>';
            students.forEach(function(s) {
                studentSelect.innerHTML += '<option value="' + s.id + '">' + s.name + '</option>';
            });
            
            var subjectSelect = document.getElementById('test-filter-subject');
            subjectSelect.innerHTML = '<option value="">Toutes les matières</option>';
            appState.subjects.forEach(function(sub) {
                subjectSelect.innerHTML += '<option value="' + sub.id + '">' + sub.name + '</option>';
            });
            
            filterTests();
        }

        function filterTests() {
            var tbody = document.getElementById('tests-table-body');
            if (!tbody) return;
            
            var studentFilter = document.getElementById('test-filter-student').value;
            var subjectFilter = document.getElementById('test-filter-subject').value;
            var trimesterFilter = document.getElementById('test-filter-trimester').value;
            
            var allTests = [];
            
            Object.keys(appState.testScores).forEach(function(studentId) {
                if (studentFilter && studentId != studentFilter) return;
                
                var student = appState.students.find(function(s) { return s.id === parseInt(studentId); });
                if (!student) return;
                
                Object.keys(appState.testScores[studentId]).forEach(function(subjectId) {
                    if (subjectFilter && subjectId != subjectFilter) return;
                    
                    var subject = appState.subjects.find(function(s) { return s.id === parseInt(subjectId); });
                    
                    Object.keys(appState.testScores[studentId][subjectId]).forEach(function(trimester) {
                        if (trimesterFilter && trimester != trimesterFilter) return;
                        
                        appState.testScores[studentId][subjectId][trimester].forEach(function(test) {
                            allTests.push({
                                studentName: student.name,
                                subjectName: subject ? subject.name : 'N/A',
                                test: test,
                                trimester: trimester,
                                studentId: studentId,
                                subjectId: subjectId
                            });
                        });
                    });
                });
            });
            
            if (allTests.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="padding:2rem;text-align:center;color:var(--gray-text);">Aucune évaluation trouvée</td></tr>';
                return;
            }
            
            allTests.sort(function(a, b) { return new Date(b.test.date) - new Date(a.test.date); });
            
            tbody.innerHTML = allTests.map(function(item) {
                var percentage = ((item.test.score / item.test.maxScore) * 100).toFixed(1);
                var color = percentage >= 50 ? 'var(--green)' : 'var(--terracotta)';
                
                return '<tr style="border-bottom:1px solid var(--border);">' +
                    '<td style="padding:1rem;font-weight:600;">' + item.studentName + '</td>' +
                    '<td style="padding:1rem;">' + item.subjectName + '</td>' +
                    '<td style="padding:1rem;">' + item.test.name + '</td>' +
                    '<td style="padding:1rem;text-align:center;"><span style="background:var(--light-bg);padding:0.25rem 0.75rem;border-radius:6px;font-size:0.85rem;">' + item.test.type + '</span></td>' +
                    '<td style="padding:1rem;text-align:center;font-weight:600;">T' + item.trimester + '</td>' +
                    '<td style="padding:1rem;text-align:center;font-weight:700;color:' + color + ';">' + item.test.score + '/' + item.test.maxScore + ' (' + percentage + '%)</td>' +
                    '<td style="padding:1rem;color:var(--gray-text);">' + new Date(item.test.date).toLocaleDateString('fr-FR') + '</td>' +
                    '<td style="padding:1rem;text-align:center;"><button onclick="deleteTest(' + item.studentId + ',' + item.subjectId + ',' + item.trimester + ',' + item.test.id + ')" style="background:var(--terracotta);color:var(--white);border:none;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;font-size:0.875rem;">🗑️</button></td>' +
                '</tr>';
            }).join('');
        }

        function deleteTest(studentId, subjectId, trimester, testId) {
            if (!confirm('Supprimer cette évaluation?')) return;
            
            appState.testScores[studentId][subjectId][trimester] = 
                appState.testScores[studentId][subjectId][trimester].filter(function(t) { return t.id !== testId; });
            
            saveData();
            showAlert('Évaluation supprimée', 'success');
            filterTests();
        }

        // ---- Phase 3: Student Discipline/Behavior ----

        function openDisciplineModal(studentId) {
            var student = appState.students.find(function(s) { return s.id === studentId; });
            if (!student) return;
            
            document.getElementById('discipline-student-id').value = studentId;
            document.getElementById('discipline-modal-title').textContent = 'Discipline - ' + student.name;
            document.getElementById('discipline-modal').style.display = 'flex';
            
            loadDisciplineRecords(studentId);
            updateMeritPoints(studentId);
        }

        function closeDisciplineModal() {
            document.getElementById('discipline-modal').style.display = 'none';
            document.getElementById('discipline-form').reset();
        }

        function saveDisciplineRecord(event) {
            event.preventDefault();
            
            var studentId = parseInt(document.getElementById('discipline-student-id').value);
            var type = document.getElementById('discipline-type').value;
            var severity = document.getElementById('discipline-severity').value;
            var description = document.getElementById('discipline-description').value.trim();
            
            var record = {
                id: Date.now(),
                studentId: studentId,
                type: type,
                severity: severity,
                description: description,
                date: new Date().toISOString(),
                recordedBy: appState.currentUser.fullName
            };
            
            appState.disciplineRecords.push(record);
            
            // Update merit points
            if (!appState.meritPoints[studentId]) appState.meritPoints[studentId] = 0;
            
            if (type === 'Félicitations') {
                appState.meritPoints[studentId] += 5;
            } else if (type === 'Encouragement') {
                appState.meritPoints[studentId] += 2;
            } else if (type === 'Avertissement') {
                appState.meritPoints[studentId] -= 1;
            } else if (type === 'Sanction') {
                appState.meritPoints[studentId] -= (severity === 'Grave' ? 5 : severity === 'Moyen' ? 3 : 2);
            }
            
            saveData();
            showAlert('Enregistrement ajouté avec succès', 'success');
            
            document.getElementById('discipline-description').value = '';
            loadDisciplineRecords(studentId);
            updateMeritPoints(studentId);
        }

        function loadDisciplineRecords(studentId) {
            var list = document.getElementById('discipline-records-list');
            var records = appState.disciplineRecords.filter(function(r) { return r.studentId === studentId; });
            
            if (records.length === 0) {
                list.innerHTML = '<div style="padding:1rem;text-align:center;color:var(--gray-text);background:var(--light-bg);border-radius:8px;">Aucun enregistrement</div>';
                return;
            }
            
            records.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
            
            list.innerHTML = records.map(function(rec) {
                var icon = rec.type === 'Félicitations' ? '⭐' : rec.type === 'Encouragement' ? '👍' : rec.type === 'Avertissement' ? '⚠️' : '🚫';
                var color = rec.type === 'Félicitations' || rec.type === 'Encouragement' ? 'var(--green)' : 'var(--terracotta)';
                var date = new Date(rec.date).toLocaleDateString('fr-FR');
                
                return '<div style="padding:1rem;background:var(--light-bg);border-radius:8px;margin-bottom:0.75rem;border-left:4px solid ' + color + ';">' +
                    '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.5rem;">' +
                        '<div style="font-weight:600;color:' + color + ';">' + icon + ' ' + rec.type + (rec.severity ? ' (' + rec.severity + ')' : '') + '</div>' +
                        '<button onclick="deleteDisciplineRecord(' + rec.id + ',' + studentId + ')" style="background:var(--terracotta);color:var(--white);border:none;padding:0.25rem 0.75rem;border-radius:6px;cursor:pointer;font-size:0.75rem;">🗑️</button>' +
                    '</div>' +
                    '<div style="color:var(--dark-text);margin-bottom:0.5rem;font-size:0.9rem;">' + rec.description + '</div>' +
                    '<div style="color:var(--gray-text);font-size:0.8rem;">' + date + ' • ' + rec.recordedBy + '</div>' +
                '</div>';
            }).join('');
        }

        function deleteDisciplineRecord(recordId, studentId) {
            if (!confirm('Supprimer cet enregistrement?')) return;
            
            var record = appState.disciplineRecords.find(function(r) { return r.id === recordId; });
            if (record) {
                // Reverse merit point changes
                if (record.type === 'Félicitations') {
                    appState.meritPoints[studentId] -= 5;
                } else if (record.type === 'Encouragement') {
                    appState.meritPoints[studentId] -= 2;
                } else if (record.type === 'Avertissement') {
                    appState.meritPoints[studentId] += 1;
                } else if (record.type === 'Sanction') {
                    appState.meritPoints[studentId] += (record.severity === 'Grave' ? 5 : record.severity === 'Moyen' ? 3 : 2);
                }
            }
            
            appState.disciplineRecords = appState.disciplineRecords.filter(function(r) { return r.id !== recordId; });
            saveData();
            showAlert('Enregistrement supprimé', 'success');
            loadDisciplineRecords(studentId);
            updateMeritPoints(studentId);
        }

        function updateMeritPoints(studentId) {
            var points = appState.meritPoints[studentId] || 0;
            document.getElementById('discipline-merit-points').textContent = points;
        }

        // ---- End Phase 3: Test Management & Discipline ----

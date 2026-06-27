// ============================================================
// js/09-classes-subjects-fees.js — Class/subject management, payment plans, fee exemptions
// Lines 6585-6964 of original Ecole-Main-System.html
// ============================================================


        // ---- Phase 2: Class Management ----

        function loadClassManagement() {
            var tbody = document.getElementById('class-management-tbody');
            if (!tbody) return;
            
            if (appState.classes.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="padding:2rem;text-align:center;color:var(--gray-text);">Aucune classe enregistrée</td></tr>';
                return;
            }
            
            tbody.innerHTML = appState.classes.map(function(cls) {
                var studentCount = appState.students.filter(function(s) { return s.classId === cls.id; }).length;
                var capacityText = cls.capacity ? cls.capacity : '∞';
                var isFull = cls.capacity && studentCount >= cls.capacity;
                
                return '<tr style="border-bottom:1px solid var(--border);">' +
                    '<td style="padding:1rem;font-weight:600;">' + cls.name + '</td>' +
                    '<td style="padding:1rem;">' + cls.level + '</td>' +
                    '<td style="padding:1rem;color:var(--gray-text);">' + (cls.teacher || 'Non assigné') + '</td>' +
                    '<td style="padding:1rem;text-align:center;">' + capacityText + '</td>' +
                    '<td style="padding:1rem;text-align:center;font-weight:600;' + (isFull ? 'color:var(--terracotta);' : '') + '">' + studentCount + '</td>' +
                    '<td style="padding:1rem;text-align:center;">' +
                        '<button onclick="editClass(' + cls.id + ')" style="background:var(--sky);color:var(--white);border:none;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;margin-right:0.5rem;font-size:0.875rem;">✏️ Modifier</button>' +
                        '<button onclick="deleteClass(' + cls.id + ')" style="background:var(--terracotta);color:var(--white);border:none;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;font-size:0.875rem;">🗑️ Supprimer</button>' +
                    '</td>' +
                '</tr>';
            }).join('');
        }

        function openClassModal(classId) {
            document.getElementById('class-modal').style.display = 'flex';
            document.getElementById('class-form').reset();
            
            if (classId) {
                var cls = appState.classes.find(function(c) { return c.id === classId; });
                if (cls) {
                    document.getElementById('class-modal-title').textContent = 'Modifier la Classe';
                    document.getElementById('class-id').value = cls.id;
                    document.getElementById('class-name').value = cls.name;
                    document.getElementById('class-level').value = cls.level;
                    document.getElementById('class-capacity').value = cls.capacity || '';
                }
            } else {
                document.getElementById('class-modal-title').textContent = 'Ajouter une Classe';
                document.getElementById('class-id').value = '';
            }
        }

        function closeClassModal() {
            document.getElementById('class-modal').style.display = 'none';
        }

        function editClass(classId) {
            openClassModal(classId);
        }

        function saveClass(event) {
            event.preventDefault();
            
            var id = document.getElementById('class-id').value;
            var name = document.getElementById('class-name').value.trim();
            var level = document.getElementById('class-level').value;
            var capacity = document.getElementById('class-capacity').value;
            
            if (id) {
                // Update existing class
                var cls = appState.classes.find(function(c) { return c.id === parseInt(id); });
                if (cls) {
                    cls.name = name;
                    cls.level = level;
                    cls.capacity = capacity ? parseInt(capacity) : null;
                }
                showAlert('Classe modifiée avec succès', 'success');
            } else {
                // Add new class
                var newId = Math.max(...appState.classes.map(function(c) { return c.id; }), 0) + 1;
                appState.classes.push({
                    id: newId,
                    name: name,
                    level: level,
                    teacher: 'Non assigné',
                    capacity: capacity ? parseInt(capacity) : null
                });
                showAlert('Classe ajoutée avec succès', 'success');
            }
            
            saveData();
            closeClassModal();
            loadClassManagement();
        }

        function deleteClass(classId) {
            var cls = appState.classes.find(function(c) { return c.id === classId; });
            if (!cls) return;
            
            var studentCount = appState.students.filter(function(s) { return s.classId === classId; }).length;
            
            if (studentCount > 0) {
                showAlert('Impossible de supprimer: ' + studentCount + ' élève(s) assigné(s) à cette classe', 'error');
                return;
            }
            
            if (!confirm('Supprimer la classe ' + cls.name + '?')) return;
            
            appState.classes = appState.classes.filter(function(c) { return c.id !== classId; });
            
            // Remove teacher assignment
            appState.users.forEach(function(u) {
                if (u.classId === classId) u.classId = null;
            });
            
            saveData();
            showAlert('Classe supprimée avec succès', 'success');
            loadClassManagement();
        }

        // ---- Phase 2: Subject Management ----

        function loadSubjectManagement() {
            var tbody = document.getElementById('subject-management-tbody');
            if (!tbody) return;
            
            if (appState.subjects.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="padding:2rem;text-align:center;color:var(--gray-text);">Aucune matière enregistrée</td></tr>';
                return;
            }
            
            tbody.innerHTML = appState.subjects.map(function(subject) {
                return '<tr style="border-bottom:1px solid var(--border);">' +
                    '<td style="padding:1rem;font-weight:600;">' + subject.name + '</td>' +
                    '<td style="padding:1rem;text-align:center;font-weight:600;color:var(--earth);">' + subject.coefficient + '</td>' +
                    '<td style="padding:1rem;color:var(--gray-text);">' + subject.levels.join(', ') + '</td>' +
                    '<td style="padding:1rem;text-align:center;">' +
                        '<button onclick="editSubject(' + subject.id + ')" style="background:var(--sky);color:var(--white);border:none;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;margin-right:0.5rem;font-size:0.875rem;">✏️ Modifier</button>' +
                        '<button onclick="deleteSubject(' + subject.id + ')" style="background:var(--terracotta);color:var(--white);border:none;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;font-size:0.875rem;">🗑️ Supprimer</button>' +
                    '</td>' +
                '</tr>';
            }).join('');
        }

        function openSubjectModal(subjectId) {
            document.getElementById('subject-modal').style.display = 'flex';
            document.getElementById('subject-form').reset();
            
            if (subjectId) {
                var subject = appState.subjects.find(function(s) { return s.id === subjectId; });
                if (subject) {
                    document.getElementById('subject-modal-title').textContent = 'Modifier la Matière';
                    document.getElementById('subject-id').value = subject.id;
                    document.getElementById('subject-name').value = subject.name;
                    document.getElementById('subject-coefficient').value = subject.coefficient;
                    
                    // Select multiple levels
                    var select = document.getElementById('subject-levels');
                    for (var i = 0; i < select.options.length; i++) {
                        select.options[i].selected = subject.levels.includes(select.options[i].value);
                    }
                }
            } else {
                document.getElementById('subject-modal-title').textContent = 'Ajouter une Matière';
                document.getElementById('subject-id').value = '';
            }
        }

        function closeSubjectModal() {
            document.getElementById('subject-modal').style.display = 'none';
        }

        function editSubject(subjectId) {
            openSubjectModal(subjectId);
        }

        function saveSubject(event) {
            event.preventDefault();
            
            var id = document.getElementById('subject-id').value;
            var name = document.getElementById('subject-name').value.trim();
            var coefficient = parseInt(document.getElementById('subject-coefficient').value);
            
            var select = document.getElementById('subject-levels');
            var levels = [];
            for (var i = 0; i < select.options.length; i++) {
                if (select.options[i].selected) {
                    levels.push(select.options[i].value);
                }
            }
            
            if (levels.length === 0) {
                showAlert('Veuillez sélectionner au moins un niveau', 'error');
                return;
            }
            
            if (id) {
                // Update existing subject
                var subject = appState.subjects.find(function(s) { return s.id === parseInt(id); });
                if (subject) {
                    subject.name = name;
                    subject.coefficient = coefficient;
                    subject.levels = levels;
                }
                showAlert('Matière modifiée avec succès', 'success');
            } else {
                // Add new subject
                var newId = Math.max(...appState.subjects.map(function(s) { return s.id; }), 0) + 1;
                appState.subjects.push({
                    id: newId,
                    name: name,
                    coefficient: coefficient,
                    levels: levels
                });
                showAlert('Matière ajoutée avec succès', 'success');
            }
            
            saveData();
            closeSubjectModal();
            loadSubjectManagement();
        }

        function deleteSubject(subjectId) {
            var subject = appState.subjects.find(function(s) { return s.id === subjectId; });
            if (!subject) return;
            
            if (!confirm('Supprimer la matière ' + subject.name + '? Cette action supprimera aussi toutes les notes associées.')) return;
            
            appState.subjects = appState.subjects.filter(function(s) { return s.id !== subjectId; });
            
            // Clean up grades for this subject (if using detailed grades system)
            // This would be handled when implementing detailed grades
            
            saveData();
            showAlert('Matière supprimée avec succès', 'success');
            loadSubjectManagement();
        }

        // ---- End Phase 2: Class & Subject Management ----

        // ---- Phase 2: Enhanced Fee Management ----

        function saveFee() {
            var classId = parseInt(document.getElementById('fee-class-select').value);
            var amount = parseInt(document.getElementById('fee-amount').value);
            var planType = document.getElementById('fee-plan-type').value;
            var dueDate = document.getElementById('fee-due-date').value;
            
            if (!classId || !amount) {
                showAlert('Veuillez remplir tous les champs', 'error');
                return;
            }
            
            appState.classFees[classId] = amount;
            appState.paymentPlans[classId] = {
                type: planType,
                amount: amount,
                dueDate: dueDate
            };
            
            saveData();
            showAlert('Frais enregistrés avec succès', 'success');
            updateFeeDisplay();
        }

        function updateFeeDisplay() {
            var classId = parseInt(document.getElementById('fee-class-select').value);
            var display = document.getElementById('fee-current-display');
            var value = document.getElementById('fee-current-value');
            var planInfo = document.getElementById('fee-plan-info');
            
            if (appState.classFees[classId]) {
                display.style.display = 'block';
                value.textContent = appState.classFees[classId].toLocaleString() + ' FCFA';
                
                var plan = appState.paymentPlans[classId];
                if (plan) {
                    var planText = plan.type === 'monthly' ? 'Mensuel' : plan.type === 'trimester' ? 'Trimestriel' : 'Annuel';
                    var dueDateText = plan.dueDate ? ' • Échéance: ' + new Date(plan.dueDate).toLocaleDateString('fr-FR') : '';
                    planInfo.textContent = 'Plan: ' + planText + dueDateText;
                } else {
                    planInfo.textContent = '';
                }
            } else {
                display.style.display = 'none';
            }
        }

        function openExemptionModal() {
            document.getElementById('exemption-modal').style.display = 'flex';
            
            // Populate student dropdown
            var select = document.getElementById('exemption-student-select');
            select.innerHTML = '<option value="">Sélectionner un élève</option>';
            appState.students.forEach(function(student) {
                var classInfo = appState.classes.find(function(c) { return c.id === student.classId; });
                select.innerHTML += '<option value="' + student.id + '">' + student.name + ' (' + (classInfo ? classInfo.name : 'N/A') + ')</option>';
            });
        }

        function closeExemptionModal() {
            document.getElementById('exemption-modal').style.display = 'none';
        }

        function saveExemption(event) {
            event.preventDefault();
            
            var studentId = parseInt(document.getElementById('exemption-student-select').value);
            var percentage = parseInt(document.getElementById('exemption-percentage').value);
            var reason = document.getElementById('exemption-reason').value;
            var approvedBy = document.getElementById('exemption-approved-by').value.trim();
            
            if (!studentId || !percentage || !approvedBy) {
                showAlert('Veuillez remplir tous les champs', 'error');
                return;
            }
            
            appState.feeExemptions[studentId] = {
                percentage: percentage,
                reason: reason,
                approvedBy: approvedBy,
                date: new Date().toISOString()
            };
            
            saveData();
            showAlert('Exonération enregistrée avec succès', 'success');
            closeExemptionModal();
            loadExemptions();
        }

        function loadExemptions() {
            var tbody = document.getElementById('exemptions-tbody');
            if (!tbody) return;
            
            var exemptions = Object.keys(appState.feeExemptions).map(function(studentId) {
                var student = appState.students.find(function(s) { return s.id === parseInt(studentId); });
                if (!student) return null;
                
                var exemption = appState.feeExemptions[studentId];
                var classInfo = appState.classes.find(function(c) { return c.id === student.classId; });
                
                return {
                    studentId: studentId,
                    studentName: student.name,
                    className: classInfo ? classInfo.name : 'N/A',
                    percentage: exemption.percentage,
                    reason: exemption.reason,
                    approvedBy: exemption.approvedBy
                };
            }).filter(function(e) { return e !== null; });
            
            if (exemptions.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="padding:2rem;text-align:center;color:var(--gray-text);">Aucune exonération enregistrée</td></tr>';
                return;
            }
            
            tbody.innerHTML = exemptions.map(function(ex) {
                return '<tr style="border-bottom:1px solid var(--border);">' +
                    '<td style="padding:1rem;font-weight:600;">' + ex.studentName + '</td>' +
                    '<td style="padding:1rem;">' + ex.className + '</td>' +
                    '<td style="padding:1rem;text-align:center;font-weight:600;color:var(--green);">' + ex.percentage + '%</td>' +
                    '<td style="padding:1rem;color:var(--gray-text);">' + ex.reason + '</td>' +
                    '<td style="padding:1rem;color:var(--gray-text);">' + ex.approvedBy + '</td>' +
                    '<td style="padding:1rem;text-align:center;">' +
                        '<button onclick="deleteExemption(' + ex.studentId + ')" style="background:var(--terracotta);color:var(--white);border:none;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;font-size:0.875rem;">🗑️ Supprimer</button>' +
                    '</td>' +
                '</tr>';
            }).join('');
        }

        function deleteExemption(studentId) {
            var student = appState.students.find(function(s) { return s.id === parseInt(studentId); });
            if (!confirm('Supprimer l\'exonération pour ' + student.name + '?')) return;
            
            delete appState.feeExemptions[studentId];
            saveData();
            showAlert('Exonération supprimée', 'success');
            loadExemptions();
        }

        // ---- End Phase 2: Enhanced Fee Management ----


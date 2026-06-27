// ============================================================
// js/05-grades-absences.js — Grades table, moyennes, CEP results, absences
// Lines 4673-5628 of original Ecole-Main-System.html
// ============================================================

        // Populate Admin Filters
        function populateAdminFilters() {
            const filterSelect = document.getElementById('admin-filter-class');
            if (filterSelect) {
                const levels = [...new Set(appState.classes.map(c => c.level))].sort();
                filterSelect.innerHTML = '<option value="">Toutes les classes</option>' +
                    levels.map(level => `<option value="${level}">${level}</option>`).join('');
            }
        }
        
        // Format Date
        function formatDate(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
        
        // Get Teacher's Students
        function getTeacherStudents() {
            if (!appState.currentUser || !appState.currentUser.classId) return [];
            return appState.students.filter(s => s.classId === appState.currentUser.classId);
        }
        
        // Get Teacher's Class
        function getTeacherClass() {
            if (!appState.currentUser || !appState.currentUser.classId) return null;
            return appState.classes.find(c => c.id === appState.currentUser.classId);
        }
        
        // Load Teacher's Students in Students Section
        function loadTeacherStudentsInSection() {
            const teacherClass = getTeacherClass();
            const students = getTeacherStudents();
            const classInfoCard = document.getElementById('students-class-info-card');
            const tbody = document.getElementById('students-list-body');
            
            if (!teacherClass) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" style="padding: 3rem; text-align: center; color: var(--gray-text);">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                            <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">Aucune classe assignée</div>
                            <div style="font-size: 0.9rem;">Contactez l'administrateur pour vous assigner une classe</div>
                        </td>
                    </tr>
                `;
                classInfoCard.style.display = 'none';
                return;
            }
            
            // Update class info card
            const teacherSex = appState.currentUser.sex ? (appState.currentUser.sex === 'M' ? '♂ Masculin' : '♀ Féminin') : '-';
            document.getElementById('students-class-info-name').textContent = teacherClass.name;
            document.getElementById('students-class-info-teacher').textContent = appState.currentUser.fullName || 'Enseignant';
            document.getElementById('students-class-info-teacher-sex').textContent = teacherSex;
            document.getElementById('students-class-info-count').textContent = students.length;
            document.getElementById('students-class-info-level').textContent = teacherClass.level;
            classInfoCard.style.display = 'block';
            
            if (students.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" style="padding: 3rem; text-align: center; color: var(--gray-text);">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">👨‍🎓</div>
                            <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">Aucun élève dans votre classe</div>
                            <div style="font-size: 0.9rem;">Les élèves seront ajoutés par l'administrateur</div>
                        </td>
                    </tr>
                `;
                return;
            }
            
            // Sort students alphabetically
            students.sort((a, b) => a.name.localeCompare(b.name));
            
            // Teacher view - Read-only: #, Nom Complet, Matricule, Sexe only
            tbody.innerHTML = students.map((student, index) => {
                const sexDisplay = student.sex === 'M' ? '♂ M' : student.sex === 'F' ? '♀ F' : '-';
                const sexColor = student.sex === 'M' ? 'var(--sky)' : student.sex === 'F' ? 'var(--terracotta)' : 'var(--gray-text)';
                return `
                    <tr style="border-bottom: 1px solid var(--border);">
                        <td style="padding: 1rem; font-weight: 600; color: var(--gray-text); text-align: center;">${index + 1}</td>
                        <td style="padding: 1rem; font-weight: 600; font-size: 1rem;">${student.name}</td>
                        <td style="padding: 1rem; color: var(--gray-text);">${student.matricule}</td>
                        <td style="padding: 1rem; text-align: center; font-weight: 700; color: ${sexColor};">${sexDisplay}</td>
                    </tr>
                `;
            }).join('');
        }
        
        // Load Teacher's Class Information (Legacy - for old teacher view)
        function loadTeacherClass() {
            const teacherClass = getTeacherClass();
            const students = getTeacherStudents();
            
            if (teacherClass) {
                document.getElementById('teacher-class-name').textContent = teacherClass.name;
                document.getElementById('teacher-class-level').textContent = teacherClass.level;
                document.getElementById('teacher-student-count').textContent = students.length;
            }
            
            // Load students list
            const tbody = document.getElementById('teacher-students-list');
            if (students.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--gray-text);">Aucun élève dans votre classe</td></tr>';
                return;
            }
            
            // Sort students alphabetically
            students.sort((a, b) => a.name.localeCompare(b.name));
            
            tbody.innerHTML = students.map((student, index) => {
                const age = calculateAge(student.birthDate);
                const sexDisplay = student.sex === 'M' ? 'M' : student.sex === 'F' ? 'F' : '-';
                return `
                    <tr style="border-bottom: 1px solid var(--border);">
                        <td style="padding: 1rem; font-weight: 600; color: var(--gray-text);">${index + 1}</td>
                        <td style="padding: 1rem; font-weight: 600;">${student.name}</td>
                        <td style="padding: 1rem; color: var(--gray-text);">${student.matricule}</td>
                        <td style="padding: 1rem; text-align: center; font-weight: 600;">${sexDisplay}</td>
                        <td style="padding: 1rem; text-align: center; font-weight: 600;">${age} ans</td>
                    </tr>
                `;
            }).join('');
        }
        
        // Load Grades Table for Entry
        function loadGradesTable() {
            const students = getTeacherStudents();
            const tbody = document.getElementById('grades-table-body');
            
            if (students.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--gray-text);">Aucun élève dans votre classe</td></tr>';
                return;
            }
            
            tbody.innerHTML = students.map((student, index) => `
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 1rem; font-weight: 600; color: var(--gray-text);">${index + 1}</td>
                    <td style="padding: 1rem; font-weight: 600;">${student.name}</td>
                    <td style="padding: 1rem; color: var(--gray-text);">${student.matricule}</td>
                    <td style="padding: 1rem; text-align: center;">
                        <input type="number" 
                            class="form-input" 
                            id="grade-${student.id}" 
                            min="0" 
                            max="20" 
                            step="0.5" 
                            placeholder="Note"
                            style="width: 100px; text-align: center; padding: 0.5rem; font-weight: 700; font-size: 1.1rem;">
                    </td>
                    <td style="padding: 1rem;">
                        <input type="text" 
                            class="form-input" 
                            id="obs-${student.id}" 
                            placeholder="Observation (optionnel)"
                            style="padding: 0.5rem;">
                    </td>
                </tr>
            `).join('');
        }
        
        // Save Grades
        function saveGrades() {
            const subject = document.getElementById('grade-subject').value;
            const type = document.getElementById('grade-type').value;
            const date = document.getElementById('grade-date').value;
            
            if (!subject) {
                showAlert('Veuillez sélectionner une matière', 'error');
                return;
            }
            
            if (!date) {
                showAlert('Veuillez sélectionner une date', 'error');
                return;
            }
            
            const students = getTeacherStudents();
            const grades = [];
            let gradeCount = 0;
            
            students.forEach(student => {
                const gradeInput = document.getElementById(`grade-${student.id}`);
                const obsInput = document.getElementById(`obs-${student.id}`);
                const gradeValue = parseFloat(gradeInput.value);
                
                if (!isNaN(gradeValue) && gradeValue >= 0 && gradeValue <= 20) {
                    grades.push({
                        studentId: student.id,
                        studentName: student.name,
                        grade: gradeValue,
                        observation: obsInput.value || ''
                    });
                    gradeCount++;
                }
            });
            
            if (gradeCount === 0) {
                showAlert('Veuillez saisir au moins une note', 'error');
                return;
            }
            
            // Remove any previous note for the same subject + type per student
            // so only one note per student per Type d'Évaluation is kept
            Object.keys(appState.grades).forEach(function(key) {
                var entry = appState.grades[key];
                if (entry.subject === subject && entry.type === type) {
                    // Strip out individual student grades that are being overwritten
                    var studentIdsBeingSaved = grades.map(function(g) { return g.studentId; });
                    entry.grades = entry.grades.filter(function(g) {
                        return studentIdsBeingSaved.indexOf(g.studentId) === -1;
                    });
                    // If no grades left in this entry, delete the whole entry
                    if (entry.grades.length === 0) {
                        delete appState.grades[key];
                    }
                }
            });

            // Determine trimester from the date
            var trimesterInfo = getTrimestre(date);
            var trimesterKey = trimesterInfo ? trimesterInfo.key : 'trimester2'; // fallback

            // Save to appState — key without Date.now() so same subject+type overwrites
            const gradeKey = `${appState.currentUser.classId}-${subject}-${type}-${date}`;
            appState.grades[gradeKey] = {
                subject: subject,
                type: type,
                date: date,
                trimester: trimesterKey,
                teacherName: appState.currentUser.fullName,
                className: getTeacherClass().name,
                grades: grades
            };
            
            showAlert(`${gradeCount} note(s) enregistrée(s) avec succès pour ${subject}!`, 'success');
            
            // Persist to localStorage
            saveData();
            
            // Clear inputs
            students.forEach(student => {
                document.getElementById(`grade-${student.id}`).value = '';
                document.getElementById(`obs-${student.id}`).value = '';
            });
            
            // Refresh dashboard so Moyenne Classe updates live
            updateDashboard();
        }
        

        // Switch between Notes / Moyenne tabs
        function switchGradeTab(tab) {
            var isAdmin = appState.currentUser && appState.currentUser.role === 'admin';

            // Admin: hide "Saisie des Notes", show "Résultats CEP"
            var notesBtn = document.getElementById('tab-notes');
            var notesContent = document.getElementById('tab-content-notes');
            var cepBtn = document.getElementById('tab-cep');
            if (isAdmin) {
                notesBtn.style.display = 'none';
                notesContent.style.display = 'none';
                cepBtn.style.display = '';
                if (tab === 'notes') tab = 'moyenne'; // fallback
            } else {
                notesBtn.style.display = '';
                cepBtn.style.display = 'none';
            }

            var tabs = ['notes', 'tests', 'moyenne', 'cep'];
            tabs.forEach(function(t) {
                if (isAdmin && t === 'notes') return;
                if (!isAdmin && t === 'cep') return;
                var content = document.getElementById('tab-content-' + t);
                var btn = document.getElementById('tab-' + t);
                if (content) content.style.display = (t === tab) ? 'block' : 'none';
                if (btn) {
                    if (t === tab) {
                        btn.style.background = 'linear-gradient(135deg, var(--earth) 0%, var(--savanna) 100%)';
                        btn.style.color = 'var(--white)';
                    } else {
                        btn.style.background = 'var(--light-bg)';
                        btn.style.color = 'var(--dark-text)';
                    }
                }
            });

            if (tab === 'tests') {
                loadTests();
            } else if (tab === 'moyenne') {
                var select = document.getElementById('moyenne-student-select');
                var students = isAdmin
                    ? appState.students.slice()
                    : getTeacherStudents().slice();
                students.sort(function(a, b) { return a.name.localeCompare(b.name); });
                select.innerHTML = '<option value="">— Choisir un élève —</option>' +
                    students.map(function(s) { return '<option value="' + s.id + '">' + s.name + ' — ' + s.matricule + '</option>'; }).join('');
                var ctFilter = getCurrentTrimestre();
                var mFilter = document.getElementById('moyenne-trimestre-filter');
                if (mFilter) mFilter.value = ctFilter ? ctFilter.key : 'trimester2';
                select.value = '';
                document.getElementById('moyenne-student-banner').style.display = 'none';
                document.getElementById('moyenne-table-body').innerHTML =
                    '<tr><td colspan="5" style="padding:3rem;text-align:center;color:var(--gray-text);">' +
                    '<div style="font-size:2.5rem;margin-bottom:0.75rem;">📊</div>' +
                    '<div style="font-size:1rem;font-weight:600;">Sélectionnez un élève pour voir ses moyennes</div></td></tr>';
            }

            if (tab === 'cep') {
                loadCEPResults();
            }
        }

        // Load and render the Résultats CEP table for all CM2 students
        function loadCEPResults() {
            var tbody = document.getElementById('cep-table-body');
            var cm2Class = appState.classes.find(function(c) { return c.level === 'CM2'; });
            var students = cm2Class
                ? appState.students.filter(function(s) { return s.classId === cm2Class.id; }).sort(function(a,b) { return a.name.localeCompare(b.name); })
                : [];

            if (students.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="padding:3rem;text-align:center;color:var(--gray-text);"><div style="font-size:2rem;margin-bottom:0.5rem;">📋</div>Aucun élève en CM2</td></tr>';
                document.getElementById('cep-admis-count').textContent = '0';
                document.getElementById('cep-total-count').textContent = '0';
                document.getElementById('cep-taux').textContent = '0%';
                return;
            }

            var admisCount = 0;
            var rows = students.map(function(s, i) {
                var val = appState.cepResults[s.id] || '';
                if (val === 'oui') admisCount++;
                var oouiChecked = val === 'oui' ? 'checked' : '';
                var nonChecked  = val === 'non' ? 'checked' : '';
                var rowBg = val === 'oui' ? '#dcfce7' : val === 'non' ? '#fee2e2' : 'var(--white)';
                var sexDisplay = s.sex === 'M' ? '♂ Garçon' : s.sex === 'F' ? '♀ Fille' : '—';
                var sexColor   = s.sex === 'M' ? 'var(--sky)' : s.sex === 'F' ? 'var(--terracotta)' : 'var(--gray-text)';
                return '<tr style="border-bottom:1px solid var(--border);background:' + rowBg + ';transition:background 0.25s;">' +
                    '<td style="padding:0.85rem 1rem;font-weight:600;color:var(--gray-text);">' + (i+1) + '</td>' +
                    '<td style="padding:0.85rem 1rem;font-weight:600;">' + s.name + '</td>' +
                    '<td style="padding:0.85rem 1rem;color:var(--gray-text);">' + s.matricule + '</td>' +
                    '<td style="padding:0.85rem 1rem;text-align:center;font-weight:700;color:' + sexColor + ';">' + sexDisplay + '</td>' +
                    '<td style="padding:0.85rem 1rem;text-align:center;">' +
                        '<label style="display:inline-flex;align-items:center;gap:0.35rem;margin-right:1rem;cursor:pointer;font-weight:600;color:#16a34a;">' +
                            '<input type="radio" name="cep-' + s.id + '" value="oui" ' + oouiChecked + ' onchange="setCEPResult(' + s.id + ',\'oui\')"' +
                            ' style="accent-color:#16a34a;width:1.1rem;height:1.1rem;cursor:pointer;">' +
                            'Oui' +
                        '</label>' +
                        '<label style="display:inline-flex;align-items:center;gap:0.35rem;cursor:pointer;font-weight:600;color:#dc2626;">' +
                            '<input type="radio" name="cep-' + s.id + '" value="non" ' + nonChecked + ' onchange="setCEPResult(' + s.id + ',\'non\')"' +
                            ' style="accent-color:#dc2626;width:1.1rem;height:1.1rem;cursor:pointer;">' +
                            'Non' +
                        '</label>' +
                    '</td>' +
                '</tr>';
            }).join('');

            tbody.innerHTML = rows;
            updateCEPSummary(admisCount, students.length);
        }

        // Persist a single CEP choice and refresh the summary + dashboard
        function setCEPResult(studentId, value) {
            appState.cepResults[studentId] = value;
            saveData();
            updateDashboard();

            // Recount for summary
            var cm2Class = appState.classes.find(function(c) { return c.level === 'CM2'; });
            var students = cm2Class ? appState.students.filter(function(s) { return s.classId === cm2Class.id; }) : [];
            var admis = students.filter(function(s) { return appState.cepResults[s.id] === 'oui'; }).length;
            updateCEPSummary(admis, students.length);

            // Highlight the row green/red
            var radio = document.querySelector('input[name="cep-' + studentId + '"]');
            if (radio) {
                var tr = radio.closest('tr');
                tr.style.background = value === 'oui' ? '#dcfce7' : '#fee2e2';
            }
        }

        // Update the three summary boxes at the top of the CEP tab
        function updateCEPSummary(admis, total) {
            document.getElementById('cep-admis-count').textContent = admis;
            document.getElementById('cep-total-count').textContent = total;
            document.getElementById('cep-taux').textContent = total > 0 ? Math.round((admis / total) * 100) + '%' : '0%';
        }

        // Load moyennes for selected student — filtered by trimester
        function loadMoyennes() {
            var studentId = parseInt(document.getElementById('moyenne-student-select').value);
            var tbody = document.getElementById('moyenne-table-body');
            var banner = document.getElementById('moyenne-student-banner');
            var emptyMsg =
                '<tr><td colspan="5" style="padding:3rem;text-align:center;color:var(--gray-text);">' +
                '<div style="font-size:2.5rem;margin-bottom:0.75rem;">📊</div>' +
                '<div style="font-size:1rem;font-weight:600;">Sélectionnez un élève pour voir ses moyennes</div></td></tr>';

            if (!studentId) { banner.style.display = 'none'; tbody.innerHTML = emptyMsg; return; }

            var student = appState.students.find(function(s) { return s.id === studentId; });
            if (!student) return;
            var classInfo = appState.classes.find(function(c) { return c.id === student.classId; });

            // Active trimester filter
            var activeTrimester = document.getElementById('moyenne-trimestre-filter').value;

            // Gather grades: subjectMap[subject][type] = [grade, …]
            // Only include entries whose trimester matches the filter.
            // For legacy entries without a trimester field, derive it from the date.
            var subjectMap = {};
            Object.values(appState.grades).forEach(function(entry) {
                var entryTrimester = entry.trimester || (entry.date ? (getTrimestre(entry.date) || {}).key : null) || 'trimester2';
                if (entryTrimester !== activeTrimester) return;
                entry.grades.forEach(function(g) {
                    if (g.studentId === studentId) {
                        if (!subjectMap[entry.subject]) subjectMap[entry.subject] = {};
                        if (!subjectMap[entry.subject][entry.type]) subjectMap[entry.subject][entry.type] = [];
                        subjectMap[entry.subject][entry.type].push(g.grade);
                    }
                });
            });

            // Show student banner
            document.getElementById('moyenne-student-name').textContent = student.name;
            document.getElementById('moyenne-student-matricule').textContent = student.matricule;
            document.getElementById('moyenne-student-class').textContent = classInfo ? classInfo.name : '-';
            banner.style.display = 'flex';

            var subjects = Object.keys(subjectMap).sort();
            var trimesterLabels = { trimester1:'1er Trimestre', trimester2:'2e Trimestre', trimester3:'3e Trimestre' };

            if (subjects.length === 0) {
                document.getElementById('moyenne-generale').textContent = '-';
                document.getElementById('moyenne-generale').style.color = 'var(--white)';
                tbody.innerHTML =
                    '<tr><td colspan="5" style="padding:3rem;text-align:center;color:var(--gray-text);">' +
                    '<div style="font-size:2.5rem;margin-bottom:0.75rem;">📚</div>' +
                    '<div style="font-size:1rem;font-weight:600;">Aucune note pour ' + trimesterLabels[activeTrimester] + '</div></td></tr>';
                return;
            }

            function getAvgStyle(avg) {
                if (avg > 15) return { color: '#fff', bg: '#16a34a', rowBg: '#dcfce7' };
                if (avg > 12) return { color: '#fff', bg: '#ca8a04', rowBg: '#fef9c3' };
                if (avg > 9)  return { color: '#fff', bg: '#ea580c', rowBg: '#ffedd5' };
                return { color: '#fff', bg: '#dc2626', rowBg: '#fee2e2' };
            }

            var typeOrder = ['Devoir', 'Interrogation', 'Composition', 'Examen'];
            var allRows = '';
            var grandTotal = 0, grandCount = 0;

            subjects.forEach(function(subject, sIndex) {
                var typesMap = subjectMap[subject];
                var typesPresent = typeOrder.filter(function(t) { return typesMap[t]; });

                var subjectSum = 0, subjectCount = 0;
                typesPresent.forEach(function(type) {
                    typesMap[type].forEach(function(g) { subjectSum += g; subjectCount++; });
                });
                var subjectAvg = subjectCount > 0 ? subjectSum / subjectCount : 0;
                grandTotal += subjectSum;
                grandCount += subjectCount;

                var avgStyle = getAvgStyle(subjectAvg);
                var rowspanCount = typesPresent.length;

                typesPresent.forEach(function(type, tIndex) {
                    var notes = typesMap[type];
                    var notesList = notes.map(function(n) { return n.toFixed(1); }).join(', ');
                    var isFirst = (tIndex === 0);

                    allRows +=
                        '<tr style="border-bottom:1px solid var(--border); background:' + (tIndex % 2 === 0 ? 'var(--white)' : 'var(--light-bg)') + ';">' +
                        (isFirst
                            ? '<td rowspan="' + rowspanCount + '" style="padding:0.85rem 1rem;font-weight:600;color:var(--gray-text);text-align:center;vertical-align:middle;border-right:1px solid var(--border);">' + (sIndex + 1) + '</td>'
                            : '') +
                        (isFirst
                            ? '<td rowspan="' + rowspanCount + '" style="padding:0.85rem 1rem;font-weight:700;vertical-align:middle;border-right:1px solid var(--border);">' + subject + '</td>'
                            : '') +
                        '<td style="padding:0.85rem 1rem;color:var(--gray-text);">' + type + '</td>' +
                        '<td style="padding:0.85rem 1rem;text-align:center;color:var(--gray-text);font-size:0.9rem;">' + notesList + '</td>' +
                        (isFirst
                            ? '<td rowspan="' + rowspanCount + '" style="padding:0.85rem 1rem;text-align:center;vertical-align:middle;">' +
                              '<span style="display:inline-block;background:' + avgStyle.bg + ';color:' + avgStyle.color + ';font-weight:700;font-size:1.05rem;padding:0.3rem 0.85rem;border-radius:20px;">' + subjectAvg.toFixed(2) + '/20</span></td>'
                            : '') +
                        '</tr>';
                });
            });

            var overallAvg = grandCount > 0 ? grandTotal / grandCount : 0;
            var genStyle = getAvgStyle(overallAvg);
            document.getElementById('moyenne-generale').textContent = overallAvg.toFixed(2) + '/20';
            document.getElementById('moyenne-generale').style.color = overallAvg >= 10 ? 'var(--white)' : '#ffcccc';

            allRows +=
                '<tr style="border-top:3px solid var(--earth);background:' + genStyle.rowBg + ';">' +
                '<td colspan="3" style="padding:1rem;font-weight:700;font-size:1.05rem;color:var(--earth);">Moyenne — ' + trimesterLabels[activeTrimester] + '</td>' +
                '<td style="padding:1rem;"></td>' +
                '<td style="padding:1rem;text-align:center;">' +
                '<span style="display:inline-block;background:' + genStyle.bg + ';color:' + genStyle.color + ';font-weight:700;font-size:1.2rem;padding:0.35rem 1rem;border-radius:20px;">' + overallAvg.toFixed(2) + '/20</span></td></tr>';

            tbody.innerHTML = allRows;
        }

        // ---- Absences functions ----

        // Router: show the correct sub-view based on role, hide the others
        function loadAbsencesSection() {
            var role = appState.currentUser.role;
            document.getElementById('absences-teacher-view').style.display = (role === 'teacher') ? 'block' : 'none';
            document.getElementById('absences-admin-view').style.display  = (role === 'admin')   ? 'block' : 'none';
            document.getElementById('absences-parent-view').style.display = (role === 'parent')  ? 'block' : 'none';

            if (role === 'teacher') {
                // populate student dropdown + default date to today
                var students = getTeacherStudents();
                var sel = document.getElementById('abs-student-select');
                sel.innerHTML = '<option value="">Sélectionner un élève</option>' +
                    students.map(function(s) { return '<option value="' + s.id + '">' + s.name + '</option>'; }).join('');
                document.getElementById('abs-date').valueAsDate = new Date();
                loadAbsencesTeacher();
            } else if (role === 'admin') {
                // populate class filter
                var filter = document.getElementById('abs-admin-class-filter');
                var levelOrder = ['CP1','CP2','CE1','CE2','CM1','CM2'];
                var sorted = appState.classes.slice().sort(function(a,b) {
                    return levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
                });
                filter.innerHTML = '<option value="">Toutes les classes</option>' +
                    sorted.map(function(c) { return '<option value="' + c.id + '">' + c.name + '</option>'; }).join('');
                loadAbsencesAdmin();
            } else if (role === 'parent') {
                loadAbsencesParent();
            }
        }

        // Teacher: save one absence record
        function saveAbsence() {
            var type = document.getElementById('abs-type').value;
            var studentId = parseInt(document.getElementById('abs-student-select').value);
            var date      = document.getElementById('abs-date').value;
            var time      = document.getElementById('abs-time').value;
            var matiere   = document.getElementById('abs-matiere').value;
            var status    = document.getElementById('abs-status').value;
            var reason    = document.getElementById('abs-reason').value.trim();

            if (!studentId) { showAlert('Veuillez sélectionner un élève', 'error'); return; }
            if (!date)      { showAlert('Veuillez sélectionner une date', 'error'); return; }
            if (!matiere)   { showAlert('Veuillez sélectionner une matière', 'error'); return; }

            // duplicate guard: same student + date + time + matiere + type
            var dup = appState.absences.find(function(a) {
                return a.studentId === studentId && a.date === date && a.time === time && a.matiere === matiere && a.type === type;
            });
            if (dup) { showAlert('Cet enregistrement existe déjà', 'error'); return; }

            var record = {
                id:        Date.now(),
                studentId: studentId,
                classId:   appState.currentUser.classId,
                date:      date,
                time:      time,
                matiere:   matiere,
                type:      type,  // 'Absence' or 'Retard'
                status:    status,  // 'Justifié' or 'Non justifié'
                reason:    reason
            };
            appState.absences.push(record);
            saveData();
            showAlert(type + ' enregistré(e) avec succès', 'success');
            
            // Clear form
            document.getElementById('abs-reason').value = '';
            
            loadAbsencesTeacher();
        }

        // Teacher: render the list table for their class
        function loadAbsencesTeacher() {
            var tbody   = document.getElementById('abs-teacher-tbody');
            var classId = appState.currentUser.classId;
            var list    = appState.absences
                .filter(function(a) { return a.classId === classId; })
                .sort(function(a,b) { return b.date.localeCompare(a.date); });

            if (list.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="padding:2rem;text-align:center;color:var(--gray-text);">Aucune absence enregistrée</td></tr>';
                return;
            }

            tbody.innerHTML = list.map(function(a, i) {
                var student = appState.students.find(function(s) { return s.id === a.studentId; });
                var name    = student ? student.name : '—';
                var mat     = student ? student.matricule : '—';
                var d       = new Date(a.date + 'T00:00:00');
                var dateStr = d.toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });
                return '<tr style="border-bottom:1px solid var(--border);">' +
                    '<td style="padding:0.7rem 1rem;color:var(--gray-text);font-weight:600;">' + (i+1) + '</td>' +
                    '<td style="padding:0.7rem 1rem;font-weight:600;">' + name + '</td>' +
                    '<td style="padding:0.7rem 1rem;color:var(--gray-text);">' + mat + '</td>' +
                    '<td style="padding:0.7rem 1rem;">' + dateStr + '</td>' +
                    '<td style="padding:0.7rem 1rem;text-align:center;font-weight:600;color:var(--sky);">' + a.time + '</td>' +
                    '<td style="padding:0.7rem 1rem;">' + a.matiere + '</td>' +
                    '<td style="padding:0.7rem 1rem;text-align:center;">' +
                        '<button onclick="deleteAbsence(' + a.id + ')" style="background:var(--terracotta);color:#fff;border:none;border-radius:6px;padding:0.35rem 0.75rem;cursor:pointer;font-size:0.82rem;">🗑 Supprimer</button>' +
                    '</td></tr>';
            }).join('');
        }

        // Teacher: delete one absence by id
        function deleteAbsence(id) {
            appState.absences = appState.absences.filter(function(a) { return a.id !== id; });
            saveData();
            showAlert('Absence supprimée', 'success');
            loadAbsencesTeacher();
        }

        // Admin: one row per student showing total absence count + Détails button
        function loadAbsencesAdmin() {
            var tbody     = document.getElementById('abs-admin-tbody');
            var classFilter = document.getElementById('abs-admin-class-filter').value;
            // hide any open detail panel
            document.getElementById('abs-admin-detail').style.display = 'none';

            var students = appState.students.slice();
            if (classFilter) {
                students = students.filter(function(s) { return s.classId === parseInt(classFilter); });
            }
            // sort alphabetically
            students.sort(function(a,b) { return a.name.localeCompare(b.name); });

            if (students.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="padding:2rem;text-align:center;color:var(--gray-text);">Aucun élève trouvé</td></tr>';
                return;
            }

            tbody.innerHTML = students.map(function(s, i) {
                var count = appState.absences.filter(function(a) { return a.studentId === s.id; }).length;
                var cls   = appState.classes.find(function(c) { return c.id === s.classId; });
                var clsName = cls ? cls.name : '—';
                var countColor = count === 0 ? 'var(--green)' : count <= 3 ? 'var(--ochre)' : 'var(--terracotta)';
                return '<tr style="border-bottom:1px solid var(--border);">' +
                    '<td style="padding:0.7rem 1rem;color:var(--gray-text);font-weight:600;">' + (i+1) + '</td>' +
                    '<td style="padding:0.7rem 1rem;font-weight:600;">' + s.name + '</td>' +
                    '<td style="padding:0.7rem 1rem;color:var(--gray-text);">' + s.matricule + '</td>' +
                    '<td style="padding:0.7rem 1rem;">' + clsName + '</td>' +
                    '<td style="padding:0.7rem 1rem;text-align:center;font-weight:700;font-size:1.15rem;color:' + countColor + ';">' + count + '</td>' +
                    '<td style="padding:0.7rem 1rem;text-align:center;">' +
                        (count > 0
                            ? '<button onclick="showAbsenceDetail(' + s.id + ')" style="background:var(--sky);color:#fff;border:none;border-radius:6px;padding:0.35rem 0.9rem;cursor:pointer;font-size:0.82rem;">📋 Détails</button>'
                            : '<span style="color:var(--gray-text);font-size:0.85rem;">—</span>') +
                    '</td></tr>';
            }).join('');
        }

        // Admin: expand detail panel for one student (read-only list)
        function showAbsenceDetail(studentId) {
            var panel  = document.getElementById('abs-admin-detail');
            var list   = appState.absences
                .filter(function(a) { return a.studentId === studentId; })
                .sort(function(a,b) { return b.date.localeCompare(a.date); });
            var student = appState.students.find(function(s) { return s.id === studentId; });

            var rows = list.map(function(a, i) {
                var d = new Date(a.date + 'T00:00:00');
                var dateStr = d.toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });
                return '<tr style="border-bottom:1px solid var(--border);">' +
                    '<td style="padding:0.65rem 1rem;color:var(--gray-text);">' + (i+1) + '</td>' +
                    '<td style="padding:0.65rem 1rem;">' + dateStr + '</td>' +
                    '<td style="padding:0.65rem 1rem;text-align:center;font-weight:600;color:var(--sky);">' + a.time + '</td>' +
                    '<td style="padding:0.65rem 1rem;">' + a.matiere + '</td>' +
                '</tr>';
            }).join('');

            panel.style.display = 'block';
            panel.innerHTML =
                '<div class="card">' +
                '<div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">' +
                    '<h3 class="card-title">Détails — ' + (student ? student.name : '') + ' (' + list.length + ' absence(s))</h3>' +
                    '<button onclick="document.getElementById(\'abs-admin-detail\').style.display=\'none\'" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--gray-text);">✕</button>' +
                '</div>' +
                '<div class="card-body"><div style="overflow-x:auto;">' +
                '<table style="width:100%;border-collapse:collapse;">' +
                    '<thead><tr style="background:linear-gradient(135deg,var(--earth) 0%,var(--savanna) 100%);color:#fff;">' +
                        '<th style="padding:0.75rem 1rem;text-align:left;border-radius:8px 0 0 0;">#</th>' +
                        '<th style="padding:0.75rem 1rem;text-align:left;">Date</th>' +
                        '<th style="padding:0.75rem 1rem;text-align:center;">Horaire</th>' +
                        '<th style="padding:0.75rem 1rem;text-align:left;border-radius:0 8px 0 0;">Matière</th>' +
                    '</tr></thead>' +
                    '<tbody>' + rows + '</tbody>' +
                '</table>' +
                '</div></div></div>';
        }

        // Parent: cards for each of their children with total count + expandable list
        function loadAbsencesParent() {
            var children = getParentChildren();
            var container = document.getElementById('abs-parent-cards');

            if (children.length === 0) {
                container.innerHTML = '<div class="card"><div class="card-body"><p style="text-align:center;color:var(--gray-text);padding:2rem;">Aucun élève associé à votre compte</p></div></div>';
                return;
            }

            container.innerHTML = children.map(function(child) {
                var absences = appState.absences
                    .filter(function(a) { return a.studentId === child.id; })
                    .sort(function(a,b) { return b.date.localeCompare(a.date); });
                var count = absences.length;
                var cls   = appState.classes.find(function(c) { return c.id === child.classId; });
                var countColor = count === 0 ? 'var(--green)' : count <= 3 ? 'var(--ochre)' : 'var(--terracotta)';

                var detailRows = absences.map(function(a) {
                    var d = new Date(a.date + 'T00:00:00');
                    var dateStr = d.toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });
                    return '<tr style="border-bottom:1px solid var(--border);">' +
                        '<td style="padding:0.6rem 0.85rem;">' + dateStr + '</td>' +
                        '<td style="padding:0.6rem 0.85rem;text-align:center;font-weight:600;color:var(--sky);">' + a.time + '</td>' +
                        '<td style="padding:0.6rem 0.85rem;">' + a.matiere + '</td>' +
                    '</tr>';
                }).join('');

                return '<div class="card" style="margin-bottom:1.25rem;">' +
                    '<div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">' +
                        '<div>' +
                            '<h3 class="card-title">' + child.name + '</h3>' +
                            '<span style="font-size:0.85rem;color:var(--gray-text);">' + (cls ? cls.name : '') + ' · ' + child.matricule + '</span>' +
                        '</div>' +
                        '<div style="text-align:right;">' +
                            '<div style="font-size:2rem;font-weight:700;color:' + countColor + ';line-height:1;">' + count + '</div>' +
                            '<div style="font-size:0.78rem;color:var(--gray-text);">absence(s)</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="card-body">' +
                        (count === 0
                            ? '<p style="color:var(--green);font-weight:600;padding:0.75rem 0;">✓ Aucune absence enregistrée</p>'
                            : '<div style="overflow-x:auto;">' +
                                '<table style="width:100%;border-collapse:collapse;">' +
                                    '<thead><tr style="background:linear-gradient(135deg,var(--earth) 0%,var(--savanna) 100%);color:#fff;">' +
                                        '<th style="padding:0.65rem 0.85rem;text-align:left;border-radius:8px 0 0 0;">Date</th>' +
                                        '<th style="padding:0.65rem 0.85rem;text-align:center;">Horaire</th>' +
                                        '<th style="padding:0.65rem 0.85rem;text-align:left;border-radius:0 8px 0 0;">Matière</th>' +
                                    '</tr></thead>' +
                                    '<tbody>' + detailRows + '</tbody>' +
                                '</table>' +
                              '</div>'
                        ) +
                    '</div></div>';
            }).join('');
        }

        // ---- Bulletin functions ----

        // Populate the class dropdown and reset student dropdown
        function initBulletin() {
            // Restore class selector visibility (may have been hidden by initBulletinParent)
            document.getElementById('bulletin-class-select').parentElement.style.display = '';

            var classSelect = document.getElementById('bulletin-class-select');
            var levelOrder = ['CP1','CP2','CE1','CE2','CM1','CM2'];
            var sorted = appState.classes.slice().sort(function(a, b) {
                return levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
            });
            classSelect.innerHTML = '<option value="">— Choisir une classe —</option>' +
                sorted.map(function(c) { return '<option value="' + c.id + '">' + c.name + '</option>'; }).join('');
            classSelect.value = '';
            document.getElementById('bulletin-student-select').innerHTML = '<option value="">— Choisir un élève —</option>';
            document.getElementById('bulletin-student-select').disabled = true;
            document.getElementById('bulletin-card').style.display = 'none';
            document.getElementById('bulletin-print-btn').disabled = true;
            document.getElementById('bulletin-print-btn').style.opacity = '0.4';
            document.getElementById('bulletin-print-btn').style.pointerEvents = 'none';
        }

        // Parent variant: hide the class selector, fill student dropdown with own children only
        function initBulletinParent() {
            // Hide class selector, keep student + print button visible
            document.getElementById('bulletin-class-select').parentElement.style.display = 'none';

            var children = getParentChildren();
            var studentSelect = document.getElementById('bulletin-student-select');

            studentSelect.innerHTML = '<option value="">— Choisir un élève —</option>' +
                children.map(function(c) {
                    return '<option value="' + c.id + '">' + c.name + ' — ' + c.matricule + '</option>';
                }).join('');
            studentSelect.disabled = (children.length === 0);

            // Reset bulletin card
            document.getElementById('bulletin-card').style.display = 'none';
            document.getElementById('bulletin-print-btn').disabled = true;
            document.getElementById('bulletin-print-btn').style.opacity = '0.4';
            document.getElementById('bulletin-print-btn').style.pointerEvents = 'none';

            // Auto-load immediately when there is only one child
            if (children.length === 1) {
                studentSelect.value = children[0].id.toString();
                loadBulletin();
            }
        }

        // When class changes, populate student dropdown
        function bulletinClassChanged() {
            var classId = parseInt(document.getElementById('bulletin-class-select').value);
            var studentSelect = document.getElementById('bulletin-student-select');
            document.getElementById('bulletin-card').style.display = 'none';
            document.getElementById('bulletin-print-btn').disabled = true;
            document.getElementById('bulletin-print-btn').style.opacity = '0.4';
            document.getElementById('bulletin-print-btn').style.pointerEvents = 'none';

            if (!classId) {
                studentSelect.innerHTML = '<option value="">— Choisir un élève —</option>';
                studentSelect.disabled = true;
                return;
            }
            var students = appState.students.filter(function(s) { return s.classId === classId; });
            students.sort(function(a, b) { return a.name.localeCompare(b.name); });
            studentSelect.innerHTML = '<option value="">— Choisir un élève —</option>' +
                students.map(function(s) { return '<option value="' + s.id + '">' + s.name + ' — ' + s.matricule + '</option>'; }).join('');
            studentSelect.disabled = false;
        }

        // Build and render the full bulletin for the selected student
        function loadBulletin() {
            var studentId = parseInt(document.getElementById('bulletin-student-select').value);
            if (!studentId) {
                document.getElementById('bulletin-card').style.display = 'none';
                document.getElementById('bulletin-print-btn').disabled = true;
                document.getElementById('bulletin-print-btn').style.opacity = '0.4';
                document.getElementById('bulletin-print-btn').style.pointerEvents = 'none';
                return;
            }

            var student = appState.students.find(function(s) { return s.id === studentId; });
            if (!student) return;
            var classInfo = appState.classes.find(function(c) { return c.id === student.classId; });

            // Gather live grades grouped by subject → trimester
            // Use stored entry.trimester; fall back to getTrimestre(date) for legacy entries
            var subjectMap = {};
            Object.values(appState.grades).forEach(function(entry) {
                var t = entry.trimester || (entry.date ? (getTrimestre(entry.date) || {}).key : null) || 'trimester2';
                entry.grades.forEach(function(g) {
                    if (g.studentId !== studentId) return;
                    if (!subjectMap[entry.subject]) subjectMap[entry.subject] = { trimester1: [], trimester2: [], trimester3: [] };
                    subjectMap[entry.subject][t].push(g.grade);
                });
            });

            function avg(arr) { return arr.length > 0 ? arr.reduce(function(s,v){return s+v;},0)/arr.length : null; }

            // Colour badge (same palette as Moyenne tab)
            function badge(val) {
                if (val === null) return '<span style="color:var(--gray-text);font-style:italic;font-size:0.82rem;">—</span>';
                var bg, color;
                if (val > 15)      { bg='#16a34a'; color='#fff'; }
                else if (val > 12) { bg='#ca8a04'; color='#fff'; }
                else if (val > 9)  { bg='#ea580c'; color='#fff'; }
                else               { bg='#dc2626'; color='#fff'; }
                return '<span style="display:inline-block;background:'+bg+';color:'+color+';font-weight:700;font-size:0.88rem;padding:0.22rem 0.7rem;border-radius:14px;">'+val.toFixed(2)+'/20</span>';
            }

            var rows = '';
            var yearTotals = [0,0,0], yearCounts = [0,0,0];
            var subjects = Object.keys(subjectMap).sort();

            if (subjects.length === 0) {
                // No grades entered by teacher yet — show empty bulletin with dashes
                rows += '<tr style="border-bottom:1px solid var(--border);">' +
                    '<td colspan="4" style="padding:2rem;text-align:center;color:var(--gray-text);font-style:italic;">' +
                    'Aucune note enregistrée par l\'enseignant pour cet élève.</td></tr>';
            }

            subjects.forEach(function(subject) {
                var data = subjectMap[subject];
                var avgs = [avg(data.trimester1), avg(data.trimester2), avg(data.trimester3)];
                avgs.forEach(function(v, i) { if (v !== null) { yearTotals[i] += v; yearCounts[i]++; } });
                rows += '<tr style="border-bottom:1px solid var(--border);">' +
                    '<td style="padding:0.7rem 1rem;font-weight:600;color:var(--dark-text);">' + subject + '</td>' +
                    '<td style="padding:0.7rem 0.75rem;text-align:center;border-left:1px solid var(--border);">' + badge(avgs[0]) + '</td>' +
                    '<td style="padding:0.7rem 0.75rem;text-align:center;border-left:1px solid var(--border);">' + badge(avgs[1]) + '</td>' +
                    '<td style="padding:0.7rem 0.75rem;text-align:center;border-left:1px solid var(--border);">' + badge(avgs[2]) + '</td>' +
                '</tr>';
            });

            // Moyenne Annuelle row (per-trimester averages)
            var yearAvgs = [
                yearCounts[0]>0 ? yearTotals[0]/yearCounts[0] : null,
                yearCounts[1]>0 ? yearTotals[1]/yearCounts[1] : null,
                yearCounts[2]>0 ? yearTotals[2]/yearCounts[2] : null
            ];
            var overallArr = yearAvgs.filter(function(v){return v!==null;});
            var overallAvg = overallArr.length>0 ? overallArr.reduce(function(s,v){return s+v;},0)/overallArr.length : null;

            rows += '<tr style="background:linear-gradient(135deg,var(--earth) 0%,var(--savanna) 100%);color:#fff;">' +
                '<td style="padding:0.85rem 1rem;font-weight:700;font-size:1rem;">Moyenne Annuelle</td>' +
                '<td style="padding:0.85rem 0.75rem;text-align:center;border-left:1px solid rgba(255,255,255,0.3);">' + badge(yearAvgs[0]) + '</td>' +
                '<td style="padding:0.85rem 0.75rem;text-align:center;border-left:1px solid rgba(255,255,255,0.3);">' + badge(yearAvgs[1]) + '</td>' +
                '<td style="padding:0.85rem 0.75rem;text-align:center;border-left:1px solid rgba(255,255,255,0.3);">' + badge(yearAvgs[2]) + '</td>' +
            '</tr>';

            // Appreciation + overall average footer row
            var appreciation = '';
            if (overallAvg !== null) {
                if (overallAvg>16)      appreciation = '🏆 Très Bien';
                else if (overallAvg>14) appreciation = '⭐ Bien';
                else if (overallAvg>12) appreciation = '👍 Assez Bien';
                else if (overallAvg>9)  appreciation = '📚 Passable';
                else                    appreciation = '⚠️ À Améliorer';
            }
            rows += '<tr style="background:var(--light-bg);border-top:2px solid var(--border);">' +
                '<td colspan="4" style="padding:0.75rem 1rem;text-align:center;font-weight:700;font-size:1rem;color:var(--earth);">' +
                    'Moyenne Générale Annuelle : ' + (overallAvg!==null ? overallAvg.toFixed(2)+'/20' : '—') +
                    (appreciation ? ' &nbsp;|&nbsp; Appréciation : ' + appreciation : '') +
                '</td>' +
            '</tr>';

            // --- Fill DOM ---
            document.getElementById('bulletin-title').textContent = 'Bulletin de ' + student.name;
            document.getElementById('bulletin-meta').innerHTML =
                'Classe : ' + (classInfo ? classInfo.name : '—') + '<br>' +
                'Matricule : ' + student.matricule + '<br>' +
                'Année Scolaire : 2024 – 2025';

            document.getElementById('bulletin-info-strip').innerHTML =
                '<div style="padding:0.9rem 1.2rem;border-right:1px solid var(--border);">' +
                    '<div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;color:var(--gray-text);margin-bottom:0.2rem;">Élève</div>' +
                    '<div style="font-weight:700;font-size:0.95rem;color:var(--dark-text);">' + student.name + '</div>' +
                '</div>' +
                '<div style="padding:0.9rem 1.2rem;border-right:1px solid var(--border);">' +
                    '<div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;color:var(--gray-text);margin-bottom:0.2rem;">Classe</div>' +
                    '<div style="font-weight:700;font-size:0.95rem;color:var(--dark-text);">' + (classInfo ? classInfo.name : '—') + '</div>' +
                '</div>' +
                '<div style="padding:0.9rem 1.2rem;">' +
                    '<div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;color:var(--gray-text);margin-bottom:0.2rem;">Matricule</div>' +
                    '<div style="font-weight:700;font-size:0.95rem;color:var(--dark-text);">' + student.matricule + '</div>' +
                '</div>';

            document.getElementById('bulletin-tbody').innerHTML = rows;
            document.getElementById('bulletin-date-print').textContent = 'Édité le ' + new Date().toLocaleDateString('fr-FR', {day:'numeric',month:'long',year:'numeric'});

            document.getElementById('bulletin-card').style.display = 'block';
            document.getElementById('bulletin-print-btn').disabled = false;
            document.getElementById('bulletin-print-btn').style.opacity = '1';
            document.getElementById('bulletin-print-btn').style.pointerEvents = 'auto';
        }

        function printBulletin() {
            applyLogoToWatermarks();
            window.print();
        }


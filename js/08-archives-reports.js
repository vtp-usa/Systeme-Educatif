// ============================================================
// js/08-archives-reports.js — Student archiving, CSV export, backup/restore
// Lines 6173-6584 of original Ecole-Main-System.html
// ============================================================

        // ---- Archives Management ----

        function archiveStudent(studentId, reason) {
            var student = appState.students.find(function(s) { return s.id === studentId; });
            if (!student) return;

            var confirmMsg = reason === 'Diplômé' 
                ? 'Voulez-vous marquer ' + student.name + ' comme diplômé(e) et archiver son dossier?'
                : 'Voulez-vous marquer ' + student.name + ' comme transféré(e) et archiver son dossier?';

            if (!confirm(confirmMsg)) {
                return;
            }

            var currentYear = new Date().getFullYear();
            var lastClass = appState.classes.find(function(c) { return c.id === student.classId; });

            // Create archived student record
            var archivedStudent = {
                id: student.id,
                name: student.name,
                matricule: student.matricule,
                sex: student.sex,
                birthDate: student.birthDate,
                parentName: student.parentName,
                parentRelation: student.parentRelation,
                parentPhone: student.parentPhone,
                parentEmail: student.parentEmail,
                lastClass: lastClass ? lastClass.name : 'N/A',
                archiveYear: currentYear,
                archiveReason: reason,
                archivedDate: new Date().toISOString(),
                // Preserve complete student record
                grades: JSON.parse(JSON.stringify(appState.grades)),
                absences: appState.absences.filter(function(a) { return a.studentId === studentId; }),
                payments: appState.payments.filter(function(p) { return p.studentId === studentId; }),
                averages: student.averages,
                lastUpdated: student.lastUpdated || new Date().toISOString()
            };

            // Add to archived students
            appState.archivedStudents.push(archivedStudent);

            // Remove from active students
            appState.students = appState.students.filter(function(s) { return s.id !== studentId; });

            // Clean up related data
            delete appState.grades[studentId];
            delete appState.cepResults[studentId];

            saveData();
            showAlert(student.name + ' a été archivé(e) avec succès (' + reason + ')', 'success');
            loadStudentsClassData();
        }

        function checkInactiveStudents() {
            // Auto-archive students inactive for 3 months after school year start
            var schoolYearStart = new Date(appState.schoolYearStartDate);
            var threeMonthsLater = new Date(schoolYearStart);
            threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
            var today = new Date();

            // Only check if we're past the 3-month mark
            if (today < threeMonthsLater) return;

            var inactiveStudents = appState.students.filter(function(s) {
                if (!s.lastUpdated) return false;
                var lastUpdate = new Date(s.lastUpdated);
                return lastUpdate < threeMonthsLater;
            });

            if (inactiveStudents.length > 0) {
                console.log('Auto-archiving ' + inactiveStudents.length + ' inactive student(s)');
                inactiveStudents.forEach(function(student) {
                    archiveStudent(student.id, 'Inactif');
                });
            }
        }

        function loadArchives() {
            var tbody = document.getElementById('archive-table-body');
            var yearFilter = document.getElementById('archive-year-filter');

            // Check for inactive students to auto-archive
            checkInactiveStudents();

            // Populate year filter
            var years = {};
            appState.archivedStudents.forEach(function(s) {
                years[s.archiveYear] = true;
            });
            var yearOptions = Object.keys(years).sort().reverse().map(function(y) {
                return '<option value="' + y + '">' + y + '</option>';
            }).join('');
            yearFilter.innerHTML = '<option value="">Toutes</option>' + yearOptions;

            filterArchives();
        }

        function filterArchives() {
            var searchTerm = document.getElementById('archive-search').value.toLowerCase();
            var yearFilter = document.getElementById('archive-year-filter').value;
            var reasonFilter = document.getElementById('archive-reason-filter').value;
            var tbody = document.getElementById('archive-table-body');

            var filtered = appState.archivedStudents.filter(function(student) {
                var matchSearch = !searchTerm || 
                    student.name.toLowerCase().includes(searchTerm) || 
                    student.matricule.toLowerCase().includes(searchTerm);
                var matchYear = !yearFilter || student.archiveYear == yearFilter;
                var matchReason = !reasonFilter || student.archiveReason === reasonFilter;
                return matchSearch && matchYear && matchReason;
            });

            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="11" style="padding:2rem;text-align:center;color:var(--gray-text);">Aucun élève archivé trouvé</td></tr>';
                return;
            }

            tbody.innerHTML = filtered.map(function(student, index) {
                var sexDisplay = student.sex === 'M' ? '♂ M' : student.sex === 'F' ? '♀ F' : '-';
                var sexColor = student.sex === 'M' ? 'var(--sky)' : student.sex === 'F' ? 'var(--terracotta)' : 'var(--gray-text)';
                
                // Reason badge color
                var reasonColor = student.archiveReason === 'Diplômé' ? 'var(--green)' 
                    : student.archiveReason === 'Transféré' ? 'var(--ochre)' 
                    : 'var(--gray-text)';
                
                return '<tr style="border-bottom:1px solid var(--border);">' +
                    '<td style="padding:1rem;font-weight:600;">' + (index + 1) + '</td>' +
                    '<td style="padding:1rem;font-weight:600;">' + student.name + '</td>' +
                    '<td style="padding:1rem;color:var(--gray-text);">' + student.matricule + '</td>' +
                    '<td style="padding:1rem;text-align:center;font-weight:700;color:' + sexColor + ';">' + sexDisplay + '</td>' +
                    '<td style="padding:1rem;color:var(--gray-text);">' + formatDate(student.birthDate) + '</td>' +
                    '<td style="padding:1rem;"><span style="background:var(--light-bg);padding:0.25rem 0.75rem;border-radius:6px;font-weight:600;">' + student.lastClass + '</span></td>' +
                    '<td style="padding:1rem;"><span style="background:' + reasonColor + ';color:var(--white);padding:0.25rem 0.75rem;border-radius:6px;font-weight:600;font-size:0.85rem;">' + student.archiveReason + '</span></td>' +
                    '<td style="padding:1rem;font-weight:600;color:var(--earth);">' + student.archiveYear + '</td>' +
                    '<td style="padding:1rem;color:var(--gray-text);">' + (student.parentName || '—') + '</td>' +
                    '<td style="padding:1rem;color:var(--gray-text);">' + (student.parentPhone || '—') + '</td>' +
                    '<td style="padding:1rem;text-align:center;">' +
                        '<button onclick="viewArchivedRecord(' + student.id + ')" style="background:var(--sky);color:var(--white);border:none;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;font-size:0.875rem;">' +
                            '👁️ Voir Dossier' +
                        '</button>' +
                    '</td>' +
                '</tr>';
            }).join('');
        }

        function viewArchivedRecord(studentId) {
            var student = appState.archivedStudents.find(function(s) { return s.id === studentId; });
            if (!student) return;

            var content = document.getElementById('archive-modal-content');
            content.innerHTML = 
                '<div style="background:var(--light-bg);padding:1.5rem;border-radius:8px;margin-bottom:1.5rem;">' +
                    '<h3 style="color:var(--dark-text);margin-bottom:1rem;font-size:1.1rem;">Informations Personnelles</h3>' +
                    '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;">' +
                        '<div><strong>Nom Complet:</strong> ' + student.name + '</div>' +
                        '<div><strong>Matricule:</strong> ' + student.matricule + '</div>' +
                        '<div><strong>Sexe:</strong> ' + (student.sex === 'M' ? 'Masculin' : 'Féminin') + '</div>' +
                        '<div><strong>Date de Naissance:</strong> ' + formatDate(student.birthDate) + '</div>' +
                        '<div><strong>Dernière Classe:</strong> ' + student.lastClass + '</div>' +
                        '<div><strong>Raison d\'Archivage:</strong> <span style="background:var(--' + (student.archiveReason === 'Diplômé' ? 'green' : student.archiveReason === 'Transféré' ? 'ochre' : 'gray-text') + ');color:var(--white);padding:0.25rem 0.75rem;border-radius:6px;font-weight:600;font-size:0.85rem;">' + student.archiveReason + '</span></div>' +
                        '<div><strong>Année d\'Archivage:</strong> ' + student.archiveYear + '</div>' +
                        '<div><strong>Date d\'Archivage:</strong> ' + new Date(student.archivedDate).toLocaleDateString('fr-FR') + '</div>' +
                    '</div>' +
                '</div>' +

                '<div style="background:var(--light-bg);padding:1.5rem;border-radius:8px;margin-bottom:1.5rem;">' +
                    '<h3 style="color:var(--dark-text);margin-bottom:1rem;font-size:1.1rem;">Contact Parent</h3>' +
                    '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;">' +
                        '<div><strong>Nom:</strong> ' + (student.parentName || '—') + '</div>' +
                        '<div><strong>Relation:</strong> ' + (student.parentRelation || '—') + '</div>' +
                        '<div><strong>Téléphone:</strong> ' + (student.parentPhone || '—') + '</div>' +
                        '<div><strong>Email:</strong> ' + (student.parentEmail || '—') + '</div>' +
                    '</div>' +
                '</div>' +

                '<div style="background:var(--light-bg);padding:1.5rem;border-radius:8px;">' +
                    '<h3 style="color:var(--dark-text);margin-bottom:1rem;font-size:1.1rem;">Moyennes Annuelles</h3>' +
                    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;">' +
                        '<div><strong>Trimestre 1:</strong> ' + (student.averages.trimester1 || '—') + '/20</div>' +
                        '<div><strong>Trimestre 2:</strong> ' + (student.averages.trimester2 || '—') + '/20</div>' +
                        '<div><strong>Trimestre 3:</strong> ' + (student.averages.trimester3 || '—') + '/20</div>' +
                    '</div>' +
                '</div>';

            document.getElementById('archive-modal').style.display = 'flex';
        }

        function closeArchiveModal() {
            document.getElementById('archive-modal').style.display = 'none';
        }

        // ---- End Archives Management ----

        // ---- Phase 1: Data Export/Import Functions ----

        function downloadCSV(filename, csvContent) {
            var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            var link = document.createElement('a');
            if (link.download !== undefined) {
                var url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }

        function exportStudentsToCSV() {
            var csv = 'Matricule,Nom,Sexe,Date de Naissance,Classe,Parent,Relation,Téléphone,Email\n';
            
            appState.students.forEach(function(student) {
                var classInfo = appState.classes.find(function(c) { return c.id === student.classId; });
                var className = classInfo ? classInfo.name : 'N/A';
                
                csv += [
                    student.matricule || '',
                    '"' + (student.name || '') + '"',
                    student.sex || '',
                    student.birthDate || '',
                    '"' + className + '"',
                    '"' + (student.parentName || '') + '"',
                    student.parentRelation || '',
                    student.parentPhone || '',
                    student.parentEmail || ''
                ].join(',') + '\n';
            });
            
            downloadCSV('eleves_' + appState.academicYear + '.csv', csv);
            showAlert('Liste des élèves exportée avec succès', 'success');
        }

        function exportGradesToCSV() {
            var csv = 'Matricule,Nom,Classe,Trimestre 1,Trimestre 2,Trimestre 3\n';
            
            appState.students.forEach(function(student) {
                var classInfo = appState.classes.find(function(c) { return c.id === student.classId; });
                var className = classInfo ? classInfo.name : 'N/A';
                
                csv += [
                    student.matricule || '',
                    '"' + (student.name || '') + '"',
                    '"' + className + '"',
                    student.averages.trimester1 || '0',
                    student.averages.trimester2 || '0',
                    student.averages.trimester3 || '0'
                ].join(',') + '\n';
            });
            
            downloadCSV('notes_' + appState.academicYear + '.csv', csv);
            showAlert('Notes exportées avec succès', 'success');
        }

        function exportAbsencesToCSV() {
            var csv = 'Matricule,Nom,Classe,Date,Horaire,Matière\n';
            
            appState.absences.forEach(function(absence) {
                var student = appState.students.find(function(s) { return s.id === absence.studentId; });
                if (!student) return;
                
                var classInfo = appState.classes.find(function(c) { return c.id === student.classId; });
                var className = classInfo ? classInfo.name : 'N/A';
                
                csv += [
                    student.matricule || '',
                    '"' + (student.name || '') + '"',
                    '"' + className + '"',
                    absence.date || '',
                    absence.time || '',
                    '"' + (absence.matiere || '') + '"'
                ].join(',') + '\n';
            });
            
            downloadCSV('absences_' + appState.academicYear + '.csv', csv);
            showAlert('Absences exportées avec succès', 'success');
        }

        function exportPaymentsToCSV() {
            var csv = 'Matricule,Nom,Classe,Montant,Date,Mode de Paiement\n';
            
            appState.payments.forEach(function(payment) {
                var student = appState.students.find(function(s) { return s.id === payment.studentId; });
                if (!student) return;
                
                var classInfo = appState.classes.find(function(c) { return c.id === student.classId; });
                var className = classInfo ? classInfo.name : 'N/A';
                
                csv += [
                    student.matricule || '',
                    '"' + (student.name || '') + '"',
                    '"' + className + '"',
                    payment.amount || '0',
                    payment.date || '',
                    payment.method || ''
                ].join(',') + '\n';
            });
            
            downloadCSV('paiements_' + appState.academicYear + '.csv', csv);
            showAlert('Paiements exportés avec succès', 'success');
        }

        function exportTeachersToCSV() {
            var csv = 'Matricule,Nom,Sexe,Téléphone,Email,Classe Assignée\n';
            
            appState.users.filter(function(u) { return u.role === 'teacher'; }).forEach(function(teacher) {
                var classInfo = appState.classes.find(function(c) { return c.id === teacher.classId; });
                var className = classInfo ? classInfo.name : 'Non assigné';
                
                csv += [
                    teacher.matricule || '',
                    '"' + (teacher.fullName || '') + '"',
                    teacher.sex || '',
                    teacher.phone || '',
                    teacher.email || '',
                    '"' + className + '"'
                ].join(',') + '\n';
            });
            
            downloadCSV('enseignants_' + appState.academicYear + '.csv', csv);
            showAlert('Liste des enseignants exportée avec succès', 'success');
        }

        function exportBackup() {
            var backup = {
                exportDate: new Date().toISOString(),
                version: '1.0',
                schoolName: appState.schoolName,
                academicYear: appState.academicYear,
                data: {
                    users: appState.users,
                    classes: appState.classes,
                    students: appState.students,
                    absences: appState.absences,
                    grades: appState.grades,
                    cepResults: appState.cepResults,
                    payments: appState.payments,
                    classFees: appState.classFees,
                    schedule: appState.schedule,
                    schoolLogo: appState.schoolLogo,
                    economeSignature: appState.economeSignature,
                    archivedStudents: appState.archivedStudents,
                    schoolYearStartDate: appState.schoolYearStartDate,
                    schoolAddress: appState.schoolAddress,
                    schoolPhone: appState.schoolPhone,
                    schoolEmail: appState.schoolEmail,
                    headmasterName: appState.headmasterName,
                    headmasterSignature: appState.headmasterSignature,
                    subjects: appState.subjects,
                    paymentPlans: appState.paymentPlans,
                    feeExemptions: appState.feeExemptions,
                    detailedGrades: appState.detailedGrades
                }
            };
            
            var json = JSON.stringify(backup, null, 2);
            var blob = new Blob([json], { type: 'application/json' });
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'sauvegarde_' + appState.schoolName.replace(/\s+/g, '_') + '_' + appState.academicYear + '.json';
            link.click();
            
            showAlert('Sauvegarde complète téléchargée avec succès', 'success');
        }

        function importBackup() {
            var fileInput = document.getElementById('restore-file-input');
            if (!fileInput.files || !fileInput.files[0]) {
                showAlert('Veuillez sélectionner un fichier de sauvegarde', 'error');
                return;
            }
            
            var file = fileInput.files[0];
            var reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    var backup = JSON.parse(e.target.result);
                    
                    if (!backup.data) {
                        showAlert('Fichier de sauvegarde invalide', 'error');
                        return;
                    }
                    
                    if (!confirm('⚠️ ATTENTION: Cette action va remplacer TOUTES les données actuelles. Êtes-vous sûr de vouloir continuer?')) {
                        return;
                    }
                    
                    // Restore all data
                    Object.keys(backup.data).forEach(function(key) {
                        appState[key] = backup.data[key];
                    });
                    
                    saveData();
                    showAlert('Sauvegarde restaurée avec succès. La page va se recharger.', 'success');
                    
                    setTimeout(function() {
                        location.reload();
                    }, 2000);
                    
                } catch (error) {
                    showAlert('Erreur lors de la restauration: ' + error.message, 'error');
                }
            };
            
            reader.readAsText(file);
        }

        // ---- End Phase 1: Data Export/Import ----

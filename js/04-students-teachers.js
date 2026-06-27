// ============================================================
// js/04-students-teachers.js — Student/teacher CRUD, class assignment, logo & school config
// Lines 3922-4672 of original Ecole-Main-System.html
// ============================================================

        // ========== ADMIN FUNCTIONS ==========
        
        // Populate Class Selector
        function populateClassSelector() {
            // Populate admin class selector (if it exists)
            const adminSelector = document.getElementById('admin-class-selector');
            // Populate students section class selector (if it exists)
            const studentsSelector = document.getElementById('students-class-selector');
            
            // Sort classes by level order
            const levelOrder = ['CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2'];
            const sortedClasses = [...appState.classes].sort((a, b) => {
                return levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
            });
            
            const optionsHTML = '<option value="">-- Sélectionner une classe --</option>' +
                sortedClasses.map(c => `<option value="${c.id}">${c.name} (${c.level})</option>`).join('');
            
            if (adminSelector) {
                adminSelector.innerHTML = optionsHTML;
            }
            
            if (studentsSelector) {
                studentsSelector.innerHTML = optionsHTML;
            }
        }
        
        // Load Students Class Data (for Students Section)
        function loadStudentsClassData() {
            const classId = parseInt(document.getElementById('students-class-selector').value);
            const tbody = document.getElementById('students-list-body');
            const classInfoCard = document.getElementById('students-class-info-card');
            
            if (!classId) {
                // No class selected - show placeholder
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="padding: 3rem; text-align: center; color: var(--gray-text);">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">📚</div>
                            <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">Sélectionnez une classe</div>
                            <div style="font-size: 0.9rem;">Utilisez le menu déroulant ci-dessus pour voir les élèves d'une classe</div>
                        </td>
                    </tr>
                `;
                classInfoCard.style.display = 'none';
                return;
            }
            
            // Get class info
            const classInfo = appState.classes.find(c => c.id === classId);
            if (!classInfo) return;
            
            // Get students for this class
            const students = appState.students.filter(s => s.classId === classId);
            
            // Get teacher info for this class
            const teacher = appState.users.find(u => u.role === 'teacher' && u.classId === classId);
            const teacherSex = teacher && teacher.sex ? (teacher.sex === 'M' ? '♂ Masculin' : '♀ Féminin') : '-';
            
            // Update class info card
            document.getElementById('students-class-info-name').textContent = classInfo.name;
            document.getElementById('students-class-info-teacher').textContent = classInfo.teacher || 'Non assigné';
            document.getElementById('students-class-info-teacher-sex').textContent = teacherSex;
            document.getElementById('students-class-info-count').textContent = students.length;
            document.getElementById('students-class-info-level').textContent = classInfo.level;
            classInfoCard.style.display = 'block';
            
            if (students.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="9" style="padding: 3rem; text-align: center; color: var(--gray-text);">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">👨‍🎓</div>
                            <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">Aucun élève dans cette classe</div>
                            <div style="font-size: 0.9rem;">Cliquez sur "+ Enregistrer un Élève" pour ajouter des élèves</div>
                        </td>
                    </tr>
                `;
                return;
            }
            
            // Sort students by name
            students.sort((a, b) => a.name.localeCompare(b.name));
            
            tbody.innerHTML = students.map((student, index) => {
                const age = calculateAge(student.birthDate);
                const sexDisplay = student.sex === 'M' ? '♂ M' : student.sex === 'F' ? '♀ F' : '-';
                const sexColor = student.sex === 'M' ? 'var(--sky)' : student.sex === 'F' ? 'var(--terracotta)' : 'var(--gray-text)';
                const noContact = '<span style="font-style: italic; opacity: 0.5;">Non fourni</span>';
                return `
                    <tr style="border-bottom: 1px solid var(--border);">
                        <td style="padding: 1rem; font-weight: 600; color: var(--gray-text); text-align: center;">${index + 1}</td>
                        <td style="padding: 1rem; font-weight: 600; font-size: 1rem;">${student.name}</td>
                        <td style="padding: 1rem; color: var(--gray-text);">${student.matricule}</td>
                        <td style="padding: 1rem; text-align: center; font-weight: 700; color: ${sexColor};">${sexDisplay}</td>
                        <td style="padding: 1rem; color: var(--gray-text);">${formatDate(student.birthDate)}</td>
                        <td style="padding: 1rem; text-align: center; font-weight: 600;">${age} ans</td>
                        <td style="padding: 1rem; color: var(--gray-text); white-space: nowrap;">${student.parentName || noContact}</td>
                        <td style="padding: 1rem; text-align: center;">${student.parentRelation ? '<span style="background:var(--light-bg);padding:0.25rem 0.6rem;border-radius:6px;font-size:0.8rem;font-weight:600;">' + student.parentRelation + '</span>' : noContact}</td>
                        <td style="padding: 1rem; color: var(--gray-text); white-space: nowrap;">${student.parentPhone || noContact}</td>
                        <td style="padding: 1rem; color: var(--gray-text); white-space: nowrap;">${student.parentEmail || noContact}</td>
                        <td style="padding: 1rem; text-align: center;">
                            <button onclick="editStudent(${student.id})" style="background: var(--sky); color: var(--white); border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; margin-right: 0.5rem; margin-bottom: 0.5rem; font-size: 0.875rem;">
                                ✏️ Modifier
                            </button>
                            <button onclick="openDisciplineModal(${student.id})" style="background: var(--ochre); color: var(--white); border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; margin-right: 0.5rem; margin-bottom: 0.5rem; font-size: 0.875rem;">
                                ⚠️ Discipline
                            </button>
                            <button onclick="archiveStudent(${student.id}, 'Diplômé')" style="background: var(--green); color: var(--white); border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; margin-right: 0.5rem; margin-bottom: 0.5rem; font-size: 0.875rem;">
                                🎓 Diplômé
                            </button>
                            <button onclick="archiveStudent(${student.id}, 'Transféré')" style="background: var(--ochre); color: var(--white); border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; margin-right: 0.5rem; margin-bottom: 0.5rem; font-size: 0.875rem;">
                                ↗️ Transféré
                            </button>
                            <button onclick="deleteStudent(${student.id})" style="background: var(--terracotta); color: var(--white); border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                                🗑️ Supprimer
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
        
        // Load Class Students (Legacy - kept for backward compatibility)
        function loadClassStudents() {
            loadStudentsClassData();
        }
        
        // Calculate Age
        function calculateAge(birthDate) {
            if (!birthDate) return 0;
            const birth = new Date(birthDate);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age;
        }
        
        // Load Admin Students (legacy function - now calls loadClassStudents)
        function loadAdminStudents() {
            loadClassStudents();
        }
        
        // Load Admin Teachers
        // ---- Logo Management ----

        function saveLogoConfig() {
            var urlInput = document.getElementById('logo-url-config').value.trim();
            var fileInput = document.getElementById('logo-file-config');

            if (fileInput.files && fileInput.files[0]) {
                // Convert file to data URL
                var reader = new FileReader();
                reader.onload = function(e) {
                    appState.schoolLogo = e.target.result;
                    saveData();
                    loadLogoConfigPreview();
                    applyLogoToWatermarks();
                    showAlert('Logo enregistré avec succès', 'success');
                    // Clear inputs
                    document.getElementById('logo-url-config').value = '';
                    document.getElementById('logo-file-config').value = '';
                };
                reader.readAsDataURL(fileInput.files[0]);
            } else if (urlInput) {
                appState.schoolLogo = urlInput;
                saveData();
                loadLogoConfigPreview();
                applyLogoToWatermarks();
                showAlert('Logo enregistré avec succès', 'success');
                document.getElementById('logo-url-config').value = '';
            } else {
                showAlert('Veuillez entrer une URL ou sélectionner un fichier', 'error');
            }
        }

        function loadLogoConfigPreview() {
            var preview = document.getElementById('logo-preview-config');
            if (appState.schoolLogo) {
                preview.innerHTML = '<img src="' + appState.schoolLogo + '" style="width:100%;height:100%;object-fit:contain;">';
            } else {
                preview.innerHTML = '<span style="color:var(--gray-text);font-size:0.85rem;text-align:center;padding:1rem;">Aucun logo</span>';
            }
        }

        function saveSignatureConfig() {
            var urlInput = document.getElementById('signature-url-config').value.trim();
            var fileInput = document.getElementById('signature-file-config');

            if (fileInput.files && fileInput.files[0]) {
                // Convert file to data URL
                var reader = new FileReader();
                reader.onload = function(e) {
                    appState.economeSignature = e.target.result;
                    saveData();
                    loadSignatureConfigPreview();
                    showAlert('Signature enregistrée avec succès', 'success');
                    // Clear inputs
                    document.getElementById('signature-url-config').value = '';
                    document.getElementById('signature-file-config').value = '';
                };
                reader.readAsDataURL(fileInput.files[0]);
            } else if (urlInput) {
                appState.economeSignature = urlInput;
                saveData();
                loadSignatureConfigPreview();
                showAlert('Signature enregistrée avec succès', 'success');
                document.getElementById('signature-url-config').value = '';
            } else {
                showAlert('Veuillez entrer une URL ou sélectionner un fichier', 'error');
            }
        }

        function loadSignatureConfigPreview() {
            var preview = document.getElementById('signature-preview-config');
            if (appState.economeSignature) {
                preview.innerHTML = '<img src="' + appState.economeSignature + '" style="max-width:100%;max-height:100px;object-fit:contain;">';
            } else {
                preview.innerHTML = '<span style="color:var(--gray-text);font-size:0.85rem;text-align:center;padding:1rem;">Aucune signature</span>';
            }
        }

        // Phase 1: School Information Management
        function saveSchoolInfo() {
            appState.schoolName = document.getElementById('school-name-config').value.trim() || 'École Numérique';
            appState.academicYear = document.getElementById('academic-year-config').value.trim() || '2024-2025';
            appState.schoolAddress = document.getElementById('school-address-config').value.trim();
            appState.schoolPhone = document.getElementById('school-phone-config').value.trim();
            appState.schoolEmail = document.getElementById('school-email-config').value.trim();
            appState.schoolYearStartDate = document.getElementById('school-year-start-config').value || '2024-09-01';
            appState.headmasterName = document.getElementById('headmaster-name-config').value.trim();
            
            saveData();
            showAlert('Informations de l\'école enregistrées avec succès', 'success');
            
            // Update title
            document.title = appState.schoolName + ' - Gestion Scolaire';
        }

        function loadSchoolInfo() {
            document.getElementById('school-name-config').value = appState.schoolName || '';
            document.getElementById('academic-year-config').value = appState.academicYear || '';
            document.getElementById('school-address-config').value = appState.schoolAddress || '';
            document.getElementById('school-phone-config').value = appState.schoolPhone || '';
            document.getElementById('school-email-config').value = appState.schoolEmail || '';
            document.getElementById('school-year-start-config').value = appState.schoolYearStartDate || '';
            document.getElementById('headmaster-name-config').value = appState.headmasterName || '';
        }

        function saveHeadmasterSignature() {
            var urlInput = document.getElementById('headmaster-signature-url-config').value.trim();
            var fileInput = document.getElementById('headmaster-signature-file-config');

            if (fileInput.files && fileInput.files[0]) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    appState.headmasterSignature = e.target.result;
                    saveData();
                    loadHeadmasterSignaturePreview();
                    showAlert('Signature du directeur enregistrée avec succès', 'success');
                    document.getElementById('headmaster-signature-url-config').value = '';
                    document.getElementById('headmaster-signature-file-config').value = '';
                };
                reader.readAsDataURL(fileInput.files[0]);
            } else if (urlInput) {
                appState.headmasterSignature = urlInput;
                saveData();
                loadHeadmasterSignaturePreview();
                showAlert('Signature du directeur enregistrée avec succès', 'success');
                document.getElementById('headmaster-signature-url-config').value = '';
            } else {
                showAlert('Veuillez entrer une URL ou sélectionner un fichier', 'error');
            }
        }

        function loadHeadmasterSignaturePreview() {
            var preview = document.getElementById('headmaster-signature-preview');
            if (appState.headmasterSignature) {
                preview.innerHTML = '<img src="' + appState.headmasterSignature + '" style="max-width:100%;max-height:100px;object-fit:contain;">';
            } else {
                preview.innerHTML = '<span style="color:var(--gray-text);font-size:0.85rem;text-align:center;padding:1rem;">Aucune signature</span>';
            }
        }

        function saveLogoDashboard() {
            // Deprecated - redirect to config version
            saveLogoConfig();
        }

        function saveLogo() {
            // Deprecated - redirect to config version
            saveLogoConfig();
        }

        function loadLogoDashboardPreview() {
            // Deprecated - redirect to config version
            loadLogoConfigPreview();
        }

        function loadLogoPreview() {
            // Deprecated - redirect to config version
            loadLogoConfigPreview();
        }

        function applyLogoToWatermarks() {
            // Apply logo to bulletin watermark
            var bulletinWatermark = document.getElementById('bulletin-watermark');
            var bulletinImg = document.getElementById('bulletin-watermark-img');
            if (appState.schoolLogo) {
                bulletinImg.src = appState.schoolLogo;
                bulletinWatermark.style.display = 'block';
            } else {
                bulletinWatermark.style.display = 'none';
            }

            // Apply logo to receipt watermark
            var receiptWatermark = document.getElementById('receipt-watermark');
            var receiptImg = document.getElementById('receipt-watermark-img');
            if (appState.schoolLogo) {
                receiptImg.src = appState.schoolLogo;
                receiptWatermark.style.display = 'block';
            } else {
                receiptWatermark.style.display = 'none';
            }
        }

        // ---- End Logo Management ----

        function loadAdminTeachers() {
            const tbody = document.getElementById('admin-teachers-body');
            const teachers = appState.users.filter(u => u.role === 'teacher');
            
            if (teachers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" style="padding: 2rem; text-align: center; color: var(--gray-text);">Aucun enseignant trouvé</td></tr>';
            } else {
                tbody.innerHTML = teachers.map(teacher => {
                    const classInfo = appState.classes.find(c => c.id === teacher.classId);
                    const studentCount = teacher.classId ? appState.students.filter(s => s.classId === teacher.classId).length : 0;
                    const sexDisplay = teacher.sex === 'M' ? '♂ M' : teacher.sex === 'F' ? '♀ F' : '-';
                    const sexColor = teacher.sex === 'M' ? 'var(--sky)' : teacher.sex === 'F' ? 'var(--terracotta)' : 'var(--gray-text)';
                    
                    return `
                        <tr style="border-bottom: 1px solid var(--border);">
                            <td style="padding: 1rem; font-weight: 600;">${teacher.fullName}</td>
                            <td style="padding: 1rem; color: var(--gray-text);">${teacher.matricule || '<span style="font-style: italic; opacity: 0.5;">—</span>'}</td>
                            <td style="padding: 1rem; text-align: center; font-weight: 700; color: ${sexColor};">${sexDisplay}</td>
                            <td style="padding: 1rem; color: var(--gray-text); white-space: nowrap;">${teacher.phone || '<span style="font-style: italic; opacity: 0.5;">Non fourni</span>'}</td>
                            <td style="padding: 1rem; color: var(--gray-text); white-space: nowrap;">${teacher.email || '<span style="font-style: italic; opacity: 0.5;">Non fourni</span>'}</td>
                            <td style="padding: 1rem; color: var(--gray-text);">${teacher.username}</td>
                            <td style="padding: 1rem;">
                                ${classInfo 
                                    ? `<span style="background: var(--green); color: var(--white); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600;">${classInfo.name}</span>`
                                    : `<span style="color: var(--terracotta); font-style: italic;">Non assigné</span>`
                                }
                            </td>
                            <td style="padding: 1rem; text-align: center; font-weight: 600;">${studentCount}</td>
                            <td style="padding: 1rem; text-align: center;">
                                <button onclick="editTeacher(${teacher.id})" style="background: var(--sky); color: var(--white); border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; margin-right: 0.5rem; font-size: 0.875rem;">
                                    ✏️ Modifier
                                </button>
                                <button onclick="deleteTeacher(${teacher.id})" style="background: var(--terracotta); color: var(--white); border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                                    🗑️ Supprimer
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
            
            // Check for classes without teachers
            checkUnassignedClasses();
        }
        
        // Check Unassigned Classes
        function checkUnassignedClasses() {
            const warningDiv = document.getElementById('unassigned-classes-warning');
            const listDiv = document.getElementById('unassigned-classes-list');
            
            if (!warningDiv || !listDiv) return;
            
            // Find classes without teachers
            const unassignedClasses = appState.classes.filter(c => {
                const hasTeacher = appState.users.some(u => u.role === 'teacher' && u.classId === c.id);
                return !hasTeacher;
            });
            
            if (unassignedClasses.length > 0) {
                warningDiv.style.display = 'block';
                listDiv.innerHTML = unassignedClasses.map(c => 
                    `• <strong>${c.name}</strong> (${c.level})`
                ).join('<br>');
            } else {
                warningDiv.style.display = 'none';
            }
        }
        
        // Open Student Modal
        function openStudentModal(studentId = null) {
            const modal = document.getElementById('student-modal');
            const title = document.getElementById('student-modal-title');
            
            if (studentId) {
                const student = appState.students.find(s => s.id === studentId);
                if (student) {
                    title.textContent = 'Modifier l\'Élève';
                    document.getElementById('student-id').value = student.id;
                    document.getElementById('student-name').value = student.name;
                    // Show existing matricule as bold, non-italic
                    var matText = document.getElementById('student-matricule-text');
                    matText.textContent = student.matricule;
                    matText.style.fontStyle = 'normal';
                    matText.style.fontWeight = '700';
                    matText.style.color = 'var(--dark-text)';
                    document.getElementById('student-sex').value = student.sex || '';
                    document.getElementById('student-birthdate').value = student.birthDate;
                    document.getElementById('student-parent-name').value = student.parentName || '';
                    document.getElementById('student-parent-relation').value = student.parentRelation || '';
                    document.getElementById('student-parent-phone').value = student.parentPhone || '';
                    document.getElementById('student-parent-email').value = student.parentEmail || '';
                    const classInfo = appState.classes.find(c => c.id === student.classId);
                    document.getElementById('student-class').value = classInfo ? classInfo.level : '';
                    loadStudentHealthRecord(student.id); // Phase 4: Load health records
                }
            } else {
                title.textContent = 'Enregistrer un Élève';
                document.getElementById('student-form').reset();
                document.getElementById('student-id').value = '';
                // Reset matricule display to placeholder
                var matText = document.getElementById('student-matricule-text');
                matText.textContent = 'Génération automatique lors de l\'enregistrement';
                matText.style.fontStyle = 'italic';
                matText.style.fontWeight = '400';
                matText.style.color = 'var(--gray-text)';
                loadStudentHealthRecord(null); // Phase 4: Clear health fields
            }
            
            modal.classList.add('active');
        }
        
        // Close Student Modal
        function closeStudentModal() {
            document.getElementById('student-modal').classList.remove('active');
            document.getElementById('student-form').reset();
        }
        
        // Generate next matricule: finds the highest STUxxx number across all students, returns STU + (max+1) zero-padded to 3 digits
        function generateMatricule() {
            var year = new Date().getFullYear();
            var max = 0;
            appState.students.forEach(function(s) {
                // Match new format: YearELEVECount (e.g., 2025ELEVE001)
                var m = s.matricule && s.matricule.match(/^\d{4}ELEVE(\d+)$/);
                if (m) {
                    var num = parseInt(m[1], 10);
                    if (num > max) max = num;
                }
            });
            var next = max + 1;
            return year + 'ELEVE' + String(next).padStart(3, '0');
        }

        function generateTeacherMatricule() {
            var year = new Date().getFullYear();
            var max = 0;
            appState.users.forEach(function(u) {
                if (u.role !== 'teacher' || !u.matricule) return;
                // Match new format: YearENSCount (e.g., 2025ENS001)
                var m = u.matricule.match(/^\d{4}ENS(\d+)$/);
                if (m) {
                    var num = parseInt(m[1], 10);
                    if (num > max) max = num;
                }
            });
            var next = max + 1;
            return year + 'ENS' + String(next).padStart(3, '0');
        }

        // Save Student
        function saveStudent(event) {
            event.preventDefault();
            
            const id = document.getElementById('student-id').value;
            const name = document.getElementById('student-name').value;
            const sex = document.getElementById('student-sex').value;
            const birthDate = document.getElementById('student-birthdate').value;
            const parentName = document.getElementById('student-parent-name').value;
            const parentRelation = document.getElementById('student-parent-relation').value;
            const parentPhone = document.getElementById('student-parent-phone').value;
            const parentEmail = document.getElementById('student-parent-email').value;
            const classLevel = document.getElementById('student-class').value;
            
            // Find or create class for this level
            let classInfo = appState.classes.find(c => c.level === classLevel);
            if (!classInfo) {
                // Create new class if doesn't exist
                const newClassId = Math.max(...appState.classes.map(c => c.id), 0) + 1;
                classInfo = {
                    id: newClassId,
                    name: `${classLevel} A`,
                    level: classLevel,
                    teacher: 'Non assigné'
                };
                appState.classes.push(classInfo);
            }
            
            if (id) {
                // Update existing student — keep original matricule
                const student = appState.students.find(s => s.id === parseInt(id));
                student.name = name;
                student.sex = sex;
                student.birthDate = birthDate;
                student.parentName = parentName;
                student.parentRelation = parentRelation;
                student.parentPhone = parentPhone;
                student.parentEmail = parentEmail;
                student.classId = classInfo.id;
                student.lastUpdated = new Date().toISOString();
                saveStudentHealthRecord(parseInt(id)); // Phase 4: Save health records
                showAlert(`Élève ${name} modifié avec succès!`, 'success');
            } else {
                // New student — generate matricule automatically
                const matricule = generateMatricule();
                const newId = Math.max(...appState.students.map(s => s.id), 0) + 1;
                appState.students.push({
                    id: newId,
                    name,
                    matricule,
                    sex,
                    birthDate,
                    parentName,
                    parentRelation,
                    parentPhone,
                    parentEmail,
                    classId: classInfo.id,
                    averages: { trimester1: 0, trimester2: 0, trimester3: 0 },
                    lastUpdated: new Date().toISOString()
                });
                saveStudentHealthRecord(newId); // Phase 4: Save health records
                
                // Auto-create student user account
                // Username: matricule, Password: first 6 chars of matricule
                const defaultPassword = matricule.substring(0, 6);
                appState.users.push({
                    id: Date.now() + newId,
                    username: matricule,
                    password: defaultPassword,
                    role: 'student',
                    fullName: name,
                    studentId: newId
                });
                
                showAlert(`Élève ${name} enregistré avec succès! Matricule : ${matricule}\nCompte créé - Identifiant: ${matricule} / Mot de passe: ${defaultPassword}`, 'success');
            }
            
            saveData();
            populateClassSelector();
            loadClassStudents();
            closeStudentModal();
        }
        
        // Edit Student
        function editStudent(id) {
            openStudentModal(id);
        }
        
        // Delete Student
        function deleteStudent(id) {
            const student = appState.students.find(s => s.id === id);
            if (confirm(`Êtes-vous sûr de vouloir supprimer ${student.name}?`)) {
                appState.students = appState.students.filter(s => s.id !== id);
                saveData();
                loadClassStudents();
                showAlert('Élève supprimé avec succès!', 'success');
            }
        }
        
        // Open Teacher Modal
        function openTeacherModal(teacherId = null) {
            const modal = document.getElementById('teacher-modal');
            const title = document.getElementById('teacher-modal-title');
            
            // Populate class dropdown
            const classSelect = document.getElementById('teacher-classid');
            classSelect.innerHTML = '<option value="">Aucune classe assignée</option>' +
                appState.classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            
            if (teacherId) {
                const teacher = appState.users.find(u => u.id === teacherId);
                if (teacher) {
                    title.textContent = 'Modifier l\'Enseignant';
                    document.getElementById('teacher-id').value = teacher.id;
                    document.getElementById('teacher-fullname').value = teacher.fullName;
                    // Show existing matricule bold
                    var tMatText = document.getElementById('teacher-matricule-text');
                    tMatText.textContent = teacher.matricule || '—';
                    tMatText.style.fontStyle = 'normal';
                    tMatText.style.fontWeight = '700';
                    tMatText.style.color = 'var(--dark-text)';
                    document.getElementById('teacher-sex').value = teacher.sex || '';
                    document.getElementById('teacher-phone').value = teacher.phone || '';
                    document.getElementById('teacher-email').value = teacher.email || '';
                    document.getElementById('teacher-username').value = teacher.username;
                    document.getElementById('teacher-password').value = teacher.password;
                    document.getElementById('teacher-classid').value = teacher.classId || '';
                }
            } else {
                title.textContent = 'Ajouter un Enseignant';
                document.getElementById('teacher-form').reset();
                document.getElementById('teacher-id').value = '';
                // Reset matricule display to placeholder
                var tMatText = document.getElementById('teacher-matricule-text');
                tMatText.textContent = 'Génération automatique lors de l\'enregistrement';
                tMatText.style.fontStyle = 'italic';
                tMatText.style.fontWeight = '400';
                tMatText.style.color = 'var(--gray-text)';
            }
            
            modal.classList.add('active');
        }
        
        // Close Teacher Modal
        function closeTeacherModal() {
            document.getElementById('teacher-modal').classList.remove('active');
            document.getElementById('teacher-form').reset();
        }
        
        // Generate next teacher matricule: finds highest ENSxxx across all teacher users, returns ENS + (max+1) zero-padded to 3 digits
        function generateTeacherMatricule() {
            var max = 0;
            appState.users.forEach(function(u) {
                if (u.role !== 'teacher') return;
                var m = u.matricule && u.matricule.match(/^ENS(\d+)$/);
                if (m) {
                    var num = parseInt(m[1], 10);
                    if (num > max) max = num;
                }
            });
            var next = max + 1;
            return 'ENS' + String(next).padStart(3, '0');
        }

        // Save Teacher
        function saveTeacher(event) {
            event.preventDefault();
            
            const id = document.getElementById('teacher-id').value;
            const fullName = document.getElementById('teacher-fullname').value;
            const sex = document.getElementById('teacher-sex').value;
            const phone = document.getElementById('teacher-phone').value;
            const email = document.getElementById('teacher-email').value;
            const username = document.getElementById('teacher-username').value;
            const password = document.getElementById('teacher-password').value;
            const classId = document.getElementById('teacher-classid').value;
            
            if (id) {
                // Update existing teacher — keep original matricule
                const teacher = appState.users.find(u => u.id === parseInt(id));
                const oldClassId = teacher.classId;
                
                // Clear old class assignment
                if (oldClassId && oldClassId !== parseInt(classId)) {
                    const oldClass = appState.classes.find(c => c.id === oldClassId);
                    if (oldClass) oldClass.teacher = 'Non assigné';
                }
                
                teacher.fullName = fullName;
                teacher.sex = sex;
                teacher.phone = phone;
                teacher.email = email;
                teacher.username = username;
                teacher.password = password;
                teacher.classId = classId ? parseInt(classId) : null;
                
                // Update new class teacher name
                if (classId) {
                    const classInfo = appState.classes.find(c => c.id === parseInt(classId));
                    if (classInfo) {
                        appState.users.forEach(u => {
                            if (u.role === 'teacher' && u.id !== parseInt(id) && u.classId === parseInt(classId)) {
                                u.classId = null;
                            }
                        });
                        classInfo.teacher = fullName;
                    }
                }
                
                showAlert(`Enseignant ${fullName} modifié avec succès!`, 'success');
            } else {
                // New teacher — generate matricule automatically
                const matricule = generateTeacherMatricule();
                const newId = Math.max(...appState.users.map(u => u.id), 0) + 1;
                appState.users.push({
                    id: newId,
                    username,
                    password,
                    role: 'teacher',
                    fullName,
                    matricule,
                    sex,
                    phone,
                    email,
                    classId: classId ? parseInt(classId) : null
                });
                
                // Update class teacher name and clear from other teachers
                if (classId) {
                    const classInfo = appState.classes.find(c => c.id === parseInt(classId));
                    if (classInfo) {
                        appState.users.forEach(u => {
                            if (u.role === 'teacher' && u.id !== newId && u.classId === parseInt(classId)) {
                                u.classId = null;
                            }
                        });
                        classInfo.teacher = fullName;
                    }
                }
                
                showAlert(`Enseignant ${fullName} ajouté avec succès! Matricule : ${matricule}`, 'success');
            }
            
            saveData();
            loadAdminTeachers();
            loadClassStudents();
            closeTeacherModal();
        }
        
        // Edit Teacher
        function editTeacher(id) {
            openTeacherModal(id);
        }
        
        // Delete Teacher
        function deleteTeacher(id) {
            const teacher = appState.users.find(u => u.id === id);
            if (confirm(`Êtes-vous sûr de vouloir supprimer ${teacher.fullName}?`)) {
                // Update class if this teacher was assigned
                if (teacher.classId) {
                    const classInfo = appState.classes.find(c => c.id === teacher.classId);
                    if (classInfo) classInfo.teacher = 'Non assigné';
                }
                
                appState.users = appState.users.filter(u => u.id !== id);
                saveData();
                loadAdminTeachers();
                loadClassStudents(); // Refresh student view to show updated teacher
                showAlert('Enseignant supprimé avec succès!', 'success');
            }
        }
        

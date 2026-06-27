// ============================================================
// js/01-state.js — Application State, localStorage, trimestre helpers
// Lines 2941-3091 of original Ecole-Main-System.html
// ============================================================

        // Application State
        const appState = {
            currentUser: null,
            users: [
                { id: 1, username: 'admin', password: 'admin123', role: 'admin', fullName: 'Administrateur Système' },
                { id: 2, username: 'teacher1', password: 'teach123', role: 'teacher', matricule: '2025ENS001', sex: 'M', fullName: 'M. Konaté Abdoulaye', phone: '+226 40 12 34 56', email: 'konate@ecole.bf', classId: 1 },
                { id: 3, username: 'parent', password: 'parent123', role: 'parent', fullName: 'Ouédraogo Seydou', childrenIds: [1, 3] },
                { id: 9, username: 'econome', password: 'econ123', role: 'econome', fullName: 'Économe Scolaire', matricule: 'ECO001' },
                { id: 4, username: 'teacher2', password: 'teach234', role: 'teacher', matricule: '2025ENS002', sex: 'F', fullName: 'Mme Traoré Fatoumata', phone: '+226 40 23 45 67', email: 'traore@ecole.bf', classId: 2 },
                { id: 5, username: 'teacher3', password: 'teach345', role: 'teacher', matricule: '2025ENS003', sex: 'M', fullName: 'M. Sawadogo Ibrahim', phone: '+226 40 34 56 78', email: 'sawadogo@ecole.bf', classId: 3 },
                { id: 6, username: 'teacher4', password: 'teach456', role: 'teacher', matricule: '2025ENS004', sex: 'F', fullName: 'Mme Zongo Mariama', phone: '+226 40 45 67 89', email: 'zongo@ecole.bf', classId: 4 },
                { id: 7, username: 'teacher5', password: 'teach567', role: 'teacher', matricule: '2025ENS005', sex: 'M', fullName: 'M. Ouattara Seydou', phone: '+226 40 56 78 90', email: 'ouattara@ecole.bf', classId: 5 },
                { id: 8, username: 'teacher6', password: 'teach678', role: 'teacher', matricule: '2025ENS006', sex: 'F', fullName: 'Mme Compaoré Aïcha', phone: '+226 40 67 89 01', email: 'compaore@ecole.bf', classId: 6 }
            ],
            classes: [
                { id: 1, name: 'CM1 A', level: 'CM1', teacher: 'M. Konaté Abdoulaye' },
                { id: 2, name: 'CM2 B', level: 'CM2', teacher: 'Mme Traoré Fatoumata' },
                { id: 3, name: 'CE2 A', level: 'CE2', teacher: 'M. Sawadogo Ibrahim' },
                { id: 4, name: 'CE1 A', level: 'CE1', teacher: 'Mme Zongo Mariama' },
                { id: 5, name: 'CP2 A', level: 'CP2', teacher: 'M. Ouattara Seydou' },
                { id: 6, name: 'CP1 A', level: 'CP1', teacher: 'Mme Compaoré Aïcha' }
            ],
            students: [
                { id: 1, name: 'Ouédraogo Aminata', matricule: '2025ELEVE001', sex: 'F', classId: 1, birthDate: '2012-03-15', averages: { trimester1: 15.2, trimester2: 15.8, trimester3: 16.1 } },
                { id: 2, name: 'Compaoré Ibrahim', matricule: '2025ELEVE002', sex: 'M', classId: 1, birthDate: '2012-05-22', averages: { trimester1: 13.5, trimester2: 14.2, trimester3: 14.8 } },
                { id: 3, name: 'Ouédraogo Fatoumata', matricule: '2025ELEVE003', sex: 'F', classId: 1, birthDate: '2012-08-10', averages: { trimester1: 14.8, trimester2: 15.3, trimester3: 15.7 } },
                { id: 4, name: 'Kaboré Moussa', matricule: '2025ELEVE004', sex: 'M', classId: 1, birthDate: '2012-11-05', averages: { trimester1: 12.9, trimester2: 13.4, trimester3: 13.9 } },
                { id: 5, name: 'Traoré Aïcha', matricule: '2025ELEVE005', sex: 'F', classId: 1, birthDate: '2012-02-28', averages: { trimester1: 16.3, trimester2: 16.7, trimester3: 17.1 } },
                { id: 6, name: 'Zongo Boureima', matricule: '2025ELEVE006', sex: 'M', classId: 1, birthDate: '2012-07-14', averages: { trimester1: 11.8, trimester2: 12.3, trimester3: 12.7 } },
                { id: 7, name: 'Ouattara Salimata', matricule: '2025ELEVE007', sex: 'F', classId: 1, birthDate: '2012-09-20', averages: { trimester1: 14.1, trimester2: 14.6, trimester3: 15.0 } },
                { id: 8, name: 'Diallo Amadou', matricule: '2025ELEVE008', sex: 'M', classId: 1, birthDate: '2012-04-17', averages: { trimester1: 13.2, trimester2: 13.8, trimester3: 14.3 } },
                { id: 9, name: 'Sankara Mariam', matricule: '2025ELEVE009', sex: 'F', classId: 2, birthDate: '2011-06-11', averages: { trimester1: 15.7, trimester2: 16.2, trimester3: 16.5 } },
                { id: 10, name: 'Yameogo Seydou', matricule: '2025ELEVE010', sex: 'M', classId: 2, birthDate: '2011-10-30', averages: { trimester1: 14.4, trimester2: 14.9, trimester3: 15.3 } }
            ],
            grades: {},
            cepResults: {},
            absences: [],
            schedule: {},
            payments: [],
            classFees: {},  // { classId: feeAmount }
            schoolLogo: '',  // URL or data URL for school logo
            economeSignature: '',  // URL or data URL for econome signature
            archivedStudents: [],  // All archived students (graduated, transferred, inactive)
            schoolYearStartDate: '2024-09-01',  // School year start date (YYYY-MM-DD)
            // Phase 1: Core Customization & Management
            schoolName: 'École Numérique',  // Customizable school name
            academicYear: '2024-2025',  // Current academic year
            schoolAddress: '',  // School physical address
            schoolPhone: '',  // School contact phone
            schoolEmail: '',  // School email
            headmasterName: '',  // Headmaster/Principal name
            headmasterSignature: '',  // Headmaster signature image URL
            subjects: [  // Manageable subjects with coefficients
                { id: 1, name: 'Français', coefficient: 3, levels: ['CP1','CP2','CE1','CE2','CM1','CM2'] },
                { id: 2, name: 'Mathématiques', coefficient: 3, levels: ['CP1','CP2','CE1','CE2','CM1','CM2'] },
                { id: 3, name: 'Sciences', coefficient: 2, levels: ['CE1','CE2','CM1','CM2'] },
                { id: 4, name: 'Histoire-Géo', coefficient: 2, levels: ['CE2','CM1','CM2'] },
                { id: 5, name: 'Anglais', coefficient: 1, levels: ['CM1','CM2'] },
                { id: 6, name: 'EPS', coefficient: 1, levels: ['CP1','CP2','CE1','CE2','CM1','CM2'] }
            ],
            paymentPlans: {},  // { classId: { type: 'monthly'|'trimester'|'annual', amount, dueDate } }
            feeExemptions: {},  // { studentId: { reason, percentage, approvedBy, date } }
            detailedGrades: {},  // { studentId: { subjectId: [{ test: 'Devoir1', grade, date, trimester }] } }
            // Phase 3: Communication & Enhanced Tracking
            messages: [],  // { id, from, to, subject, message, date, read }
            announcements: [],  // { id, title, content, date, author, targetRole }
            teacherAssignments: {},  // { teacherId: [{ classId, subjectId }] }
            disciplineRecords: [],  // { id, studentId, type, description, date, recordedBy, severity }
            meritPoints: {},  // { studentId: points }
            testScores: {},  // { studentId: { subjectId: { trimester: [{ name, score, maxScore, date, type }] } } }
            // Phase 4: Final Enhancements & Security
            homework: [],  // { id, classId, subjectId, title, description, dueDate, assignedBy, assignedDate, attachments }
            homeworkSubmissions: {},  // { homeworkId: { studentId: { submitted, submissionDate, grade, feedback } } }
            teacherLeaveRequests: [],  // { id, teacherId, startDate, endDate, reason, status, substituteId }
            studentHealthRecords: {},  // { studentId: { allergies, medications, conditions, emergencyContact, bloodType, vaccinations } }
            activityLogs: [],  // { id, userId, action, details, timestamp }
            passwordResetTokens: {}  // { userId: { token, expiry } }
        };
        
        // Save data to localStorage
        function saveData() {
            localStorage.setItem('ecoleData', JSON.stringify(appState));
        }
        
        // Load data from localStorage
        function loadData() {
            const saved = localStorage.getItem('ecoleData');
            if (saved) {
                const data = JSON.parse(saved);
                // Merge saved data but keep current user session
                appState.users = data.users || appState.users;
                appState.classes = data.classes || appState.classes;
                appState.students = data.students || appState.students;
                appState.grades = data.grades || {};
                appState.cepResults = data.cepResults || {};
                appState.absences = data.absences || [];
                appState.schedule = data.schedule || {};
                appState.payments = data.payments || [];
                appState.classFees = data.classFees || {};
                appState.schoolLogo = data.schoolLogo || '';
                appState.economeSignature = data.economeSignature || '';
                appState.archivedStudents = data.archivedStudents || data.graduatedStudents || [];  // Backward compatibility
                appState.schoolYearStartDate = data.schoolYearStartDate || '2024-09-01';
                // Phase 1: Core Customization
                appState.schoolName = data.schoolName || 'École Numérique';
                appState.academicYear = data.academicYear || '2024-2025';
                appState.schoolAddress = data.schoolAddress || '';
                appState.schoolPhone = data.schoolPhone || '';
                appState.schoolEmail = data.schoolEmail || '';
                appState.headmasterName = data.headmasterName || '';
                appState.headmasterSignature = data.headmasterSignature || '';
                appState.subjects = data.subjects || appState.subjects;
                appState.paymentPlans = data.paymentPlans || {};
                appState.feeExemptions = data.feeExemptions || {};
                appState.detailedGrades = data.detailedGrades || {};
                // Phase 3: Communication & Enhanced Tracking
                appState.messages = data.messages || [];
                appState.announcements = data.announcements || [];
                appState.teacherAssignments = data.teacherAssignments || {};
                appState.disciplineRecords = data.disciplineRecords || [];
                appState.meritPoints = data.meritPoints || {};
                appState.testScores = data.testScores || {};
                // Phase 4: Final Enhancements
                appState.homework = data.homework || [];
                appState.homeworkSubmissions = data.homeworkSubmissions || {};
                appState.teacherLeaveRequests = data.teacherLeaveRequests || [];
                appState.studentHealthRecords = data.studentHealthRecords || {};
                appState.activityLogs = data.activityLogs || [];
                appState.passwordResetTokens = data.passwordResetTokens || {};
            }
        }
        

        // ---- Trimestre helpers (Burkina academic calendar) ----
        // T1: 1 Oct – 31 Dec | T2: 1 Jan – 31 Mar | T3: 1 Apr – 30 Jun
        // Returns { key, label, min, max } or null if outside all trimesters
        function getTrimestre(date) {
            var d = (date instanceof Date) ? date : new Date(date + 'T00:00:00');
            var m = d.getMonth() + 1; // 1-12
            var y = d.getFullYear();
            if (m >= 10 && m <= 12) return { key:'trimester1', label:'1er Trimestre', min: y+'-10-01', max: y+'-12-31' };
            if (m >= 1  && m <= 3)  return { key:'trimester2', label:'2e Trimestre',  min: y+'-01-01', max: y+'-03-31' };
            if (m >= 4  && m <= 6)  return { key:'trimester3', label:'3e Trimestre',  min: y+'-04-01', max: y+'-06-30' };
            return null; // Jul–Sep: inter-trimestre / vacances
        }

        function getCurrentTrimestre() {
            return getTrimestre(new Date());
        }
        // ---- End trimestre helpers ----


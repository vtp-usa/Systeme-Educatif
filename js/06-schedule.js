// ============================================================
// js/06-schedule.js — Emploi du temps (admin editable, teacher/student read-only)
// Lines 5629-5802 of original Ecole-Main-System.html
// ============================================================

        // ---- Schedule (Emploi du Temps) functions ----

        var SCHED_DAYS    = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi'];
        var SCHED_SLOTS   = ['07h30–08h30','08h30–09h30','09h30–10h30','10h30–11h30','11h30–12h30','14h30–15h30','15h30–16h30','16h30–17h30'];
        var SCHED_SUBJECTS = ['Mathématiques','Français','Sciences','Histoire','Géographie','Anglais','Éducation Physique','Arts'];
        // Colour palette per matière (background, text)
        var SCHED_COLORS  = {
            'Mathématiques':       { bg:'#DCEFFE', txt:'#1A5276' },
            'Français':            { bg:'#D5F5E3', txt:'#1E8449' },
            'Sciences':            { bg:'#F9E79F', txt:'#B7950B' },
            'Histoire':            { bg:'#FADBD8', txt:'#C0392B' },
            'Géographie':          { bg:'#E8DAEF', txt:'#7D3C98' },
            'Anglais':             { bg:'#D6EAF8', txt:'#2471A3' },
            'Éducation Physique':  { bg:'#FDEBD0', txt:'#D35400' },
            'Arts':                { bg:'#F2F3F4', txt:'#566573' }
        };

        // Admin: populate class dropdown then load the grid for the first class
        function initScheduleAdmin() {
            document.getElementById('schedule-admin-view').style.display  = 'block';
            document.getElementById('schedule-teacher-view').style.display = 'none';

            var sel = document.getElementById('schedule-class-select');
            var levelOrder = ['CP1','CP2','CE1','CE2','CM1','CM2'];
            var sorted = appState.classes.slice().sort(function(a,b) {
                return levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
            });
            sel.innerHTML = sorted.map(function(c) {
                return '<option value="' + c.id + '">' + c.name + '</option>';
            }).join('');
            if (sorted.length > 0) sel.value = sorted[0].id;
            loadScheduleAdmin();
        }

        // Admin: build the editable grid for the currently selected class
        function loadScheduleAdmin() {
            var classId  = parseInt(document.getElementById('schedule-class-select').value);
            var table    = document.getElementById('schedule-admin-table');
            var saved    = appState.schedule[classId] || {};

            // Gather only the teacher assigned to the selected class
            var teachers = appState.users.filter(function(u) { return u.role === 'teacher' && u.classId === classId; });
            teachers.sort(function(a,b) { return a.fullName.localeCompare(b.fullName); });
            var teacherOpts = '<option value="">—</option>' +
                teachers.map(function(t) { return '<option value="' + t.id + '">' + t.fullName + '</option>'; }).join('');
            var matiereOpts = '<option value="">—</option>' +
                SCHED_SUBJECTS.map(function(m) { return '<option value="' + m + '">' + m + '</option>'; }).join('');

            // ── THEAD ──
            var head = '<thead><tr style="background:linear-gradient(135deg,var(--earth) 0%,var(--savanna) 100%);color:#fff;">' +
                '<th style="padding:0.75rem 0.6rem;text-align:left;border-radius:8px 0 0 0;width:110px;">Horaire</th>';
            SCHED_DAYS.forEach(function(d, di) {
                head += '<th style="padding:0.75rem 0.6rem;text-align:center;border-left:1px solid rgba(255,255,255,0.25);' + (di === SCHED_DAYS.length-1 ? 'border-radius:0 8px 0 0;' : '') + '">' + d + '</th>';
            });
            head += '</tr></thead>';

            // ── TBODY ──
            var body = '<tbody>';
            SCHED_SLOTS.forEach(function(slot, si) {
                // visual separator before afternoon block
                var borderTop = (si === 5) ? 'border-top:3px solid var(--border);' : '';
                body += '<tr style="border-bottom:1px solid var(--border);" data-slot="' + slot + '">' +
                    '<td style="padding:0.55rem 0.6rem;font-weight:600;font-size:0.88rem;color:var(--earth);white-space:nowrap;' + borderTop + '">' + slot + '</td>';

                SCHED_DAYS.forEach(function(day) {
                    var key     = day + '|' + slot;
                    var cell    = saved[key] || {};
                    var tVal    = cell.teacherId ? cell.teacherId.toString() : '';
                    var mVal    = cell.matiere  || '';
                    body +=
                        '<td style="padding:0.35rem 0.4rem;border-left:1px solid var(--border);' + borderTop + '" data-key="' + key + '">' +
                        '<select class="sched-teacher" data-key="' + key + '" style="width:100%;padding:0.32rem 0.3rem;font-size:0.8rem;border:1px solid var(--border);border-radius:5px;background:#fff;margin-bottom:0.2rem;">' + teacherOpts + '</select>' +
                        '<select class="sched-matiere" data-key="' + key + '" style="width:100%;padding:0.32rem 0.3rem;font-size:0.8rem;border:1px solid var(--border);border-radius:5px;background:#fff;">' + matiereOpts + '</select>' +
                        '</td>';
                });
                body += '</tr>';
            });
            body += '</tbody>';

            table.innerHTML = head + body;

            // Re-apply saved values (after DOM exists)
            Object.keys(saved).forEach(function(key) {
                var cell = saved[key];
                var tSel = table.querySelector('.sched-teacher[data-key="' + key + '"]');
                var mSel = table.querySelector('.sched-matiere[data-key="' + key + '"]');
                if (tSel && cell.teacherId) tSel.value = cell.teacherId.toString();
                if (mSel && cell.matiere)    mSel.value = cell.matiere;
            });
        }

        // Admin: persist the current grid to appState + localStorage
        function saveSchedule() {
            var classId = parseInt(document.getElementById('schedule-class-select').value);
            var table   = document.getElementById('schedule-admin-table');
            var data    = {};

            table.querySelectorAll('.sched-teacher').forEach(function(sel) {
                var key     = sel.getAttribute('data-key');
                var tId     = sel.value;
                var mSel    = table.querySelector('.sched-matiere[data-key="' + key + '"]');
                var mVal    = mSel ? mSel.value : '';
                if (tId || mVal) {
                    data[key] = { teacherId: tId ? parseInt(tId) : null, matiere: mVal || null };
                }
            });

            appState.schedule[classId] = data;
            saveData();
            showAlert('Emploi du temps sauvegardé avec succès', 'success');
        }

        // Teacher: read-only grid for their own class
        function loadScheduleTeacher() {
            document.getElementById('schedule-admin-view').style.display  = 'none';
            document.getElementById('schedule-teacher-view').style.display = 'block';

            var classId = appState.currentUser.classId;
            var classInfo = appState.classes.find(function(c) { return c.id === classId; });
            document.getElementById('schedule-teacher-heading').textContent =
                'Mon Emploi du Temps' + (classInfo ? ' — ' + classInfo.name : '');

            var saved  = appState.schedule[classId] || {};
            var table  = document.getElementById('schedule-teacher-table');
            var usedMatieres = {};   // track which matières appear → for legend

            // ── THEAD ──
            var head = '<thead><tr style="background:linear-gradient(135deg,var(--earth) 0%,var(--savanna) 100%);color:#fff;">' +
                '<th style="padding:0.75rem 0.7rem;text-align:left;border-radius:8px 0 0 0;width:110px;">Horaire</th>';
            SCHED_DAYS.forEach(function(d, di) {
                head += '<th style="padding:0.75rem 0.7rem;text-align:center;border-left:1px solid rgba(255,255,255,0.25);' + (di === SCHED_DAYS.length-1 ? 'border-radius:0 8px 0 0;' : '') + '">' + d + '</th>';
            });
            head += '</tr></thead>';

            // ── TBODY ──
            var body = '<tbody>';
            SCHED_SLOTS.forEach(function(slot, si) {
                var borderTop = (si === 5) ? 'border-top:3px solid var(--border);' : '';
                body += '<tr style="border-bottom:1px solid var(--border);">' +
                    '<td style="padding:0.6rem 0.7rem;font-weight:600;font-size:0.88rem;color:var(--earth);white-space:nowrap;' + borderTop + '">' + slot + '</td>';

                SCHED_DAYS.forEach(function(day) {
                    var key  = day + '|' + slot;
                    var cell = saved[key];
                    var borderLeft = 'border-left:1px solid var(--border);';

                    if (cell && cell.matiere) {
                        var col = SCHED_COLORS[cell.matiere] || { bg:'#eee', txt:'#333' };
                        usedMatieres[cell.matiere] = col;
                        body +=
                            '<td style="' + borderLeft + borderTop + 'padding:0.5rem 0.55rem;">' +
                            '<div style="background:' + col.bg + ';color:' + col.txt + ';border-radius:7px;padding:0.45rem 0.55rem;text-align:center;font-weight:600;font-size:0.82rem;min-height:2rem;display:flex;align-items:center;justify-content:center;">' +
                                cell.matiere +
                            '</div></td>';
                    } else {
                        // empty cell
                        body += '<td style="' + borderLeft + borderTop + 'padding:0.5rem 0.55rem;"></td>';
                    }
                });
                body += '</tr>';
            });
            body += '</tbody>';
            table.innerHTML = head + body;

            // ── LÉGENDE ──
            var legend = document.getElementById('schedule-legend');
            legend.innerHTML = Object.keys(usedMatieres).map(function(m) {
                var col = usedMatieres[m];
                return '<div style="display:flex;align-items:center;gap:0.4rem;">' +
                    '<span style="display:inline-block;width:16px;height:16px;border-radius:4px;background:' + col.bg + ';border:1px solid ' + col.txt + ';"></span>' +
                    '<span style="font-size:0.82rem;color:var(--dark-text);">' + m + '</span></div>';
            }).join('');
        }


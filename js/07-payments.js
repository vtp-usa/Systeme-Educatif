// ============================================================
// js/07-payments.js — Fees, payment records, receipts, parent payment view, parent profile
// Lines 5803-6172 of original Ecole-Main-System.html
// ============================================================

        // ---- Payments functions ----

        // Econome: load form + all payments list
        function loadPaymentsEconome() {
            document.getElementById('payments-econome-view').style.display  = 'block';
            document.getElementById('payments-parent-view').style.display = 'none';

            var students = appState.students.slice().sort(function(a,b) { return a.name.localeCompare(b.name); });
            var studentOpts = '<option value="">— Sélectionner un élève —</option>' +
                students.map(function(s) { return '<option value="' + s.id + '">' + s.name + ' (' + s.matricule + ')</option>'; }).join('');

            // Populate class selector for fee configuration
            var levelOrder = ['CP1','CP2','CE1','CE2','CM1','CM2'];
            var sorted = appState.classes.slice().sort(function(a,b) {
                return levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
            });
            var classSel = document.getElementById('fee-class-select');
            classSel.innerHTML = '<option value="">— Choisir une classe —</option>' +
                sorted.map(function(c) { return '<option value="' + c.id + '">' + c.name + '</option>'; }).join('');
            
            classSel.onchange = function() {
                var cid = parseInt(this.value);
                var display = document.getElementById('fee-current-display');
                if (!cid) { display.style.display = 'none'; return; }
                var current = appState.classFees[cid] || 0;
                document.getElementById('fee-current-value').textContent = current.toLocaleString('fr-FR') + ' FCFA';
                document.getElementById('fee-amount').value = current;
                display.style.display = 'block';
            };

            // Populate payment student dropdown
            document.getElementById('payment-student-select').innerHTML = studentOpts;
            document.getElementById('payment-date').valueAsDate = new Date();

            // Render all payments table with Total Paid and Remaining columns
            var tbody = document.getElementById('payments-econome-tbody');
            var list = appState.payments.slice().sort(function(a,b) { return b.date.localeCompare(a.date); });

            if (list.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" style="padding:2rem;text-align:center;color:var(--gray-text);">Aucun paiement enregistré</td></tr>';
                return;
            }

            tbody.innerHTML = list.map(function(p, i) {
                var student = appState.students.find(function(s) { return s.id === p.studentId; });
                var name = student ? student.name : '—';
                var mat  = student ? student.matricule : '—';
                var d    = new Date(p.date + 'T00:00:00');
                var dateStr = d.toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });

                // Compute total paid for this student
                var totalPaid = appState.payments
                    .filter(function(pay) { return pay.studentId === p.studentId; })
                    .reduce(function(sum, pay) { return sum + pay.amount; }, 0);

                // Get fee from student's class
                var fee = student ? (appState.classFees[student.classId] || 0) : 0;
                var remaining = fee - totalPaid;
                var remainingColor = remaining <= 0 ? 'var(--green)' : remaining < fee*0.5 ? 'var(--ochre)' : 'var(--terracotta)';
                var remainingText = fee === 0 ? '—' : remaining.toLocaleString('fr-FR') + ' FCFA';

                return '<tr style="border-bottom:1px solid var(--border);">' +
                    '<td style="padding:0.7rem 1rem;color:var(--gray-text);font-weight:600;">' + (i+1) + '</td>' +
                    '<td style="padding:0.7rem 1rem;font-weight:600;">' + name + '</td>' +
                    '<td style="padding:0.7rem 1rem;color:var(--gray-text);">' + mat + '</td>' +
                    '<td style="padding:0.7rem 1rem;text-align:right;font-weight:700;color:var(--green);">' + p.amount.toLocaleString('fr-FR') + '</td>' +
                    '<td style="padding:0.7rem 1rem;text-align:right;font-weight:700;color:var(--sky);">' + totalPaid.toLocaleString('fr-FR') + '</td>' +
                    '<td style="padding:0.7rem 1rem;text-align:right;font-weight:700;color:' + remainingColor + ';">' + remainingText + '</td>' +
                    '<td style="padding:0.7rem 1rem;">' + dateStr + '</td>' +
                    '<td style="padding:0.7rem 1rem;text-align:center;"><span style="background:var(--light-bg);padding:0.25rem 0.6rem;border-radius:6px;font-size:0.8rem;font-weight:600;">' + p.method + '</span></td>' +
                    '<td style="padding:0.7rem 1rem;text-align:center;">' +
                        '<button onclick="printReceipt(' + p.id + ')" style="background:var(--sky);color:#fff;border:none;border-radius:6px;padding:0.35rem 0.75rem;cursor:pointer;font-size:0.82rem;margin-right:0.5rem;">🖨️ Reçu</button>' +
                        '<button onclick="deletePayment(' + p.id + ')" style="background:var(--terracotta);color:#fff;border:none;border-radius:6px;padding:0.35rem 0.75rem;cursor:pointer;font-size:0.82rem;">🗑 Supprimer</button>' +
                    '</td></tr>';
            }).join('');
        }

        // Econome: save fee amount for a class
        function saveFee() {
            var classId = parseInt(document.getElementById('fee-class-select').value);
            var amount  = parseFloat(document.getElementById('fee-amount').value);

            if (!classId) { showAlert('Veuillez sélectionner une classe', 'error'); return; }
            if (!amount || amount < 0) { showAlert('Veuillez entrer un montant valide', 'error'); return; }

            appState.classFees[classId] = amount;
            saveData();
            showAlert('Frais enregistrés avec succès', 'success');
            loadPaymentsEconome();
        }

        // Econome: save one payment record
        function savePayment() {
            var studentId = parseInt(document.getElementById('payment-student-select').value);
            var amount    = parseFloat(document.getElementById('payment-amount').value);
            var date      = document.getElementById('payment-date').value;
            var method    = document.getElementById('payment-method').value;

            if (!studentId) { showAlert('Veuillez sélectionner un élève', 'error'); return; }
            if (!amount || amount <= 0) { showAlert('Veuillez entrer un montant valide', 'error'); return; }
            if (!date) { showAlert('Veuillez sélectionner une date', 'error'); return; }

            var record = {
                id:        Date.now(),
                studentId: studentId,
                amount:    amount,
                date:      date,
                method:    method
            };
            appState.payments.push(record);
            saveData();
            showAlert('Paiement enregistré avec succès', 'success');

            // Reset form
            document.getElementById('payment-student-select').value = '';
            document.getElementById('payment-amount').value = '';
            document.getElementById('payment-date').valueAsDate = new Date();

            loadPaymentsEconome();
        }

        // Econome: delete one payment by id
        function deletePayment(id) {
            if (!confirm('Supprimer ce paiement?')) return;
            appState.payments = appState.payments.filter(function(p) { return p.id !== id; });
            saveData();
            showAlert('Paiement supprimé', 'success');
            loadPaymentsEconome();
        }

        // Econome: populate receipt card and print
        function printReceipt(id) {
            var payment = appState.payments.find(function(p) { return p.id === id; });
            if (!payment) { showAlert('Paiement introuvable', 'error'); return; }

            var student = appState.students.find(function(s) { return s.id === payment.studentId; });
            if (!student) { showAlert('Élève introuvable', 'error'); return; }

            var classInfo = appState.classes.find(function(c) { return c.id === student.classId; });
            var className = classInfo ? classInfo.name : '—';

            // Format payment date
            var paymentDate = new Date(payment.date + 'T00:00:00');
            var dateStr = paymentDate.toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });
            
            // Current timestamp for "Date & Heure"
            var now = new Date();
            var timeStr = now.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
            var fullDateTime = dateStr + ' à ' + timeStr;

            // Populate receipt card
            document.getElementById('receipt-number').textContent = 'N° ' + payment.id;
            document.getElementById('receipt-student-name').textContent = student.name;
            document.getElementById('receipt-student-matricule').textContent = student.matricule;
            document.getElementById('receipt-student-class').textContent = className;
            document.getElementById('receipt-datetime').textContent = fullDateTime;
            document.getElementById('receipt-amount').textContent = payment.amount.toLocaleString('fr-FR') + ' FCFA';
            document.getElementById('receipt-method').textContent = payment.method;

            // Populate balance section if fee is set for this student's class
            var fee = student ? (appState.classFees[student.classId] || 0) : 0;
            var balanceSection = document.getElementById('receipt-balance-section');
            if (fee > 0) {
                var totalPaid = appState.payments
                    .filter(function(p) { return p.studentId === student.id; })
                    .reduce(function(sum, p) { return sum + p.amount; }, 0);
                var balance = fee - totalPaid;
                var balanceColor = balance <= 0 ? 'var(--green)' : 'var(--terracotta)';
                var balanceText = balance <= 0 ? 'Soldé' : balance.toLocaleString('fr-FR') + ' FCFA';

                document.getElementById('receipt-total-fee').textContent = fee.toLocaleString('fr-FR') + ' FCFA';
                document.getElementById('receipt-total-paid').textContent = totalPaid.toLocaleString('fr-FR') + ' FCFA';
                document.getElementById('receipt-balance').textContent = balanceText;
                document.getElementById('receipt-balance').style.color = balanceColor;
                balanceSection.style.display = 'block';
            } else {
                balanceSection.style.display = 'none';
            }

            // Apply signature if uploaded
            var signatureImg = document.getElementById('receipt-signature-img');
            if (appState.economeSignature) {
                signatureImg.src = appState.economeSignature;
                signatureImg.style.display = 'block';
            } else {
                signatureImg.style.display = 'none';
            }

            // Show receipt card and trigger print
            applyLogoToWatermarks();
            document.getElementById('payment-receipt-card').style.display = 'block';
            setTimeout(function() {
                window.print();
                // Hide receipt after print dialog closes
                document.getElementById('payment-receipt-card').style.display = 'none';
            }, 100);
        }

        // Parent: view own children payments as cards
        function loadPaymentsParent() {
            document.getElementById('payments-econome-view').style.display  = 'none';
            document.getElementById('payments-parent-view').style.display = 'block';

            var children = getParentChildren();
            var container = document.getElementById('payments-parent-cards');

            if (children.length === 0) {
                container.innerHTML = '<div class="card"><div class="card-body"><p style="text-align:center;color:var(--gray-text);padding:2rem;">Aucun élève associé</p></div></div>';
                return;
            }

            container.innerHTML = children.map(function(child) {
                var payments = appState.payments.filter(function(p) { return p.studentId === child.id; });
                payments.sort(function(a,b) { return b.date.localeCompare(a.date); });
                var total = payments.reduce(function(s,p) { return s + p.amount; }, 0);
                var cls   = appState.classes.find(function(c) { return c.id === child.classId; });

                var rows = payments.map(function(p) {
                    var d = new Date(p.date + 'T00:00:00');
                    var dateStr = d.toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });
                    return '<tr style="border-bottom:1px solid var(--border);">' +
                        '<td style="padding:0.6rem 0.85rem;">' + dateStr + '</td>' +
                        '<td style="padding:0.6rem 0.85rem;text-align:right;font-weight:700;color:var(--green);">' + p.amount.toLocaleString('fr-FR') + ' FCFA</td>' +
                        '<td style="padding:0.6rem 0.85rem;text-align:center;"><span style="background:var(--light-bg);padding:0.2rem 0.5rem;border-radius:5px;font-size:0.78rem;font-weight:600;">' + p.method + '</span></td>' +
                    '</tr>';
                }).join('');

                return '<div class="card" style="margin-bottom:1.25rem;">' +
                    '<div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">' +
                        '<div>' +
                            '<h3 class="card-title">' + child.name + '</h3>' +
                            '<span style="font-size:0.85rem;color:var(--gray-text);">' + (cls ? cls.name : '') + ' · ' + child.matricule + '</span>' +
                        '</div>' +
                        '<div style="text-align:right;">' +
                            '<div style="font-size:1.5rem;font-weight:700;color:var(--green);line-height:1;">' + total.toLocaleString('fr-FR') + '</div>' +
                            '<div style="font-size:0.78rem;color:var(--gray-text);">FCFA payés</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="card-body">' +
                        (payments.length === 0
                            ? '<p style="color:var(--gray-text);padding:0.75rem 0;">Aucun paiement enregistré</p>'
                            : '<div style="overflow-x:auto;">' +
                                '<table style="width:100%;border-collapse:collapse;">' +
                                    '<thead><tr style="background:linear-gradient(135deg,var(--earth) 0%,var(--savanna) 100%);color:#fff;">' +
                                        '<th style="padding:0.65rem 0.85rem;text-align:left;border-radius:8px 0 0 0;">Date</th>' +
                                        '<th style="padding:0.65rem 0.85rem;text-align:right;">Montant</th>' +
                                        '<th style="padding:0.65rem 0.85rem;text-align:center;border-radius:0 8px 0 0;">Mode</th>' +
                                    '</tr></thead>' +
                                    '<tbody>' + rows + '</tbody>' +
                                '</table>' +
                              '</div>'
                        ) +
                    '</div></div>';
            }).join('');
        }

        // ---- End Payments ----

        // ---- Parent Profile Management ----

        function loadParentProfile() {
            var user = appState.currentUser;
            
            // Populate form fields
            document.getElementById('parent-fullname').value = user.fullName || '';
            document.getElementById('parent-username').value = user.username || '';
            document.getElementById('parent-phone').value = user.phone || '';
            document.getElementById('parent-email').value = user.email || '';

            // Clear password fields
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';

            // Load children list
            var children = getParentChildren();
            var container = document.getElementById('profile-children-list');
            
            if (children.length === 0) {
                container.innerHTML = '<p style="color:var(--gray-text);padding:1rem;">Aucun enfant associé</p>';
            } else {
                container.innerHTML = children.map(function(child) {
                    var cls = appState.classes.find(function(c) { return c.id === child.classId; });
                    return '<div style="padding:1rem;background:var(--light-bg);border-radius:8px;margin-bottom:1rem;">' +
                        '<div style="font-weight:600;font-size:1.1rem;color:var(--dark-text);margin-bottom:0.5rem;">' + child.name + '</div>' +
                        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:0.75rem;font-size:0.9rem;color:var(--gray-text);">' +
                            '<div><strong>Matricule:</strong> ' + child.matricule + '</div>' +
                            '<div><strong>Classe:</strong> ' + (cls ? cls.name : '—') + '</div>' +
                            '<div><strong>Sexe:</strong> ' + (child.sex === 'M' ? 'Masculin' : 'Féminin') + '</div>' +
                        '</div>' +
                    '</div>';
                }).join('');
            }
        }

        function changePassword(event) {
            event.preventDefault();
            
            var currentPassword = document.getElementById('current-password').value;
            var newPassword = document.getElementById('new-password').value;
            var confirmPassword = document.getElementById('confirm-password').value;

            // Verify current password
            if (currentPassword !== appState.currentUser.password) {
                showAlert('Mot de passe actuel incorrect', 'error');
                return;
            }

            // Check new passwords match
            if (newPassword !== confirmPassword) {
                showAlert('Les nouveaux mots de passe ne correspondent pas', 'error');
                return;
            }

            // Phase 4: Validate password complexity
            var validation = validatePasswordComplexity(newPassword);
            if (!validation.valid) {
                showAlert(validation.message, 'error');
                return;
            }

            // Update password
            var userIndex = appState.users.findIndex(function(u) { return u.id === appState.currentUser.id; });
            if (userIndex !== -1) {
                appState.users[userIndex].password = newPassword;
                appState.currentUser.password = newPassword;
                saveData();
                logActivity('Mot de passe modifié'); // Phase 4: Log activity
                showAlert('Mot de passe modifié avec succès', 'success');
                
                // Clear form
                document.getElementById('current-password').value = '';
                document.getElementById('new-password').value = '';
                document.getElementById('confirm-password').value = '';
            }
        }

        function updateParentInfo(event) {
            event.preventDefault();
            
            var fullName = document.getElementById('parent-fullname').value.trim();
            var phone = document.getElementById('parent-phone').value.trim();
            var email = document.getElementById('parent-email').value.trim();

            if (!fullName) {
                showAlert('Le nom complet est requis', 'error');
                return;
            }

            // Update user info
            var userIndex = appState.users.findIndex(function(u) { return u.id === appState.currentUser.id; });
            if (userIndex !== -1) {
                appState.users[userIndex].fullName = fullName;
                appState.users[userIndex].phone = phone;
                appState.users[userIndex].email = email;
                
                appState.currentUser.fullName = fullName;
                appState.currentUser.phone = phone;
                appState.currentUser.email = email;

                saveData();
                showAlert('Informations mises à jour avec succès', 'success');
                
                // Update display name in top bar
                document.getElementById('user-name').textContent = fullName;
            }
        }

        // ---- End Parent Profile Management ----


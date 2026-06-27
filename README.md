# École Numérique — Gestion Scolaire Burkina Faso

## About this split

The original `Ecole-Main-System.html` was a single ~8 300-line file.
This repository breaks it into smaller pieces **without changing any code**.
Every line of CSS and JavaScript is verbatim from the original.

---

## File structure

```
├── index.html                            ← App entry point (HTML only, ~2 350 lines)
├── css/
│   └── styles.css                        ← All CSS (~680 lines)
└── js/
    ├── 01-state.js                       ← appState object, saveData/loadData, trimestre helpers
    ├── 02-auth-navigation.js             ← Login handler, role config, navigation builder, showSection
    ├── 03-dashboard.js                   ← Dashboard stats per role, parent children overview, progress charts
    ├── 04-students-teachers.js           ← Student & teacher CRUD, class selectors, logo/school config
    ├── 05-grades-absences.js             ← Grade tables, moyennes, CEP results, absences (all roles)
    ├── 06-schedule.js                    ← Emploi du temps: admin editable grid, teacher/student read-only
    ├── 07-payments.js                    ← Fee setup, payment records, receipts, parent payment view, parent profile
    ├── 08-archives-reports.js            ← Student archiving, CSV exports, backup/restore
    ├── 09-classes-subjects-fees.js       ← Class & subject management, payment plans, fee exemptions
    ├── 10-communications-tests-discipline.js ← Messages, announcements, evaluations, discipline & merit points
    ├── 11-homework-health.js             ← Homework assignments, student health records, activity logging
    ├── 12-student-portal.js              ← Student-role UI: grades, absences, homework, bulletin, profile
    └── 13-utils-charts.js               ← refreshPage, logout, showAlert, admin dashboard charts
```

---

## Running locally

Because JS is now in separate files the app must be served over HTTP
(browsers block cross-origin file reads with `file://`).

**Python (quickest):**
```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

**Node / npx:**
```bash
npx serve .
```

**VS Code:** install the *Live Server* extension → right-click `index.html` → *Open with Live Server*.

---

## Demo credentials

| Role | Username | Password |
|------|----------|----------|
| Administrateur | admin | admin123 |
| Enseignant | teacher1 | teach123 |
| Parent | parent | parent123 |
| Économe | econome | econ123 |

---

## Script load order

Scripts must be loaded in the numbered order above.
`01-state.js` defines `appState` which every other file depends on.
`13-utils-charts.js` must come last as it calls `initializeAdminCharts` after
all chart-rendering helpers are defined.

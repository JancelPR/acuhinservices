Goals
Cleanly separate frontend and backend responsibilities
Improve maintainability, scalability, and readability
Preserve 100% of existing functionality
Prepare the project for real-world production and team collaboration

STEP 1: Analyze First (NO CODE YET)
Before refactoring:
Identify which parts belong to:
Frontend (UI, events, forms, rendering, styles)
Backend (API logic, database access, validation, business logic)
Identify shared logic that must be moved to:
API contracts
Constants
DTOs (if needed)


STEP 2: Target Project Structure
project-root/
│
├── frontend/
├── backend/
├── README.md
└── .gitignore

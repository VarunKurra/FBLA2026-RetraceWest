# RetraceWest (Vogue Vault) - Project Overview

This document provides a comprehensive overview of the RetraceWest application, detailing its core features, integrated APIs, and the complete technology stack used to build the platform.

---

## 1. Core Application Features

The platform is designed to provide robust lost-and-found management with roles for Students, Volunteers, and Administrators.

### User & Community Features
*   **Secure Authentication & Barrier Logic**: Role-based access control (RBAC) ensuring only verified network members can access community features.
*   **Interactive Dashboard**: A personalized command center for normal authenticated users to track their claims and points.
*   **Lost & Found Registry**: A central hub where users can browse missing or found items.
    *   **Neural Search (AI Filtering)**: Allows users to search for items using natural language descriptions.
    *   **Distance Sorting**: Sort items by distance from the user's current location to the item's coordinates.
    *   **Inquiry Protocol**: Secure messaging system for claiming items with verification checks.
*   **Incident Reporting**: Users can quickly submit detailed reports for items they have lost or found.
*   **Spatial Map & Discovery**: A 2D interactive map to visually discover items matching the user's criteria.
*   **Precision Navigator**: An active navigation component providing Google Maps-style turn-by-turn directions, TTS (Text-to-Speech) voice guidance, ETA, and distance calculations to help users locate lost items on campus.
*   **Gamified Leaderboard**: Tracks student and volunteer reputation points for returning found items, promoting community engagement.

### Administrator Features (Command Center)
*   **Analytics Overview**: Provides high-level metrics including total items, active reports, recovery rates, and top categories.
*   **Smart Campus Heat Zone Map**: A 2D spatial distribution heat map that identifies high-density "hotspots" for lost or found items across the Parkway West High School campus, aiding in strategic drop-box placement.
*   **Moderation Hub**: Reviewing active item claim inquiries to prevent wrongful or fraudulent item pickups.
*   **Student Roster & Management**: Governs student access, assigns community roles (Student, Volunteer, Admin), adjusts user points manually, and handles banning unruly users.
*   **Volunteer Coordination**: A dedicated portal to review, approve, or decline system volunteer applications.

---

## 2. Integrated APIs

The application utilizes several APIs and external services to power its location, storage, and intelligence layers.

### Native & Web APIs
*   **Web Speech API (SpeechSynthesis)**: Powers the Text-to-Speech (TTS) voice guidance system inside the Precision Navigator.
*   **Geolocation API**: Used implicitly to determine the user's current spatial coordinates for routing and distance comparisons.

### Third-Party APIs
*   **Groq API (Llama 3)**: Serves the natural language processing layer for the "Neural Search" feature, allowing semantic identification of items.
*   **OSRM Routing API (Project OSRM)**: Provides the turn-by-turn driving/walking directions and coordinate geometry used in the Precision Navigator.
*   **Supabase API**: Fully handles backend logic, serving as the interface for the PostgreSQL database and identity provider (Authentication).
*   **Carto Maps API**: Provides the base raster tile layers (`basemaps.cartocdn.com`) used in the Leaflet map implementations for the Admin Heat Zone map.

---

## 3. Technology Stack & Packages

The project is built on a modern, fast, and responsive web stack.

### Languages & Frameworks
*   **JavaScript (ES6+) / JSX**: Core programming language.
*   **React (v19)**: The foundational UI library for building the interface and components.
*   **Vite**: The front-end build tool and development server, chosen for its fast HMR and optimized builds.

### Database & Backend Services
*   **Supabase (`@supabase/supabase-js`)**: Unified backend-as-a-service providing PostgreSQL data storage, real-time subscriptions, and authentication.

### Core Libraries & Dependencies
*   **Routing**: `react-router-dom` (Handles application page routing and navigation context).
*   **Mapping & Spatial Data**:
    *   `leaflet` & `react-leaflet` (Powers the interactive 2D maps and the Admin Heat Zone).
    *   `cesium` & `resium` (Integrated 3D globe / spatial mapping frameworks).
    *   `vite-plugin-cesium` (Vite integration for processing Cesium assets).
*   **UI & Motion**:
    *   `framer-motion` (Manages fluid component animations, page transitions, and layout morphing).
    *   `lucide-react` (Provides clean and consistent SVG icons across the interface).
    *   `canvas-confetti` (Delivers celebratory micro-animations when tasks are completed or items are claimed).
*   **Code Quality**: `eslint` (Ensures javascript code linting, utilizing hooks and refresh plugins).

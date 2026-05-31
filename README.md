# 🗳️ VoteEase — Premium Online Voting System

VoteEase is a stunning, premium full-stack online voting application built with a robust **Java (Spring Boot)** backend, a secure **MySQL** database, and a highly polished **Vanilla HTML5/CSS3/JS** frontend Single-Page Application (SPA) designed with a premium glassmorphic aesthetic.

## ✨ Key Features
- 🔐 **Secure Role-Based Authentication:** Clean sign-up and login for Voters and Administrators.
- 🛡️ **Admin Dashboard:** Real-time controls to Create Polls (with custom multiple-choice options), Manage Polls (Open/Close voting or Delete polls), and view all Registered Users.
- 🗳️ **Secure Voting:** Prevents duplicate voting using database unique constraints; features modern, intuitive interactive option selection.
- 📊 **Real-time Live Analytics:** Dynamic bar charts showcasing vote counts, percentages, total statistics, and winner declarations.
- 🕓 **Voting History Logging:** Displays chronological records of all votes cast.
- 🌙 **Modern Glassmorphic Dark/Light Mode:** Full dynamic color theming that is saved locally to your browser.

---

## 🛠️ Prerequisite Installation
To run this application, make sure you have the following installed on your machine:
1. **Java JDK 17** or higher.
2. **Apache Maven** (for compilation and building).
3. **MySQL Server** (community edition or XAMPP/WampServer).

---

## 🚀 Database Configuration & Installation

### Step 1: Initialize MySQL Schema
Make sure your MySQL Server is running. Open your MySQL client (Command Line, Workbench, or phpMyAdmin) and run the following commands to create the database:
```sql
CREATE DATABASE voteease;
```
*(Note: Spring Boot is pre-configured to automatically initialize tables on startup using the provided `src/main/resources/schema.sql` script).*

### Step 2: Configure Database Credentials
Open the file [src/main/resources/application.properties](file:///C:/Users/Lenovo/.gemini/antigravity/scratch/voting-app/src/main/resources/application.properties) and update your MySQL username and password:
```properties
# ── MySQL Database ──
spring.datasource.url=jdbc:mysql://localhost:3306/voteease?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD_HERE
```
*(Leave `spring.datasource.password=` empty if your root user does not have a password).*

---

## 🏗️ How to Build and Run the App

### Step 1: Compile and Build Project
Open your terminal (PowerShell, Command Prompt, or Bash) in the project root folder `C:\Users\Lenovo\.gemini\antigravity\scratch\voting-app\` and compile the application:
```bash
mvn clean package -DskipTests
```

### Step 2: Start Spring Boot Server
Once compile is successful, run the executable Spring Boot jar:
```bash
mvn spring-boot:run
```
Alternatively, execute the compiled package directly:
```bash
java -jar target/voteease-2.0.0.jar
```

### Step 3: Open in Browser
Open your browser and navigate to:
```
http://localhost:3000/
```
The premium VoteEase Single Page Application will load instantly!

---

## 🔑 Access Credentials

### 1. Seeding Data
On initial startup, `DataInitializer` seeds 3 default polls automatically to demonstrate visual analytics:
- **Best programming language?** (Python, JavaScript, Java, C++)
- **Preferred project theme?** (Web App, Mobile App, AI/ML, Game Dev)
- **Favorite database?** (MySQL, MongoDB, PostgreSQL, Firebase)

### 2. Default Roles
- **Voters:** You can register a voter account instantly on the Register tab.
- **Administrators:** Toggle the Role dropdown to **Admin** during registration. You will be prompted to enter the **Admin Secret Code**.
  - **Default Admin Secret Code:** `ADMIN2026`

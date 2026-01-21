# Personal Contact Manager – LAMP Stack Web Application

## 📌 Project Overview

This project is a **full-stack, API-driven personal contact manager** developed as part of a **small group software engineering project**. The application allows users to **register, log in, and securely manage their own contacts**, including creating, viewing, searching, updating, and deleting contact records.

The system is built using a **LAMP stack (Linux, Apache, MySQL, PHP)** and follows modern web development practices such as:

* RESTful APIs
* JSON-based client–server communication
* Database-backed, server-side search
* Separation of front-end and back-end concerns
* Formal documentation and diagrams

The application is **deployed on a remote server**, accessed via a **custom domain**, and demonstrated live during a team presentation.

---

## 🧱 Technology Stack

### Backend

* **Linux** (Ubuntu)
* **Apache**
* **MySQL**
* **PHP**
* REST-style API endpoints
* JSON request/response format

### Frontend

* HTML
* CSS
* JavaScript
* AJAX (XMLHttpRequest / Fetch)

### Tools & Documentation

* GitHub (version control)
* SwaggerHub (API documentation)
* UML Use Case Diagram
* ER Diagram (ERD)
* Gantt Chart
* Lighthouse accessibility testing

---

## ✨ Features

### User Accounts

* User registration (sign up)
* User login with credentials
* Users can only access **their own data**

### Contact Management (CRUD)

Logged-in users can:

* Create new contacts
* View all of their contacts
* Update existing contacts
* Delete contacts (with confirmation)

### Contact Fields

Each contact includes:

* First Name
* Last Name
* Email
* Phone Number
* Date Created
* Associated User ID

### Search

* Server-side search using MySQL queries
* Partial match support (e.g., `Jo` → John, Jones)
* Case-insensitive
* No client-side caching of contact lists

---

## 🧩 Architecture Overview

```
Browser (HTML/CSS/JS)
        |
        | AJAX (JSON)
        v
PHP REST API (Apache)
        |
        | SQL Queries
        v
MySQL Database (Remote)
```

* The frontend **never directly accesses the database**
* All data flows through **PHP API endpoints**
* Each API endpoint performs authentication, validation, and database access

---

## 🗄️ Database Schema

### Users Table

| Field     | Type        |
| --------- | ----------- |
| ID        | INT (PK)    |
| FirstName | VARCHAR(50) |
| LastName  | VARCHAR(50) |
| Login     | VARCHAR(50) |
| Password  | VARCHAR(50) |

### Contacts Table

| Field     | Type        |
| --------- | ----------- |
| ID        | INT (PK)    |
| FirstName | VARCHAR(50) |
| LastName  | VARCHAR(50) |
| Phone     | VARCHAR(50) |
| Email     | VARCHAR(50) |
| UserID    | INT (FK)    |

---

## 🚀 Deployment & Setup Guide (LAMP)

### 1️⃣ Create a LAMP Server

1. Create a **DigitalOcean LAMP Droplet**

   * Ubuntu
   * Basic Plan ($7/month)
2. Set and save your **root password**
3. SSH into the server:

   ```bash
   ssh root@your_domain_or_ip
   ```

Apache, MySQL, and PHP are preinstalled.

---

### 2️⃣ Configure Web Root

```bash
cd /var/www/html
```

Directory structure:

```
/var/www/html
│── index.html
│── css/
│── js/
│── images/
│── LAMPAPI/
```

---

### 3️⃣ Database Setup

Login to MySQL:

```bash
mysql -u root -p
```

Create database:

```sql
CREATE DATABASE COP4331;
USE COP4331;
```

Create tables:

```sql
CREATE TABLE Users (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  FirstName VARCHAR(50),
  LastName VARCHAR(50),
  Login VARCHAR(50),
  Password VARCHAR(50)
);

CREATE TABLE Contacts (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  FirstName VARCHAR(50),
  LastName VARCHAR(50),
  Phone VARCHAR(50),
  Email VARCHAR(50),
  UserID INT
);
```

Create database user:

```sql
CREATE USER 'TheBeast' IDENTIFIED BY 'WeLoveCOP4331';
GRANT ALL PRIVILEGES ON COP4331.* TO 'TheBeast'@'%';
```

---

### 4️⃣ API Configuration

All API endpoints live in:

```
/var/www/html/LAMPAPI
```

Each PHP file must include:

```php
$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
```

Example endpoints:

* `Login.php`
* `AddContact.php`
* `SearchContacts.php`
* `DeleteContact.php`
* `UpdateContact.php`

---

### 5️⃣ Frontend Deployment

Upload:

* `index.html`
* `contacts.html`
* `/css`
* `/js`
* `/images`

Use **FileZilla** or **SFTP** for uploads.

---

## 🔌 API Usage

### Example: Login

**POST** `/LAMPAPI/Login.php`

```json
{
  "login": "username",
  "password": "password"
}
```

### Example: Search Contacts

**POST** `/LAMPAPI/SearchContacts.php`

```json
{
  "userId": 1,
  "search": "Jo"
}
```

Responses are returned as JSON objects or arrays.

---

## 📊 Documentation & Presentation Artifacts

The project includes:

* UML Use Case Diagram
* Entity Relationship Diagram (ERD)
* Gantt Chart
* SwaggerHub API documentation
* Lighthouse accessibility report
* Live hosted demo

---

## 👥 Team Contributions

Each team member contributed to:

* Backend development
* Frontend UI
* API integration
* Documentation
* Testing
* Presentation delivery

All contributions are tracked via GitHub commits.

---

## ⚠️ Important Notes

* No localhost demos – application must be live
* No Python frameworks used
* Search is server-side only
* Users can only access their own data
* All communication uses JSON
* Repository is public as required

---

## 📎 Links

* **Live Application:** *(add domain here)*
* **SwaggerHub API:** *(add link here)*

# Login / Sign up (PHP)

A PHP version of the Figma-based login and sign-up forms. The HTML markup and CSS are unchanged from the original design; PHP adds real account handling.

## Structure

```
index.php            the page (same markup as index.html)
styles.css           unchanged
script.js            same UI behaviour; now posts the forms to PHP
api/signup.php       creates an account (password hashed)
api/login.php        checks credentials, starts a session
includes/bootstrap.php   session, CSRF token, SQLite connection
images/              login-bg.jpg, signup-bg.jpg
data/                SQLite database is created here automatically
```

## Run locally

Requires PHP 8.0+ with `pdo_sqlite` (enabled by default in most installs).

**Option A: PHP built-in server**
```
cd login-signup-php
php -S localhost:8000
```
Open http://localhost:8000

**Option B: XAMPP / Laragon**
1. Copy the `login-signup-php` folder into `htdocs` (XAMPP) or `www` (Laragon).
2. Start Apache.
3. Open http://localhost/login-signup-php/

If you see "could not find driver", open `php.ini` and remove the `;` before `extension=pdo_sqlite` and `extension=sqlite3`, then restart Apache.

## Usage
- Sign up with name, email, password and confirmation (min. 6 characters).
- Then log in with your email as the "name of use".

## Submit to GitHub
```
cd login-signup-php
git init
git add .
git commit -m "Add PHP login and sign-up"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```
Create the empty repository on github.com first (no README), then use its URL above.

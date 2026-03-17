// Simple localStorage-based auth system
const USERS_KEY = "census_users";
const SESSION_KEY = "census_session";

interface User {
  username: string;
  email: string;
  passwordHash: string;
}

// Simple hash function (not bcrypt, but sufficient for localStorage demo)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return "h_" + Math.abs(hash).toString(36) + "_" + str.length;
}

function getUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function register(username: string, email: string, password: string): { success: boolean; error?: string } {
  const users = getUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, error: "Username already exists" };
  }
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: "Email already registered" };
  }
  users.push({ username, email, passwordHash: simpleHash(password) });
  saveUsers(users);
  return { success: true };
}

export function login(username: string, password: string): { success: boolean; error?: string } {
  const users = getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return { success: false, error: "User not found" };
  if (user.passwordHash !== simpleHash(password)) return { success: false, error: "Incorrect password" };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username: user.username, email: user.email, loggedInAt: Date.now() }));
  return { success: true };
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn(): boolean {
  return sessionStorage.getItem(SESSION_KEY) !== null;
}

export function getCurrentUser(): { username: string; email: string } | null {
  const data = sessionStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

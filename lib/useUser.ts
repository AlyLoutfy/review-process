"use client";

import { useState, useEffect, createContext, useContext } from "react";

export interface User {
  id: string;
  name: string;
  email?: string;
}

const USER_STORAGE_KEY = "review-process-current-user";
const USERS_STORAGE_KEY = "review-process-users";

// Default users for demo purposes
const DEFAULT_USERS: User[] = [
  { id: "user-1", name: "John Doe", email: "john@example.com" },
  { id: "user-2", name: "Jane Smith", email: "jane@example.com" },
  { id: "user-3", name: "Mike Johnson", email: "mike@example.com" },
];

export function useUser() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load current user
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
        } catch {
          // Invalid storage, use first default user
          setCurrentUser(DEFAULT_USERS[0]);
        }
      } else {
        // No user set, use first default user
        setCurrentUser(DEFAULT_USERS[0]);
      }

      // Load all users
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        try {
          const parsedUsers = JSON.parse(storedUsers);
          setUsers(parsedUsers);
        } catch {
          setUsers(DEFAULT_USERS);
        }
      } else {
        // Initialize with default users
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
        setUsers(DEFAULT_USERS);
      }
    }
  }, []);

  const setUser = (user: User) => {
    setCurrentUser(user);
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  };

  const getUserById = (userId: string): User | null => {
    return users.find((u) => u.id === userId) || null;
  };

  return {
    currentUser,
    setUser,
    users,
    getUserById,
  };
}


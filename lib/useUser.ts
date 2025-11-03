"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { dbUsers } from "./database";

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
    const loadFromIndexedDB = async () => {
      if (typeof window !== "undefined") {
        try {
          // Load current user
          const storedUser = await dbUsers.get(USER_STORAGE_KEY);
          if (storedUser) {
            setCurrentUser(storedUser);
          } else {
            // No user set, use first default user
            setCurrentUser(DEFAULT_USERS[0]);
            await dbUsers.set(USER_STORAGE_KEY, DEFAULT_USERS[0]);
          }

          // Load all users
          const storedUsers = await dbUsers.get(USERS_STORAGE_KEY);
          if (storedUsers && Array.isArray(storedUsers)) {
            setUsers(storedUsers);
          } else {
            // Initialize with default users
            await dbUsers.set(USERS_STORAGE_KEY, DEFAULT_USERS);
            setUsers(DEFAULT_USERS);
          }
        } catch (error) {
          // Fallback to defaults
          setCurrentUser(DEFAULT_USERS[0]);
          setUsers(DEFAULT_USERS);
        }
      }
    };

    loadFromIndexedDB();
  }, []);

  const setUser = async (user: User) => {
    setCurrentUser(user);
    if (typeof window !== "undefined") {
      try {
        await dbUsers.set(USER_STORAGE_KEY, user);
      } catch (error) {
        // Silently fail - errors are handled internally
      }
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

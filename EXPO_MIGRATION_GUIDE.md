# Complete Migration Guide: React Web App to Expo/React Native

This document provides a comprehensive, step-by-step guide to migrate the current React web application to an Expo/React Native mobile application. Follow these instructions carefully to ensure a successful migration.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Dependency Migration](#dependency-migration)
4. [File Structure Changes](#file-structure-changes)
5. [Authentication Migration](#authentication-migration)
6. [Component Migration](#component-migration)
7. [Navigation Migration](#navigation-migration)
8. [State Management Migration](#state-management-migration)
9. [Styling Migration](#styling-migration)
10. [Assets and Images](#assets-and-images)
11. [Platform-Specific Code](#platform-specific-code)
12. [Testing and Debugging](#testing-and-debugging)

## Prerequisites

### Install Required Tools
```bash
npm install -g @expo/cli
npm install -g expo-dev-client
```

### Environment Setup
- Node.js 18+ 
- Expo CLI
- iOS Simulator (macOS) or Android Studio (for Android development)
- Physical device for testing (recommended)

## Project Setup

### 1. Create New Expo Project
```bash
npx create-expo-app@latest OnlineMarketMobile --template tabs@50
cd OnlineMarketMobile
```

### 2. Install Core Dependencies
```bash
# Navigation
npx expo install expo-router
npx expo install react-native-screens react-native-safe-area-context

# UI and Styling
npx expo install react-native-svg
npx expo install expo-linear-gradient
npm install nativewind
npm install tailwindcss@3.3.0
npm install react-native-reanimated

# Forms and Input
npm install react-hook-form
npm install @hookform/resolvers
npm install zod

# State Management
npm install @tanstack/react-query
npm install zustand

# Supabase
npm install @supabase/supabase-js
npx expo install react-native-url-polyfill

# Image Handling
npx expo install expo-image-picker
npx expo install expo-image-manipulator
npx expo install expo-file-system

# Storage
npx expo install expo-secure-store
npx expo install @react-native-async-storage/async-storage

# Notifications
npx expo install expo-notifications

# Other utilities
npm install date-fns
npm install react-native-toast-message
npx expo install expo-linking
npx expo install expo-constants
```

## File Structure Changes

### New Expo Project Structure
```
OnlineMarketMobile/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Products/Home page
│   │   ├── cart.tsx       # Cart page
│   │   ├── wishlist.tsx   # Wishlist page
│   │   └── profile.tsx    # Profile page
│   ├── auth/              # Authentication pages
│   │   ├── login.tsx      # Login page
│   │   └── register.tsx   # Register page
│   ├── product/           # Product-related pages
│   │   ├── [id].tsx       # Product detail page
│   │   └── add.tsx        # Add product page
│   ├── _layout.tsx        # Root layout
│   └── +not-found.tsx    # 404 page
├── components/            # Reusable components
├── hooks/                 # Custom hooks
├── lib/                   # Utilities and configurations
├── types/                 # TypeScript type definitions
├── constants/             # App constants
└── assets/               # Images, fonts, etc.
```

## Authentication Migration

### 1. Update Supabase Configuration
Create `lib/supabase.ts`:
```typescript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://izolcgjxobgendljwoan.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6b2xjZ2p4b2JnZW5kbGp3b2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NTkyMjQsImV4cCI6MjA1MTIzNTIyNH0.8H5sf-ipUrrtTC08-9zCntiJTqET4-S4YVcmCXK3olg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 2. Migrate AuthContext
Create `contexts/AuthContext.tsx`:
```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## Component Migration

### 1. UI Component Replacements

**Replace Radix UI components with React Native equivalents:**

- `Button` → React Native `Pressable` or custom button component
- `Input` → React Native `TextInput`
- `Card` → React Native `View` with styling
- `Dialog/Modal` → React Native `Modal`
- `Select` → React Native `Picker` or custom dropdown
- `Avatar` → React Native `Image` with circular styling
- `Badge` → Custom React Native component
- `Alert` → React Native `Alert` or custom toast

### 2. Create Base Components
Create `components/ui/Button.tsx`:
```typescript
import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  style 
}: ButtonProps) {
  return (
    <Pressable
      style={[
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#3b82f6',
  },
  secondary: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  destructive: {
    backgroundColor: '#ef4444',
  },
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  md: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  lg: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: '#1e293b',
  },
  destructiveText: {
    color: '#ffffff',
  },
});
```

### 3. Migrate Complex Components

**ProductCard Migration:**
```typescript
// Replace web ProductCard with React Native version
import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image 
        source={{ uri: product.imageUrl || 'https://via.placeholder.com/150' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        <Text style={styles.price}>${product.price}</Text>
        <Text style={styles.category}>{product.category}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  content: {
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  category: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
  },
});
```

## Navigation Migration

### 1. Expo Router Setup
Create `app/_layout.tsx`:
```typescript
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="product" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### 2. Tab Navigation
Create `app/(tabs)/_layout.tsx`:
```typescript
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bag" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

## State Management Migration

### 1. React Query Setup
Create `lib/queryClient.ts`:
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});
```

### 2. Migrate Custom Hooks
Update `hooks/useProducts.ts`:
```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Product } from '../types/product';

interface UseProductsOptions {
  searchQuery?: string;
  selectedCategory?: string;
  sortOrder?: string;
  showOnlyPublished?: boolean;
  userOnly?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const {
    searchQuery = '',
    selectedCategory = 'all',
    sortOrder = 'none',
    showOnlyPublished = true,
    userOnly = false
  } = options;

  return useInfiniteQuery({
    queryKey: ['products', searchQuery, selectedCategory, sortOrder, showOnlyPublished, userOnly],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          profiles(username, full_name)
        `)
        .range(pageParam * 10, (pageParam + 1) * 10 - 1);

      // Apply filters based on options
      if (showOnlyPublished) {
        query = query.eq('product_status', 'published');
      }

      if (userOnly) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          query = query.eq('user_id', user.id);
        }
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      // Apply sorting
      switch (sortOrder) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Product[];
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 10 ? pages.length : undefined;
    },
    initialPageParam: 0,
  });
}
```

## Styling Migration

### 1. NativeWind Setup
Create `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Create `metro.config.js`:
```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

Create `global.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2. Update App Entry Point
Update `app/_layout.tsx` to import global styles:
```typescript
import '../global.css';
// ... rest of the layout code
```

## Assets and Images

### 1. Image Handling Migration
Create `lib/imageUtils.ts`:
```typescript
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

export async function pickImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled) {
    return result.assets[0];
  }
  return null;
}

export async function uploadImage(uri: string, bucket: string, path: string) {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });
    
    const filePath = `${path}/${Date.now()}.jpg`;
    const contentType = 'image/jpeg';

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, decode(base64), {
        contentType,
      });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

function decode(base64: string) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  
  for (let i = 0; i < base64.length; i += 4) {
    const encoded1 = chars.indexOf(base64[i]);
    const encoded2 = chars.indexOf(base64[i + 1]);
    const encoded3 = chars.indexOf(base64[i + 2]);
    const encoded4 = chars.indexOf(base64[i + 3]);

    const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;

    result += String.fromCharCode((bitmap >> 16) & 255);
    if (encoded3 !== 64) result += String.fromCharCode((bitmap >> 8) & 255);
    if (encoded4 !== 64) result += String.fromCharCode(bitmap & 255);
  }
  
  return result;
}
```

## Platform-Specific Code

### 1. Create Platform-Specific Components
```typescript
import { Platform } from 'react-native';

// Example of platform-specific styling
const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});
```

### 2. Handle Platform Differences
```typescript
// For navigation differences
if (Platform.OS === 'ios') {
  // iOS-specific navigation handling
} else {
  // Android-specific navigation handling
}
```

## Key Migration Steps Summary

### Phase 1: Setup (Day 1)
1. Create new Expo project
2. Install all dependencies
3. Set up basic file structure
4. Configure Supabase

### Phase 2: Core Components (Day 2-3)
1. Migrate authentication system
2. Create base UI components
3. Set up navigation structure
4. Implement basic routing

### Phase 3: Feature Migration (Day 4-5)
1. Migrate product listing
2. Migrate product details
3. Migrate cart functionality
4. Migrate user profile

### Phase 4: Advanced Features (Day 6-7)
1. Image upload functionality
2. Wishlist features
3. Search and filtering
4. Currency conversion

### Phase 5: Polish & Testing (Day 8-10)
1. Styling and UI polish
2. Performance optimization
3. Platform-specific testing
4. Bug fixes and refinements

## Testing Commands

```bash
# Start development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Build for production
eas build --platform all
```

## Common Gotchas and Solutions

### 1. AsyncStorage vs localStorage
- Replace all `localStorage` usage with `AsyncStorage`
- Use `expo-secure-store` for sensitive data

### 2. Image Handling
- Use `expo-image` instead of web img tags
- Implement proper image caching
- Handle different screen densities

### 3. Navigation
- Expo Router uses file-based routing
- No need for React Router DOM
- Use `router.push()` instead of `navigate()`

### 4. Styling
- NativeWind provides Tailwind-like classes
- Some CSS properties don't exist in React Native
- Use StyleSheet for complex styling

### 5. Forms
- TextInput behavior differs from web inputs
- Use `react-hook-form` with React Native controllers
- Handle keyboard management

## Post-Migration Checklist

- [ ] All core features working
- [ ] Authentication flow complete
- [ ] Image upload/display working
- [ ] Navigation smooth on both platforms
- [ ] Performance optimized
- [ ] Platform-specific features implemented
- [ ] Testing on real devices completed
- [ ] App store preparation done

This guide provides a comprehensive roadmap for migrating your React web app to Expo. Follow each section carefully and test thoroughly at each stage.

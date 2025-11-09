// src/services/authService.ts
import axios from 'axios';
import { apiClient } from '@/services/api';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from '@/types/user';

type AuthApiUser = {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  picture?: string;
  provider?: User['provider'];
  dateOfBirth?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

type AuthApiPayload = {
  success?: boolean;
  user?: AuthApiUser;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
  error?: string;
  errors?: Array<string>;
  [key: string]: unknown;
};

const splitFullName = (
  fullName?: string,
): { firstName?: string; lastName?: string } => {
  if (!fullName) {
    return {};
  }

  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) {
    return {};
  }

  if (parts.length === 1) {
    return { firstName: parts[0] };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
};

const resolvePayload = (raw: unknown): AuthApiPayload | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const candidate = raw as Record<string, unknown>;

  // Some APIs wrap the payload inside a `data` field or similar
  if (candidate.data && typeof candidate.data === 'object') {
    return resolvePayload(candidate.data) ?? (candidate.data as AuthApiPayload);
  }

  const payload: AuthApiPayload = {};

  if (candidate.success !== undefined) {
    payload.success = Boolean(candidate.success);
  }

  if (candidate.accessToken) {
    payload.accessToken = String(candidate.accessToken);
  }

  if (candidate.refreshToken) {
    payload.refreshToken = String(candidate.refreshToken);
  }

  if (candidate.user && typeof candidate.user === 'object') {
    payload.user = candidate.user as AuthApiUser;
  } else if (candidate.currentUser && typeof candidate.currentUser === 'object') {
    payload.user = candidate.currentUser as AuthApiUser;
  }

  if (candidate.message) {
    payload.message = String(candidate.message);
  }

  if (candidate.error) {
    payload.error = String(candidate.error);
  }

  if (Array.isArray(candidate.errors)) {
    payload.errors = candidate.errors.map((item) => String(item));
  }

  return payload;
};

const mapUser = (apiUser: AuthApiUser): User => {
  const nameFromApi = apiUser.name ?? '';
  const nameParts = splitFullName(
    nameFromApi || [apiUser.firstName, apiUser.lastName].filter(Boolean).join(' '),
  );

  const firstName = apiUser.firstName ?? nameParts.firstName;
  const lastName = apiUser.lastName ?? nameParts.lastName;
  const resolvedName =
    nameFromApi ||
    [firstName, lastName]
      .filter((value): value is string => Boolean(value && value.trim()))
      .join(' ') ||
    apiUser.email;

  return {
    id: String(apiUser.id),
    email: String(apiUser.email),
    name: resolvedName,
    firstName: firstName,
    lastName: lastName,
    picture: (apiUser.picture ?? apiUser.profileImage) as string | undefined,
    provider: apiUser.provider ?? 'email',
    dateOfBirth: apiUser.dateOfBirth
      ? new Date(apiUser.dateOfBirth)
      : undefined,
    createdAt: apiUser.createdAt ? new Date(apiUser.createdAt) : undefined,
    updatedAt: apiUser.updatedAt ? new Date(apiUser.updatedAt) : undefined,
  };
};

const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | Record<string, unknown>
      | string
      | undefined;

    if (!responseData) {
      return 'Unable to reach authentication service';
    }

    if (typeof responseData === 'string') {
      return responseData;
    }

    if (responseData.error && typeof responseData.error === 'string') {
      return responseData.error;
    }

    if (responseData.message) {
      if (Array.isArray(responseData.message)) {
        return responseData.message.join(', ');
      }
      if (typeof responseData.message === 'string') {
        return responseData.message;
      }
    }

    if (Array.isArray(responseData.errors)) {
      return responseData.errors.map((item) => String(item)).join(', ');
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Authentication failed';
};

const buildAuthResponse = (payload: AuthApiPayload): AuthResponse => {
  if (!payload.user) {
    return {
      success: false,
      error: payload.error ?? payload.message ?? 'Invalid authentication response',
    };
  }

  const user = mapUser(payload.user);

  return {
    success: payload.success ?? true,
    user,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    message: payload.message,
    error: payload.error,
  };
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const payload = resolvePayload(response.data);

      if (!payload) {
        return {
          success: false,
          error: 'Unexpected response from authentication service',
        };
      }

      return buildAuthResponse(payload);
    } catch (error) {
      return {
        success: false,
        error: extractErrorMessage(error),
      };
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const nameParts = splitFullName(data.name);

      const requestBody: Record<string, unknown> = {
        email: data.email,
        password: data.password,
        name: data.name,
        firstName: data.firstName ?? nameParts.firstName,
        lastName: data.lastName ?? nameParts.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
      };

      Object.keys(requestBody).forEach((key) => {
        if (requestBody[key] === undefined || requestBody[key] === null) {
          delete requestBody[key];
        }
      });

      const response = await apiClient.post('/auth/register', requestBody);
      const payload = resolvePayload(response.data);

      if (!payload) {
        return {
          success: false,
          error: 'Unexpected response from authentication service',
        };
      }

      return buildAuthResponse(payload);
    } catch (error) {
      return {
        success: false,
        error: extractErrorMessage(error),
      };
    }
  },
};

export type AuthService = typeof authService;


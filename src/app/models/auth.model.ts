export type UserRole = 'ADMIN' | 'OPERATOR' | 'USER' | '';

export interface AuthResponse {
    jwttoken: string | null;
    role: UserRole;
}

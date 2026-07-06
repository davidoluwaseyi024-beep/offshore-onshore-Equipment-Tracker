import type { Role } from "../types/user";

// Mirrors the backend permission matrix (see equipment/permissions.py,
// assignments/permissions.py, reports/permissions.py, audit/permissions.py).
// This is a UX convenience for hiding actions the API would reject anyway —
// the API remains the actual authority.

export const canWriteEquipment = (role: Role) => role === "admin" || role === "engineer";
export const canDeleteEquipment = (role: Role) => role === "admin";
export const canChangeEquipmentStatus = () => true;

export const canManageAssignments = (role: Role) => role === "admin" || role === "engineer";

export const canDeleteMaintenance = (role: Role) => role === "admin" || role === "engineer";

export const canManageUsers = (role: Role) => role === "admin";
export const canReadUsers = (role: Role) => role === "admin" || role === "engineer";

export const canGenerateReports = (role: Role) => role === "admin" || role === "engineer";

export const canViewGlobalAuditLog = (role: Role) => role === "admin" || role === "engineer";

export const canManageSitesAndCategories = (role: Role) => role === "admin" || role === "engineer";

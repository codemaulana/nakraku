import { z } from "zod";

export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  color: z.string(),
  icon: z.string().nullable().optional(),
  sort_order: z.number().int(),
  is_active: z.boolean(),
  created_at: z.number().int(),
  updated_at: z.number().int(),
});

export const CreateWorkspaceInputSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const SessionSchema = z.object({
  id: z.string(),
  workspace_id: z.string(),
  name: z.string(),
  window_count: z.number().int(),
  ram_saved_bytes: z.number().int(),
  is_frozen: z.boolean(),
  snapshot_at: z.number().int(),
  created_at: z.number().int(),
});

export const CreateSessionInputSchema = z.object({
  id: z.string(),
  workspace_id: z.string(),
  name: z.string(),
  window_count: z.number().int(),
  ram_saved_bytes: z.number().int(),
  is_frozen: z.boolean(),
});

export const WindowSchema = z.object({
  id: z.string(),
  session_id: z.string(),
  hwnd: z.string(),
  process_id: z.number().int(),
  process_name: z.string(),
  executable_path: z.string().nullable().optional(),
  title: z.string(),
  x: z.number().int(),
  y: z.number().int(),
  width: z.number().int(),
  height: z.number().int(),
  is_minimized: z.boolean(),
  is_maximized: z.boolean(),
  ram_bytes: z.number().int(),
  z_order: z.number().int(),
});

export const InsertWindowInputSchema = z.object({
  id: z.string(),
  session_id: z.string(),
  hwnd: z.string(),
  process_id: z.number().int(),
  process_name: z.string(),
  executable_path: z.string().optional(),
  title: z.string(),
  x: z.number().int(),
  y: z.number().int(),
  width: z.number().int(),
  height: z.number().int(),
  is_minimized: z.boolean(),
  is_maximized: z.boolean(),
  ram_bytes: z.number().int(),
  z_order: z.number().int(),
});

export const TabSchema = z.object({
  id: z.string(),
  window_id: z.string(),
  session_id: z.string(),
  url: z.string(),
  title: z.string(),
  fav_icon_url: z.string().nullable().optional(),
  tab_index: z.number().int(),
  is_active: z.boolean(),
});

export const InsertTabInputSchema = z.object({
  id: z.string(),
  window_id: z.string(),
  session_id: z.string(),
  url: z.string(),
  title: z.string(),
  fav_icon_url: z.string().optional(),
  tab_index: z.number().int(),
  is_active: z.boolean(),
});

export const SettingSchema = z.object({
  key: z.string(),
  value: z.string(),
  updated_at: z.number().int(),
});

export const WindowRectSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
  width: z.number().int(),
  height: z.number().int(),
});

export const RawWindowSchema = z.object({
  hwnd: z.string(),
  hwnd_val: z.number().int(),
  title: z.string(),
  class_name: z.string(),
  process_id: z.number().int(),
  process_name: z.string(),
  exe_path: z.string().nullable().optional(),
  rect: WindowRectSchema,
  is_visible: z.boolean(),
  is_minimized: z.boolean(),
  is_maximized: z.boolean(),
  ram_bytes: z.number().int(),
  is_elevated: z.boolean(),
  z_order: z.number().int(),
});

export const ProcessInfoSchema = z.object({
  pid: z.number().int(),
  name: z.string(),
  exe_path: z.string().nullable().optional(),
  ram_bytes: z.number().int(),
  is_elevated: z.boolean(),
});

export const MemoryStatsSchema = z.object({
  total_ram_bytes: z.number().int(),
  used_ram_bytes: z.number().int(),
  available_ram_bytes: z.number().int(),
  memory_load_percentage: z.number().int(),
});

export const SessionSnapshotSchema = z.object({
  timestamp: z.number().int(),
  windows: z.array(RawWindowSchema),
  total_ram_saved_bytes: z.number().int(),
});

export const ForegroundChangedPayloadSchema = z.object({
  hwnd: z.string(),
  title: z.string(),
  pid: z.number().int(),
});

export const WindowLifecyclePayloadSchema = z.object({
  event_type: z.string(),
  hwnd: z.string(),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;
export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceInputSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type CreateSessionInput = z.infer<typeof CreateSessionInputSchema>;
export type WindowData = z.infer<typeof WindowSchema>;
export type InsertWindowInput = z.infer<typeof InsertWindowInputSchema>;
export type TabData = z.infer<typeof TabSchema>;
export type InsertTabInput = z.infer<typeof InsertTabInputSchema>;
export type Setting = z.infer<typeof SettingSchema>;
export type WindowRect = z.infer<typeof WindowRectSchema>;
export type RawWindow = z.infer<typeof RawWindowSchema>;
export type ProcessInfo = z.infer<typeof ProcessInfoSchema>;
export type MemoryStats = z.infer<typeof MemoryStatsSchema>;
export type SessionSnapshot = z.infer<typeof SessionSnapshotSchema>;
export type ForegroundChangedPayload = z.infer<typeof ForegroundChangedPayloadSchema>;
export type WindowLifecyclePayload = z.infer<typeof WindowLifecyclePayloadSchema>;

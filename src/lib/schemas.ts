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

export const StashResultSchema = z.object({
  session_id: z.string(),
  workspace_id: z.string(),
  window_count: z.number().int(),
  ram_saved_bytes: z.number().int(),
  minimized_count: z.number().int(),
});

export const RestoreResultSchema = z.object({
  session_id: z.string(),
  workspace_id: z.string(),
  restored_count: z.number().int(),
});

export const QuickSwitchResultSchema = z.object({
  stashed: StashResultSchema,
  restored: RestoreResultSchema,
});

export const WindowMoveDiffSchema = z.object({
  process_name: z.string(),
  title: z.string(),
  old_x: z.number().int(),
  old_y: z.number().int(),
  new_x: z.number().int(),
  new_y: z.number().int(),
});

export const SessionDiffSchema = z.object({
  added_windows: z.array(RawWindowSchema),
  removed_windows: z.array(RawWindowSchema),
  moved_windows: z.array(WindowMoveDiffSchema),
  unchanged_count: z.number().int(),
});

export const UndoItemSchema = z.object({
  id: z.string(),
  action_type: z.string(),
  workspace_id: z.string(),
  session_id: z.string(),
  timestamp: z.number().int(),
  window_hwnds: z.array(z.string()),
});

export const AutoSnapshotIntervalSchema = z.enum(["off", "5m", "15m", "30m"]);
export const RestoreConflictModeSchema = z.enum(["overwrite", "skip"]);
export const LicenseTierSchema = z.enum(["free", "pro"]);

export const AppSettingsSchema = z.object({
  autostart_on_boot: z.boolean(),
  minimize_to_tray: z.boolean(),
  close_to_tray: z.boolean(),
  language: z.string().default("en-US"),
  auto_snapshot_interval: AutoSnapshotIntervalSchema,
  restore_conflict_mode: RestoreConflictModeSchema,
  minimize_on_stash: z.boolean(),
  extension_bridge_enabled: z.boolean(),
  auto_stash_tabs: z.boolean(),
  license_tier: LicenseTierSchema,
  license_key: z.string(),
  machine_id: z.string(),
});

export const ExportDataSchema = z.object({
  version: z.string(),
  exported_at: z.string(),
  workspaces: z.array(WorkspaceSchema),
  sessions: z.array(SessionSchema),
});

export const WsTabItemSchema = z.object({
  id: z.number().nullable().optional(),
  window_id: z.number().nullable().optional(),
  url: z.string(),
  title: z.string(),
  fav_icon_url: z.string().nullable().optional(),
  active: z.boolean().nullable().optional(),
  index: z.number().nullable().optional(),
});

export const WsStatusPayloadSchema = z.object({
  connected: z.boolean(),
  client_count: z.number().int(),
  port: z.number().int(),
});

export const LicenseStatusSchema = z.object({
  valid: z.boolean(),
  tier: z.string(),
  machine_id: z.string(),
  expires_at: z.number().int().nullable().optional(),
  is_pro: z.boolean(),
});

export type AutoSnapshotInterval = z.infer<typeof AutoSnapshotIntervalSchema>;
export type RestoreConflictMode = z.infer<typeof RestoreConflictModeSchema>;
export type LicenseTier = z.infer<typeof LicenseTierSchema>;
export type AppSettings = z.infer<typeof AppSettingsSchema>;
export type ExportData = z.infer<typeof ExportDataSchema>;
export type WsTabItem = z.infer<typeof WsTabItemSchema>;
export type WsStatusPayload = z.infer<typeof WsStatusPayloadSchema>;
export type LicenseStatus = z.infer<typeof LicenseStatusSchema>;

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
export type StashResult = z.infer<typeof StashResultSchema>;
export type RestoreResult = z.infer<typeof RestoreResultSchema>;
export type QuickSwitchResult = z.infer<typeof QuickSwitchResultSchema>;
export type WindowMoveDiff = z.infer<typeof WindowMoveDiffSchema>;
export type SessionDiff = z.infer<typeof SessionDiffSchema>;
export type UndoItem = z.infer<typeof UndoItemSchema>;

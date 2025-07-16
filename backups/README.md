# Fixlify Backups Directory

This directory contains all backups for the Fixlify project, organized by date and purpose.

## Backup Structure

### Date-based Backups
- `2025-01-16/` - January 16, 2025 backup
- `2025-07-16/` - July 16, 2025 backup (latest)

### Feature-specific Backups
- `backup_2025_07_08/` - Full project backup from July 8, 2025
- `backup_2025_07_12/` - Backup from July 12, 2025 (src folder only)
- `backup_automation_fix_2024/` - Automation-related files backup
- `backup_before_sms_email_2025_07_10/` - Backup before SMS/Email implementation

### Source Code Backups
- `src_backup_20250711-190145/` - Source backup from July 11, 19:01:45
- `src_backup_before_restore_20250711-183654/` - Source backup before restore on July 11, 18:36:54

### Supabase Backup
- `supabase-backup/` - Complete Supabase backup including:
  - Database schemas and migrations
  - Edge functions
  - Configuration files
  - Storage bucket structure
  - Authentication settings
  - Backup and restore scripts

### Zip Archives
- `backup_2025_07_08.zip` - Compressed version of July 8 backup
- `backup_2025_07_08_2025-07-08_13-04-24.zip` - Timestamped version
- `backup_2025_07_12.zip` - Compressed version of July 12 backup
- `backup_before_sms_email_2025_07_10.zip` - Pre-SMS/Email implementation
- `backup_pre_sms_email_implementation_2025_07_10.zip` - Alternative pre-SMS backup

## Backup Guidelines

1. **Regular Backups**: Create backups before major changes
2. **Naming Convention**: Use descriptive names with dates (YYYY_MM_DD format)
3. **Compression**: Create .zip files for long-term storage
4. **Documentation**: Include README files in each backup explaining what was backed up

## Important Notes

- The `supabase-backup` folder contains the most comprehensive backup system
- Always backup both local files AND Supabase data before major changes
- Keep at least 3 recent backups for safety
- Test restore procedures periodically

## Quick Restore

To restore from a backup:
1. Choose the appropriate backup folder/zip
2. For Supabase: Follow instructions in `supabase-backup/RESTORE_GUIDE.md`
3. For source files: Copy the files back to their original locations
4. Always test in a development environment first

Last updated: July 16, 2025

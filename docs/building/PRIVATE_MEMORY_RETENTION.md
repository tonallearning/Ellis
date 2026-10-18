# Private memory retention — P3

Approved by Ty: retain until deletion; corrections with links; rebuild after
source deletion.

- Completed exchanges persist until Ty deliberately deletes them. No visitor
  decay job applies. Incomplete streams are not committed by this repository.
- One source record contains an inbound/outbound pair. A correction appends a
  linked source record with corrected inbound wording; it does not fabricate a
  replacement Ellis reply. Original wording remains available as history until
  deletion, but superseded records are excluded from active derived memory.
- Deleting any version deletes its whole correction lineage, including replies
  paired with those sources, to avoid retaining the same content in an answer
  or restoring an obsolete version. The operation rebuilds that relation's
  derived memory atomically from surviving sources. Other relationships are
  unchanged.
- P3 derives bounded, explicitly attributed episode excerpts only. It does not
  infer facts, preferences, or emotional residue. Every episode references one
  source record, which retains original envelope provenance. Later derivation
  can expand this without changing source authority.
- Opaque source IDs, relation IDs, hashes of client request IDs, and deletion timestamps
  remain as tombstones to prevent a stale retry from resurrecting deleted data.
  Tombstones contain no message content. New intentionally authored messages
  require new IDs.
- The active database deletion is transactional. It does not erase historical
  provider backups, WAL, exports, browser transcripts, or copies already carried
  elsewhere. No immediate backup-purge promise is made. No raw private content
  goes into application logs or errors.
- Before production activation, verify the actual project's backup/PITR tier,
  retention interval, operator access, and restore procedure. Those deployment
  settings are currently unverified. Supabase retention depends on plan and
  configuration: [official backup documentation](https://supabase.com/docs/guides/platform/backups).
- Restore into isolation, keep private routes closed, replay all deletions
  newer than the restored snapshot from a separately retained deletion manifest,
  rebuild derived memory, and verify isolation before reopening. If a complete
  deletion manifest is unavailable, private access stays closed until Ty
  resolves the restore. Export/replay automation is a production activation
  prerequisite; P3 does not silently claim it exists.

P3 migrations and tests are local. They must not be applied to a remote database
merely to test them. No existing public data is migrated or mixed into private
relations.

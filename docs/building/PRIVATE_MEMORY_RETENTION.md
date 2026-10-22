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
  source record, which retains original envelope provenance. Private turn
  assembly now reads a bounded exact-source window for the active relation;
  derived episodes older than that window remain explicitly lossy landmarks
  and never substitute for omitted wording.
- Opaque source IDs, relation IDs, hashes of client request IDs, and deletion timestamps
  remain as tombstones to prevent a stale retry from resurrecting deleted data.
  Tombstones contain no message content. New intentionally authored messages
  require new IDs.
- The active database deletion is transactional. It does not erase historical
  provider backups, WAL, exports, browser transcripts, or copies already carried
  elsewhere. The private room retains the latest 50 displayed messages per
  relation in device-local `localStorage`; server deletion does not clear that
  browser copy automatically. No immediate backup-purge promise is made. No raw
  private content goes into application logs or errors.
- The owner-history archive stores 200 surviving public owner summaries at
  `legacy_excerpt` fidelity and future completed public Ty turns at
  `exact_public_turn` fidelity. The archive is retained until deliberate
  deletion and does not inherit the public row's 200-beat rolling eviction.
  Deleting a private exchange does not implicitly delete a distinct public
  owner record; deletion tools must name each source store explicitly.
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

The P3 source, exact-source reader, and owner-history recovery migrations are
applied to Ellis's dedicated project and tested locally in embedded Postgres.
Public owner episodes were copied to a separate archive with their limited
fidelity intact. They were not rewritten as private courier exchanges.

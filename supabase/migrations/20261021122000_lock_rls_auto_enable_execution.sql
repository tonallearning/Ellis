-- The existing ensure_rls event trigger runs this function as its owner.
-- It is not an application RPC and must not be callable through the Data API.
revoke all on function public.rls_auto_enable() from public, anon, authenticated;

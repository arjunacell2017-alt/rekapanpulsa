## Monetary input
- The home reseller form retains editable text and uses the shared Rupiah parser before sending numeric whole-rupiah values to its save callback, so pasted locale separators cannot corrupt stored balances.

## Authentication
- Restore sessions through the official SDK's INITIAL_SESSION event and validate identity with getUser before loading server-backed roles; keep same-user checks in the background to preserve dashboard state.
- Guard asynchronous auth checks with a generation counter, and only clear local auth state after provider logout succeeds, so stale requests and failed logout cannot resurrect or falsely end a session.
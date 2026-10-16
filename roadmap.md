# Login persistence
- [x] Audit existing session storage, refresh and landing links: official persistence and automatic refresh already enabled; hosted lifetime policies unavailable to read.
- [x] Harden recovery and logout only where needed, preserving same-user dashboard state.
- [x] Verify real-account recovery, navigation, refresh, tab switching and logout; report unavailable checks: Admin tested, client accounts unavailable; managed test session rejects refresh-token grant; browser reopening tested with restored browser storage rather than a physical browser profile.
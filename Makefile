.PHONY: accept

# Tier 2 acceptance suite (containerised litewrite + remoteStorage + Playwright).
# Same command on a laptop and in CI; see CLAUDE.md.
accept:
	./scripts/accept.sh

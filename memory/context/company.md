# Company Context

## About
**SODAX** — Cross-chain DeFi infrastructure. Intent-based swaps, money market (lending/borrowing), bridging, and SODA token staking across 17 blockchains. Hub chain is Sonic (EVM). Production site: sodax.com.

## Tools & Systems
| Tool | Used for |
|------|----------|
| GitHub | `icon-project/sodax-frontend` monorepo |
| Vercel | Hosting (dev/staging/production) |
| MongoDB | CMS + auth backend |
| Notion | Content sourcing |
| npm | SDK packages published publicly |
| pnpm + Turborepo | Monorepo management |
| Biome | Linting + formatting |
| better-auth | Authentication |

## Teams
| Team | What they do | Key people |
|------|--------------|------------|
| (To be filled in) | | Anton, Robbie, Alex, David, Min |

## Processes
| Process | What it means |
|---------|---------------|
| Git flow | main (dev) → staging → production |
| SDK publish | Tag-triggered GitHub Actions → npm |
| CI | Lint, build, typecheck on push/PR |

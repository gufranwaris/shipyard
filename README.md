# Shipyard

Repository scaffold for the Shipyard build worker.

## Structure

- `apps/build-worker` - worker app scaffold
- `storage` - local build and artifact output
- `scripts` - utility scripts for seeding and enqueueing jobs

## Root Commands

Use these from the repository root:

- `npm run dev` - bring up the dev compose stack
- `npm run down` - stop the dev compose stack
- `npm run restart` - restart the dev compose stack
- `npm run reset` - stop the stack and clear local build/artifact storage
- `npm run logs` - follow dev stack logs
- `npm run ps` - list dev stack containers
- `npm run cleanup` - clear local build/artifact storage only

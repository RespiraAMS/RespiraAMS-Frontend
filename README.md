# RespiraAMS-Frontend

This is frontend project for RespiraAMS

## Getting Started

### Setting up .env

```env
NEXT_PUBLIC_API_VERSION=v1 # Or actual API version
NEXT_PUBLIC_API_URL=https://localhost:7283 # Or actual API Gateway URL
SESSION_SECRET=<YOUR-SESSION-SECRET-KEY>
JWT_SECRET=<JWT-SECRET> # Must match with backend key
```

```bash
# cd to the project directory
cd respira-ams

# install dependencies
npm install

# start the development server
npm run dev

# You can also run some predefined scripts
npm run typecheck # type check
npm run lint # lint
npm run format # format
```

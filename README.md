# Zero to Redis

What if you could start a Redis instance in less than 10 seconds? Well, now you can!

# Guiding Principles

- Testing: backend logic is tested using VCR technique (fast isolated unit tests)
- Minimalist dependencies: use node test framework, express and parcel
- Simplicity: use state machine to simplify frontend code

# Usage

```
cd projects/backend
npm ci
export RAILWAY_API_TOKEN=YOUR_TOKEN
npm start
```

```
cd projects/frontend
npm ci
npm start
```

```
open http://localhost:1234/
```

# Tests

The backend has a fairly comprehensive test suite.

```
cd projects/backend
npm ci
npm test
```

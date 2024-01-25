- [ ] frontend error handling: what if the server responds with a 5xx?
- [ ] show my name in /api/me

```
query me {
  me {
    ...UserFields
  }
}

fragment UserFields on User {
  id
  email
  name
}
```
- [ ] restart last deployment

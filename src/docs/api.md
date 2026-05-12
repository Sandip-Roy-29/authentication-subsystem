## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/health` | Health check route |


---

## API Response Status

| Status Code | Meaning |
|---|---|
| 200 | Success |
| 201 | User created |
| 400 | Bad request |
| 401 | Unauthorized |
| 500 | Internal server error |

---
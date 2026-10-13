# Phase 15 — AI Chatbot / Business Assistant

## Delivered
- Customer-facing AI assistant at `/chat`.
- Public catalog-aware deterministic fallback so the chatbot works without an AI key.
- Optional Gemini integration through `GEMINI_API_KEY` and `GEMINI_MODEL`.
- Catalog retrieval context from active products.
- FAQ/business-service guidance based only on supplied company positioning.
- Authenticated customer context for the signed-in user's recent orders, invoices and appointments.
- Safe response instructions: do not invent company prices, certifications, hours, addresses, stock, guarantees or policies.
- Rate limiting on chatbot requests.
- Quick prompts and contextual links to Products, Recommendations, Quotations and Appointments.

## API
- `GET /api/chatbot/config`
- `POST /api/chatbot/chat`

## Environment
Optional:
```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```
Without a key, the deterministic catalog assistant remains available.

## Architecture
Browser → `/api/chatbot/chat` → optional authentication → catalog/customer context retrieval → Gemini (optional) → deterministic fallback → response.

## Production notes
- Add server-side logging/monitoring before production.
- Keep Gemini key only on the server; never expose it in Vite/client environment variables.
- Review company-approved facts, business hours, pricing, payment policies and contact details before enabling them in chatbot context.

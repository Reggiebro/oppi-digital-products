# HN 46197005 — Freelancers are losing ~30% of their time and revenue to tool fragmentation
- URL: https://news.ycombinator.com/item?id=46197005
- Date: 2025-12-08
- Category fit: Notion CRM templates + client delivery workflows (freelancer operations)
- Relevance: Author describes work scattered across Gmail/WhatsApp/Notion/spreadsheets with lost tracking, disputes, and revenue leakage — strong fit for lightweight CRM + delivery workflow consolidation.

## Value-first reply draft (review/tailor before posting)

The pattern you describe (projects in chat, portfolio in Notion, payments/links elsewhere, invoices in sheets) usually improves most with one “source of truth” for state, not necessarily more tools.

A minimal structure that works for many solo freelancers:

1. **One Clients/Deals table (CRM).** Fields: client, status (lead → proposal → active → delivered → closed), value, next action, next follow-up date, source, and links to thread/docs. A “follow-ups due” view prevents the silent drops.
2. **One Projects/Deliverables table linked to clients.** Fields: scope summary, due date, status, asset/doc link, revision count/limit, and approval status. This is what protects you in disputes (“what was agreed, what was delivered, when”).
3. **One Payments/Invoices log linked to projects.** Invoice amount/date, paid date, payment link/ref, and outstanding balance. Even a simple view of “unpaid + delivered” catches leakage quickly.
4. **Templates for the handoffs.** Intake form/checklist, proposal with scope+exclusions+revisions, delivery/update message, and a closeout/handoff note. Revisions/approvals should live on the project record, not only in chat.
5. **Keep chat/email as communication channels, not the system of record.** After key decisions (scope change, approval, payment promise), copy the outcome/link back to the project record.

Notion can work fine for this if the schema stays small (few databases, clear relations/views) rather than a sprawling dashboard.

Free sample blueprint/cheat sheet (no signup), if useful as a starting point: https://gist.github.com/Reggiebro/85122464c52cc24198ce7c1ef1828636
Optional full kit overview: https://reggiebro.github.io/oppi-digital-products/#product-notion-crm

If you can share the most common failure mode from your interviews (missed follow-up, revision creep, or unpaid invoices), I can suggest the smallest schema that targets that specific leak first.

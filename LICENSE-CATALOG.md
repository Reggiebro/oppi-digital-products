# License — Reggiebro/oppi-digital-products

This repository contains two categories of content with different licensing.

## 1. Software — MIT License

The software in this repository — the MCP server (`mcp-server/`), helper tools (`tools/`),
agent skill definitions (`skills/`), site/build configuration, and documentation about the
storefront itself — is released under the MIT License:

> **MIT License**
>
> Copyright (c) 2026 Reggiebro (oppi-digital-products)
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

## 2. Product content — commercial, all rights reserved

The digital products sold through this storefront — the full prompt packs, the Notion
CRM & Pipeline Kit templates, and their paid archives (`*.tar.gz`) — are **commercial
products, all rights reserved**.

- The **free preview samples** in `previews/` are provided for evaluation and personal
  use only.
- **Paid product content may not be redistributed, republished, or resold** without a
  license. Bundle and team licensing inquiries: open an issue in this repository.

## 3. Team and agency licenses

These grant broader use of the paid product content. They are **perpetual, non-exclusive,
and non-transferable**, and they replace the single-user terms above for the seats covered.

### 3.1 Team License — $79

- Up to **10 named users** within one organisation (employees or contractors).
- **Internal business use only**: drafting client communications, internal SOPs, training,
  and day-to-day operations.
- The material may be customised for internal use.
- **Not permitted:** embedding the prompt/template text in deliverables handed to clients,
  publishing it, or reselling it.

### 3.2 Agency License — $149

- Up to **25 named users** within one organisation.
- Includes everything in the Team License, **plus** the right to embed the material in
  **paid client deliverables** (SOPs, onboarding packs, content systems, workflow docs).
- **Not permitted:** selling the packs as standalone products, publishing them publicly,
  or sublicensing them to other agencies.

### 3.3 Custom workflow engagement — $150

- One workflow: up to **6 prompts** plus a one-page usage guide, written for the
  commissioning organisation, with one revision.
- Delivered material is licensed to the commissioning organisation for internal use.
- Reggiebro retains the right to reuse general techniques and patterns, but not the
  organisation's confidential inputs.

### 3.4 Common terms

- Seats are **contractual**, not enforced by technical access control. There is no account
  system and no telemetry.
- Licenses start on delivery, after payment is verified on-chain.
- Volume pricing (26+ seats), white-label, and resale rights are quoted separately.
- Full offer and process: [`B2B.md`](B2B.md).

---

*This file is referenced by `mcp-server/package.json` (`"license": "MIT"` for the server;
this file governs the paid product content).*

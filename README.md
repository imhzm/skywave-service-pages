# Sky Wave service pages

Three independent Arabic, right-to-left static websites for verified Sky Wave service areas:

- `1/` — digital services for clinics
- `2/` — digital marketing for real estate projects
- `3/` — workflow automation and WhatsApp bots

Each site uses plain HTML, CSS, and JavaScript. There is no package installation or build step. To preview them from the workspace root:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/1/`, `http://127.0.0.1:8000/2/`, or `http://127.0.0.1:8000/3/`.

The sites describe Sky Wave's published services. Their contact buttons open a service-specific WhatsApp draft addressed to Sky Wave; the visitor must send it. The first page references a published clinic website from Sky Wave's portfolio; the third references the WhatsApp bot entry in the official portfolio. The real-estate page's architecture image is explicitly labeled as an illustration and does not represent a real listing or completed project. Project-specific pricing, inventory, availability, customer reviews, performance claims, and medical facts are omitted unless an approved source is provided.

Official business contact details displayed on each site:

- Phone: +20 106 789 4321
- Email: admin@skywaveads.com
- Address: Emirates Street, New Damietta, Egypt

Each numbered folder can be deployed as an independent static site. The domain and hosting mapping should be set only after its DNS target and document root are confirmed.

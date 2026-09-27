# Deployment notes

The three sites are independent static roots served by Nginx:

| Hostname | Document root |
| --- | --- |
| `clinics.skywaveads.com` | `/var/www/skywave-service-pages/current/1` |
| `realestate.skywaveads.com` | `/var/www/skywave-service-pages/current/2` |
| `automation.skywaveads.com` | `/var/www/skywave-service-pages/current/3` |

`deploy/nginx/skywave-service-pages.conf` is the isolated Nginx site configuration. It does not replace existing virtual hosts. It serves ACME challenge files from `/var/www/certbot`, keeps dotfiles inaccessible, and applies basic response headers.

Before issuing certificates, create A records for the three approved hostnames at the DNS provider that manages `skywaveads.com` and verify that they resolve to this Nginx host. Then validate the Nginx configuration, request certificates with Certbot, enable HTTPS redirects, and test each hostname and renewal path.

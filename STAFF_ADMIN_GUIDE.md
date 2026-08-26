# Phanindranath Staff Portal Guide

The public website for **Phanindranath Nursery School & Phanindranath Kindergarten House** is available to every visitor. The staff workspace is deliberately separate at `/admin` and is only available through the existing OAuth sign-in flow to accounts with the `admin` role.

## Granting staff access

After a staff member signs in once with their approved account, an existing administrator can promote that account in the project database. Use the database management panel or execute the following query after replacing the email address with the staff member’s confirmed account email:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'staff.member@example.com';
```

Only grant this role to trusted staff who should be able to publish, edit, or remove images on the public website. Administrators can open `/admin`, while signed-out or non-administrator accounts see an access message and cannot call the protected gallery procedures.

## Managing gallery content

Open `/admin` and select **Add gallery moment**. Provide a concise title, a descriptive accessibility caption, a category, and a display order. Images are resized in the browser before they are uploaded, then stored through the site’s secured file storage. Use the **Publish on the public gallery** switch to hold an item for review before it appears publicly.

The public gallery shows only entries that are published, ordered by their display order. Editing an entry changes its public title, accessible description, category, position, and publication state. Removing an entry deletes its database record and public reference; staff should remove content only when it is no longer appropriate to display.

## Safeguarding children’s privacy

Before publishing, confirm that the image is approved for the website, does not reveal sensitive details, and has an accurate alt text description. Gallery access is secured by the application, but content decisions remain the responsibility of the school’s authorized staff.

## Antigravity QA handoff

The protected route, role boundaries, gallery validation, and public listing behavior are covered by the project’s automated checks. When testing with Antigravity, sign in with an approved administrator account, visit `/admin`, confirm that the gallery manager and existing entries load, and then verify that an unprivileged account sees the staff-access message instead.

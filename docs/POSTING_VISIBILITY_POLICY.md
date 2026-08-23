# Bazar360 Posting Visibility Policy

## Listing ownership

Every listing must have a real creator and one of two posting modes:

- `individual`: owned by the posting user.
- `showroom`: posted on behalf of a specific showroom and linked by `showroomId`/`dealerId`.

## Posting date/time privacy

`createdAt` and `updatedAt` are operational metadata. They may be displayed in private management views only when the viewer is:

- the listing owner;
- the associated showroom owner;
- an authorized Admin/Super Admin.

They must not be rendered in public visitor listing cards, public vehicle pages, or public showroom pages unless a future product decision explicitly changes this policy.

## Public data

Visitors may see marketplace information needed to evaluate a vehicle, but not internal management metadata such as creator identity, internal audit timestamps, assignment IDs, moderation notes, or private lead metadata.

## Real-data rule

No listing may be created with demo/stock vehicle media or fabricated vehicle facts. Public inventory must be derived from valid published records and approved media only.

# Profile Debug Handoff (for Claude)

## Context
HostFlows profile/branding feature was implemented, but deployment/runtime drift caused repeated regressions between:
- frontend submission method (`post` vs `patch`, `_method` spoofing),
- backend route definitions (`profile.show` vs `profile.edit`, POST fallback),
- cached/build artifacts and route cache on server.

## Canonical commit with full profile feature
- `3052aa1` — `Profile: add branding fields, logo upload/remove, profile show page, and Inertia/user sharing updates`

Export full patch:
```bash
git show 3052aa1 > /tmp/profile_changes_3052aa1.patch
```

## Files touched in canonical commit
- `app/Http/Controllers/ProfileController.php`
- `app/Http/Middleware/HandleInertiaRequests.php`
- `app/Http/Requests/ProfileUpdateRequest.php`
- `app/Models/User.php`
- `database/migrations/2026_04_12_120000_add_profile_branding_fields_to_users.php`
- `resources/js/Layouts/AuthenticatedLayout.jsx`
- `resources/js/Pages/Profile/Edit.jsx`
- `resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.jsx`
- `resources/js/Pages/Profile/Show.jsx`
- `routes/web.php`

## Primary issues encountered
1. **405 Method Not Allowed** on `/profile`
   - Cause: frontend sending POST without guaranteed `_method=patch`, while backend sometimes had only PATCH route.
   - Temporary mitigation: add POST fallback route to same update action.

2. **500 after submit**
   - Cause: mixed deployment state:
     - controller/layout referencing `profile.show`
     - routes still mapping `/profile` to `profile.edit` only.
   - Result: route-name mismatch at runtime.

3. **Frontend bundle/cache drift**
   - Source looked updated, but network payload/chunks reflected older code.
   - Required rebuild + cache clear.

4. **Build permission issues**
   - Vite failed with EACCES deleting `public/build/assets`.
   - Needed owner/permission alignment before build.

## Current verification commands used repeatedly
```bash
php artisan route:list | grep profile
grep -n "Redirect::route('profile" app/Http/Controllers/ProfileController.php
grep -n "profile.show\|profile.edit" resources/js/Layouts/AuthenticatedLayout.jsx
grep -n "Route::get('/profile'" routes/web.php
grep -n "_method: 'patch'" resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.jsx
```

## Deployment consistency checklist
```bash
git pull --ff-only origin main
php artisan optimize:clear
npm run build
```

If permission error appears:
```bash
chown -R www-data:www-data public/build storage bootstrap/cache
chmod -R u+rwX,g+rwX public/build storage bootstrap/cache
```

## Recommended stabilization strategy for Claude
1. Pick one route model and make all references consistent in one commit:
   - Option A: `/profile` => `profile.edit` only
   - Option B: `/profile` => `profile.show`, `/profile/edit` => edit
2. Keep frontend submit deterministic:
   - either `router.patch(...)`
   - or `router.post(..., { _method: 'patch' }, { forceFormData: true })`
3. Keep backend compatibility route if needed:
   - `Route::post('/profile', [ProfileController::class, 'update']);`
4. Ensure final state validated with route:list + payload inspection + cache clear/build.

## Notes
- The user deploys directly on server and via GitHub PR merges.
- They prefer minimal-risk changes and high deployment reliability.

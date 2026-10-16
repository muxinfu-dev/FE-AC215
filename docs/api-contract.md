# FurCast Dashboard — API Contract (draft v0.1)

The backend needed by the shelter-side dashboard frontend. Field names and types match `src/types/animal.ts` exactly, so swapping mock data for API calls requires almost no changes to the frontend components.

## Conventions

- **Base path**: `/api/v1`
- **Format**: JSON, **camelCase** field names (if the backend uses FastAPI + Pydantic, use `alias_generator=to_camel` so internal Python stays snake_case while external output is camelCase)
- **Dates**: `"2026-09-26"` (ISO date); timestamps use ISO 8601 with time zone
- **Auth**: every request carries `Authorization: Bearer <token>`; the backend derives the current staff member and shelter from the token, and the frontend does not pass `staff` or `shelterId`
- **Error format**:

```json
{ "error": { "code": "ANIMAL_NOT_FOUND", "message": "Animal 9999 not found" } }
```

| HTTP | When |
|---|---|
| 400 | Invalid parameters (e.g., `sort` not in the allowed values) |
| 401 | Not logged in / token expired |
| 404 | Animal or suggestion not found |
| 409 | State conflict (e.g., the suggestion was already handled by someone else) |

---

## 1. Dashboard summary

`GET /api/v1/dashboard/summary`

Feeds the 4 stat cards at the top and the model info at the bottom. Counts cover **all** animals at the shelter and are unaffected by table filters.

**Response 200**

```json
{
  "date": "2026-09-26",
  "availableForAdoption": 64,
  "attentionNeeded": 12,
  "prioritiesToday": 18,
  "suggestionsActedThisWeek": 9,
  "modelVersion": "v1.3",
  "suggestionsUpdatedAt": "2026-09-26T06:00:00-04:00"
}
```

> Note: the mock data has `suggestionsUpdatedAt` as `"6:00 AM"`; the real API should return a timestamp, which the frontend formats into a time.

---

## 2. Animal list (table)

`GET /api/v1/animals`

All filtering, search, sorting, and pagination are done by the backend. The query parameters map one-to-one to the frontend's `AnimalQuery` (`src/lib/animalQuery.ts`); right now the frontend computes them itself, and once wired up it just passes them through.

**Query parameters**

| Param | Type | Example | Notes |
|---|---|---|---|
| `tier` | `attention` \| `moderate` \| `likely_soon` | `attention` | Omit = all |
| `species` | comma-separated | `Dog,Cat` | Omit = all |
| `ageGroup` | comma-separated | `Adult,Senior` | Omit = all |
| `search` | string | `lu` | Fuzzy match on name / ID / breed, case-insensitive |
| `sort` | `name` \| `daysInShelter` \| `estimatedRemainingDays` \| `priorityTier` | `estimatedRemainingDays` | Omit = default order |
| `order` | `asc` \| `desc` | `desc` | Default `asc` |
| `page` | int ≥ 1 | `1` | Default 1 |
| `pageSize` | int 1–100 | `6` | Default 6 |

`priorityTier` sort order: `attention` < `moderate` < `likely_soon` (i.e., most urgent first under ascending).

**Example**

```
GET /api/v1/animals?tier=attention&species=Dog&sort=daysInShelter&order=desc&page=1&pageSize=6
```

**Response 200**

```json
{
  "items": [
    {
      "id": "3987",
      "name": "Bruno",
      "species": "Dog",
      "breed": "Pit Bull Mix",
      "ageGroup": "Adult",
      "daysInShelter": 63,
      "estimatedRemainingDays": 41,
      "priorityTier": "attention",
      "photoUrl": "https://cdn.example.com/animals/3987.jpg"
    }
  ],
  "total": 5,
  "page": 1,
  "pageSize": 6,
  "pageCount": 1,
  "openSuggestionCount": 9
}
```

- `items` only carries the fields the table needs (`AnimalListItem`); full details come from endpoint 3
- `total` is the total after filtering, used for "Showing 1-6 of N" and pagination
- `openSuggestionCount`: total open suggestions under the current filters, used in the hint banner
- If `page` exceeds the range, return the last page and set `page` to the actual page number

---

## 3. Animal detail (right panel)

`GET /api/v1/animals/{id}`

Called when a row is clicked. Returns the full `Animal`.

**Response 200**

```json
{
  "id": "4810",
  "name": "Luna",
  "species": "Dog",
  "breed": "Mixed",
  "ageGroup": "Adult",
  "daysInShelter": 25,
  "estimatedRemainingDays": 34,
  "priorityTier": "attention",
  "photoScore": 42,
  "photoFeedback": "This photo is slightly dark and taken from above. ...",
  "photoUrl": "https://cdn.example.com/animals/4810.jpg",
  "isFeaturedOnHomepage": false,
  "suggestions": [
    {
      "id": "s-4810-1",
      "message": "Her cover photo could be brighter.",
      "actionLabel": "Retake photo",
      "status": "open"
    }
  ],
  "actionHistory": [
    {
      "id": "a-4810-1",
      "description": "Bio refreshed",
      "staff": "Staff A",
      "date": "2026-09-22"
    }
  ]
}
```

- `suggestions` returns all statuses (`open` / `done` / `dismissed`); the frontend decides what to show
- `actionHistory` sorted by time ascending; suggest returning at most the most recent 20

**Response 404**: animal doesn't exist

---

## 4. Update suggestion status (check / uncheck / Dismiss)

`PATCH /api/v1/animals/{animalId}/suggestions/{suggestionId}`

Corresponds to the checkbox and the Dismiss button. **These actions are training feedback for the model** (the prototype's "Staff actions and dismissals are logged to help improve future model suggestions"), so the backend must persist every change.

**Request body**

```json
{ "status": "dismissed", "reason": "already in progress" }
```

| Field | Required | Notes |
|---|---|---|
| `status` | yes | `open` (uncheck) \| `done` (mark complete) \| `dismissed` |
| `reason` | no | Optional reason when dismissing; the frontend doesn't collect it yet |

**Response 200**: returns the updated suggestion and the newly created action log (`actionLog` is `null` on uncheck)

```json
{
  "suggestion": {
    "id": "s-4810-1",
    "message": "Her cover photo could be brighter.",
    "actionLabel": "Retake photo",
    "status": "dismissed"
  },
  "actionLog": {
    "id": "a-4810-3",
    "description": "Suggestion dismissed: \"already in progress\"",
    "staff": "Jessica Martinez",
    "date": "2026-09-26"
  }
}
```

**Backend side effects**:
1. Update the suggestion status
2. Write an `actionHistory` entry for `done` / `dismissed`
3. Write a feedback event (`animalId, suggestionId, status, reason, staffId, modelVersion, timestamp`) for model monitoring and retraining

**Response 409**: the suggestion has already been dismissed by someone else, etc.

---

## 5. Upload photo (Upload Photo button, not yet built on the frontend)

`POST /api/v1/animals/{id}/photo`

`Content-Type: multipart/form-data`, field name `file`.

**Response 200**: returns the new photo URL and the photo scoring model's result

```json
{
  "photoUrl": "https://cdn.example.com/animals/4810-v2.jpg",
  "photoScore": 78,
  "photoFeedback": "Bright, eye-level photo. Much better."
}
```

If scoring is slow, it can be made asynchronous: return `202` with a `photoScore` of `null` first, and the frontend polls endpoint 3.

---

## Frontend TypeScript types

The detail and summary types already live in `src/types/animal.ts`. To add once wired up:

```ts
// One table row (endpoint 2)
export type AnimalListItem = Pick<
  Animal,
  "id" | "name" | "species" | "breed" | "ageGroup" |
  "daysInShelter" | "estimatedRemainingDays" | "priorityTier" | "photoUrl"
>;

export interface AnimalListResponse {
  items: AnimalListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  openSuggestionCount: number;
}

export interface UpdateSuggestionResponse {
  suggestion: Suggestion;
  actionLog: ActionLog | null;
}
```

## Mapping frontend interactions → API

| Frontend action | Now (mock) | After wiring |
|---|---|---|
| Page load | `mockSummary` | `GET /dashboard/summary` |
| Search / filter / sort / paginate | `queryAnimals()` computed on the frontend | `GET /animals?...` |
| Click a row | `animals.find(...)` | `GET /animals/{id}` |
| Check / uncheck / Dismiss | `setAnimals(...)` changes local state | `PATCH /animals/{id}/suggestions/{sid}`; on success, update local state with the response |
| Close the panel | `setSelectedId(null)` | Unchanged, no request |

## Open questions (to align with the backend teammates)

1. Is the source and update frequency of `estimatedRemainingDays` / `priorityTier` daily batch inference (6:00 AM) or real-time? Tier thresholds (20 / 10 days) should be decided by the backend and returned
2. Should Breed & Age filtering be at the breed level too (`breed=Beagle`)? If so, add a `GET /animals/filter-options` returning the selectable values
3. Does staff identity come from the shelter's own account system?
4. Should a Dismiss reason be a required dropdown (better training signal for the model) or optional free text?

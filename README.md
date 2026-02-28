# Pharmacy EMR System 💊
A comprehensive full-stack Pharmacy Electronic Medical Record (EMR) system built with FastAPI and React (Vite).

## 🏗 REST API Architecture & Features
The backend is powered by Python **FastAPI** leveraging **SQLAlchemy ORM** and **Pydantic** to provide lightning-fast, highly concurrent RESTful endpoints.

### 🌐 API Structure
The API follows strict REST principles, organized into semantic domains:

**Dashboard Module (`/dashboard`)**
- `GET /dashboard/today-sales` - Aggregates gross revenue generated since 00:00 midnight.
- `GET /dashboard/items-sold` - Cumulative quantity of units moved today.
- `GET /dashboard/low-stock` - Count of inventory items requiring immediate reorder.
- `GET /dashboard/purchase-summary` - Total capital value tied up in active inventory.
- `GET /dashboard/recent-sales` - Fetches the last 5 transaction records for immediate visibility.
- `POST /dashboard/dummy-sale` - Primary billing engine that validates stock buffers, deducts quantity, logs a sale receipt, and recalculates inventory statuses automatically.

**Inventory Management (`/inventory`)**
- `GET /inventory` - Retrieves entire catalog with optional pagination (`skip`, `limit`) and filtering (`search`, `status`).
- `POST /inventory` - Registers new pharmaceutical products into the database.
- `GET /inventory/{id}` - Strict lookup for individual medication details.
- `PUT /inventory/{id}` - Full-payload update replacing an existing medication record.
- `PATCH /inventory/{id}/status` - Partial resource mutation reserved strictly for status overrides.

### 📦 Request & Response Models (Pydantic)
FastAPI utilizes Pydantic for rigid request/response formatting, marshaling, and strict type casting.
**Create / Update Model (Payload):**
```json
{
  "name": "Paracetamol 650mg",
  "batch_number": "PCM-2024-0892",
  "expiry_date": "2026-08-20T00:00:00Z",
  "quantity": 500,
  "price": 25.0
}
```

**Response Serialization Model:**
```json
{
  "id": 1,
  "name": "Paracetamol 650mg",
  "batch_number": "PCM-2024-0892",
  "expiry_date": "2026-08-20T00:00:00",
  "quantity": 500,
  "price": 25.0,
  "status": "Active",
  "created_at": "2026-02-28T16:34:30.969730",
  "updated_at": "2026-02-28T16:34:30.969730"
}
```

### 🚦 HTTP Status Code Compliance
All endpoints return standard HTTP status codes:
* `200 OK`: Successful synchronous operations (Data fetch, PUT updates, Billing).
* `201 Created`: Confirmation of successfully persisted new resource (POST).
* `400 Bad Request`: Failed business logic (e.g. attempting to bill more units than available in stock).
* `404 Not Found`: Attempted lookup on an unrecognized ID.
* `422 Unprocessable Entity`: Automatic, granular validation errors caught natively by Pydantic before reaching route logic (missing required keys, mismatched datatypes).
* `500 Internal Server Error`: Uncaught exceptions securely abstracted from the user.

### 🛡 Data Validation Rules
Pydantic automates defense-in-depth sanitization:
* Native type enforcement (`integer`, `float`, `string`) rejecting bad payloads instantly.
* ISO-8601 string parsing natively casts `expiry_date` offsets back into raw Native Datetimes for localized database synchronization.
* Exclusion of unset payload fields during `PATCH/PUT` guarantees no accidental nullification of collateral data rows.

### 🔄 Dynamic State Automation & Consistency
To maintain system integrity, human errors are minimized through automated data triggers:
1. **Automated Status Subrouting:** Every time a medicine is created, billed, or modified, it hits an isolated `update_medicine_status()` interception layer.
2. **Real-Time Classification:** The system strips Datetime offsets and compares the `expiry_date` securely to `datetime.utcnow()`.
3. **Threshold Logic:**
    * If `Quantity == 0` → `"Out of Stock"`
    * If `Expiry Date < Now` → `"Expired"`
    * If `Quantity < 20` → `"Low Stock"`
    * Otherwise → `"Active"`
4. **Billing Integrity:** The billing engine (`/dashboard/dummy-sale`) operates inside an Atomic Transcation Block. The DB will never deduct quantities unless the `Sale` row insertion successfully commits, preventing phantom stock leakage.

### 🗄️ Database Schema (SQLAlchemy ORM)
The persistence layer utilizes SQLite (configurable for PostgreSQL) enforcing relational mapping constraints:

**`medicines` Table**
* `id` *(Primary Key, Auto-increment)*
* `name` *(String, Indexed)*
* `batch_number` *(String)*
* `expiry_date` *(DateTime)*
* `quantity` *(Integer, Default=0)*
* `price` *(Float, Default=0.0)*
* `status` *(String, Default="Active")*
* `created_at` *(DateTime, Default=Now)*
* `updated_at` *(DateTime, Default=Now, OnUpdateTrigger)*

**`sales` Table**
* `id` *(Primary Key)*
* `medicine_id` *(Foreign Key -> medicines.id)*
* `quantity_sold` *(Integer, constraint > 0)*
* `total_amount` *(Float)*
* `sale_date` *(DateTime, Default=Now)*

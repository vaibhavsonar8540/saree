# Dynamic Header Navigation API (Saree Server)

This backend API provides dynamic header link management with main link and sublink relational hierarchy built with Node.js, Express, and Mongoose (MongoDB).

---

## 🏗️ Relational Architecture (Main Link <-> Sublink)

Sublinks store a reference (`mainLink`) to their parent main link using Mongoose `ObjectId` ref.

### Mongoose Schema Definition (`models/HeaderLink.js`)
```js
const headerLinkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    
    // Relation: Reference to parent main link
    mainLink: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HeaderLink',
      default: null,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual populate sublinks array for main link query
headerLinkSchema.virtual('sublinks', {
  ref: 'HeaderLink',
  localField: '_id',
  foreignField: 'mainLink',
  options: { sort: { order: 1, createdAt: 1 } },
});
```

---

## 🚀 REST API Endpoints

### 1. Seed Sample Header Links
- **POST** `/api/header-links/seed`
- Creates sample main links (Home, Sarees, Collections, About Us, Contact) and sublinks (Kanjeevaram, Banarasi, Organza, Bridal, Festive) with proper `mainLink` relations.

---

### 2. Get Dynamic Header Tree Structure (For Navigation Header UI)
- **GET** `/api/header-links`
- Returns main links (`mainLink: null`) with their `sublinks` array populated.

**Sample Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "66f40001...",
      "title": "Sarees",
      "url": "/sarees",
      "order": 2,
      "isActive": true,
      "mainLink": null,
      "sublinks": [
        {
          "_id": "66f40002...",
          "title": "Kanjeevaram Silk",
          "url": "/sarees/kanjeevaram-silk",
          "order": 1,
          "isActive": true,
          "mainLink": "66f40001..."
        },
        {
          "_id": "66f40003...",
          "title": "Banarasi Silk",
          "url": "/sarees/banarasi-silk",
          "order": 2,
          "isActive": true,
          "mainLink": "66f40001..."
        }
      ]
    }
  ]
}
```

---

### 3. Create Main Link
- **POST** `/api/header-links`

**Request Body:**
```json
{
  "title": "Accessories",
  "url": "/accessories",
  "order": 6
}
```

---

### 4. Create Sublink (Store `mainLink` Reference)
- **POST** `/api/header-links`

**Request Body:**
```json
{
  "title": "Clutches & Bags",
  "url": "/accessories/clutches",
  "order": 1,
  "mainLink": "66f40001..."  // ObjectId of Main Link ("Accessories" or "Sarees")
}
```

---

### 5. Get All Links (Flat List with Populated `mainLink`)
- **GET** `/api/header-links/flat`

---

### 6. Get Single Link Details
- **GET** `/api/header-links/:id`

---

### 7. Update Header Link
- **PUT** `/api/header-links/:id`

**Request Body:**
```json
{
  "title": "Kanjeevaram Pure Silk",
  "order": 1
}
```

---

### 8. Delete Header Link
- **DELETE** `/api/header-links/:id`
- Deleting a main link automatically cleans up all associated sublinks.

---

## 🏃 Running the Backend

```bash
# Start server in dev mode
npm run dev

# Start server in production mode
npm start
```

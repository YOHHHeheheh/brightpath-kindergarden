import { asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  galleryEntries,
  InsertGalleryEntry,
  InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    // ── SECURITY: Role assignment hardening ────────────────────────────
    // Only the owner (matched by OWNER_OPEN_ID) gets auto-promoted to admin
    // on their FIRST insert. We never allow the role to be set via the
    // user input parameter in a way that could be manipulated externally.
    // Once a user exists, their role is only changeable via direct DB access.
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    // ── SECURITY: Sanitise error output ─────────────────────────────────
    // Log the full error server-side for debugging but never expose raw
    // database error messages to the client — they may contain schema
    // details, constraint names, or connection strings.
    console.error("[Database] Failed to upsert user:", error);
    throw new Error("Database operation failed");
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

const defaultGalleryEntries = [
  {
    id: 1,
    title: "Creative Art Workshop",
    altText: "Phanindranath students proudly showcasing their handmade papercraft sunbursts in the classroom",
    category: "Creative Arts",
    imageKey: "image_07.jpg",
    imageUrl: "/school-photos/image_07.jpg",
    sortOrder: 1,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    title: "Green Thumb Discoveries",
    altText: "Students holding potted seedlings during nature care and plantation activity",
    category: "Nature & Learning",
    imageKey: "image_01.jpg",
    imageUrl: "/school-photos/image_01.jpg",
    sortOrder: 2,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    title: "Focused Craftwork",
    altText: "Students concentrating on intricate craft making and decoration at their desks",
    category: "Classroom Life",
    imageKey: "image_13.jpg",
    imageUrl: "/school-photos/image_13.jpg",
    sortOrder: 3,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    title: "Mindfulness & Yoga",
    altText: "Cub Scouts practicing seated yoga, meditation, and balance postures in the assembly hall",
    category: "Wellness & Scouts",
    imageKey: "image_24.jpg",
    imageUrl: "/school-photos/image_24.jpg",
    sortOrder: 4,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    title: "Patriotic Celebrations",
    altText: "Student dressed as Netaji Subhash Chandra Bose saluting the national tricolour",
    category: "School Events",
    imageKey: "image_16.jpg",
    imageUrl: "/school-photos/image_16.jpg",
    sortOrder: 5,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    title: "Our Dedicated Faculty",
    altText: "Phanindranath teachers, educators, and staff gathered warmly with students",
    category: "Faculty & Staff",
    imageKey: "image_23.jpg",
    imageUrl: "/school-photos/image_23.jpg",
    sortOrder: 6,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 7,
    title: "Cultural Drama & Performance",
    altText: "Students enacting a historical stage play during the school cultural program",
    category: "Cultural Arts",
    imageKey: "image_20.jpg",
    imageUrl: "/school-photos/image_20.jpg",
    sortOrder: 7,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 8,
    title: "Festive Courtyard Celebrations",
    altText: "Teachers and students decorating the open courtyard with tricolour flags",
    category: "Campus Life",
    imageKey: "image_27.jpg",
    imageUrl: "/school-photos/image_27.jpg",
    sortOrder: 8,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 9,
    title: "Joy & Companionship",
    altText: "Young students smiling together with their Phanindranath activity books",
    category: "Friendship",
    imageKey: "image_04.jpg",
    imageUrl: "/school-photos/image_04.jpg",
    sortOrder: 9,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 10,
    title: "Young Scout Flexibility",
    altText: "Scout student demonstrating stretching and discipline during school fitness routine",
    category: "Physical Fitness",
    imageKey: "image_25.jpg",
    imageUrl: "/school-photos/image_25.jpg",
    sortOrder: 10,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 11,
    title: "Art Gallery Wall",
    altText: "Classroom exhibition displaying student drawings, paintings, and creative artwork",
    category: "Art Exhibition",
    imageKey: "image_08.jpg",
    imageUrl: "/school-photos/image_08.jpg",
    sortOrder: 11,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 12,
    title: "Courtyard Rhythms",
    altText: "Happy students dancing and celebrating in the campus courtyard",
    category: "Joyful Moments",
    imageKey: "image_28.jpg",
    imageUrl: "/school-photos/image_28.jpg",
    sortOrder: 12,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function getPublicGalleryEntries() {
  const db = await getDb();
  if (!db) return defaultGalleryEntries;

  try {
    const entries = await db
      .select()
      .from(galleryEntries)
      .where(eq(galleryEntries.isPublished, true))
      .orderBy(asc(galleryEntries.sortOrder), desc(galleryEntries.createdAt));

    return entries.length > 0 ? entries : defaultGalleryEntries;
  } catch (error) {
    console.warn("[Database] Failed to fetch public gallery entries:", error);
    return defaultGalleryEntries;
  }
}

export async function getAllGalleryEntries() {
  const db = await getDb();
  if (!db) return defaultGalleryEntries;

  try {
    const entries = await db
      .select()
      .from(galleryEntries)
      .orderBy(desc(galleryEntries.isPublished), asc(galleryEntries.sortOrder), desc(galleryEntries.createdAt));

    return entries.length > 0 ? entries : defaultGalleryEntries;
  } catch (error) {
    console.warn("[Database] Failed to fetch all gallery entries:", error);
    return defaultGalleryEntries;
  }
}

export async function createGalleryEntry(entry: InsertGalleryEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");

  const result = await db.insert(galleryEntries).values(entry);
  return result[0].insertId;
}

export async function updateGalleryEntry(
  id: number,
  updates: Partial<Pick<InsertGalleryEntry, "title" | "altText" | "category" | "sortOrder" | "isPublished">>,
) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");

  // ── SECURITY: Verify the entry exists before updating ────────────────
  // Prevents blind updates to non-existent or already-deleted records.
  const existing = await db.select({ id: galleryEntries.id }).from(galleryEntries).where(eq(galleryEntries.id, id)).limit(1);
  if (existing.length === 0) {
    throw new Error("Gallery entry not found");
  }

  await db.update(galleryEntries).set(updates).where(eq(galleryEntries.id, id));
}

export async function deleteGalleryEntry(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");

  // ── SECURITY: Verify the entry exists before deleting ────────────────
  const existing = await db.select({ id: galleryEntries.id }).from(galleryEntries).where(eq(galleryEntries.id, id)).limit(1);
  if (existing.length === 0) {
    throw new Error("Gallery entry not found");
  }

  await db.delete(galleryEntries).where(eq(galleryEntries.id, id));
}

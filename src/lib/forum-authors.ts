import { createAdminClient } from "@/lib/supabase/admin";

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

export interface AuthorInfo {
    id: string;
    full_name: string;
    role: string;
}

const DEMO_AUTHORS = new Map<string, AuthorInfo>([
    ["da81c6d9-1c52-f0d8-1e10-0d4374165be9", { id: "da81c6d9-1c52-f0d8-1e10-0d4374165be9", full_name: "Ahmed Khan", role: "Farm Manager" }],
    ["3c6cc3c2-bfd0-cc9c-41d7-701d178e39cc", { id: "3c6cc3c2-bfd0-cc9c-41d7-701d178e39cc", full_name: "Fatima Raza", role: "Veterinarian" }],
    ["9298d585-9778-1052-424c-6b18e041d071", { id: "9298d585-9778-1052-424c-6b18e041d071", full_name: "Usman Malik", role: "Farm Supervisor" }],
    ["15256916-929a-779e-8a66-3389d5d01b72", { id: "15256916-929a-779e-8a66-3389d5d01b72", full_name: "Sana Iqbal", role: "Nutrition Lead" }],
    ["5ee1c695-f121-5e6a-ff1a-b96a9f1a3afe", { id: "5ee1c695-f121-5e6a-ff1a-b96a9f1a3afe", full_name: "Bilal Sheikh", role: "buyer" }],
    ["b61e7f26-3132-0ad8-c7ea-33fffb097804", { id: "b61e7f26-3132-0ad8-c7ea-33fffb097804", full_name: "Ayesha Noor", role: "buyer" }],
    ["9d7244b3-165f-f13b-e852-d94fe0efc2aa", { id: "9d7244b3-165f-f13b-e852-d94fe0efc2aa", full_name: "Hamza Qureshi", role: "buyer" }],
    ["0c284eb1-7c4a-7794-7b80-45cc2f280cf6", { id: "0c284eb1-7c4a-7794-7b80-45cc2f280cf6", full_name: "Maryam Tariq", role: "buyer" }],
]);

/**
 * Batch-resolve author names for items that have author_id + author_type fields.
 * Farm users are looked up from farm_users table, buyers from auth.users metadata.
 */
export async function resolveAuthors(
    admin: SupabaseAdmin,
    items: any[],
    authorIdField = "author_id",
    authorTypeField = "author_type"
) {
    if (!items.length) return;

    // Collect unique IDs grouped by type
    const farmIds = new Set<string>();
    const buyerIds = new Set<string>();

    for (const item of items) {
        const id = item[authorIdField];
        if (!id) continue;
        if (DEMO_AUTHORS.has(id)) continue;
        if (item[authorTypeField] === "buyer") {
            buyerIds.add(id);
        } else {
            farmIds.add(id);
        }
    }

    const authorMap = new Map<string, AuthorInfo>();

    // Batch-fetch farm users
    if (farmIds.size > 0) {
        const { data: farmUsers } = await admin
            .from("farm_users")
            .select("id, full_name, role")
            .in("id", [...farmIds]);

        for (const fu of farmUsers ?? []) {
            authorMap.set(fu.id, {
                id: fu.id,
                full_name: fu.full_name || "Farm User",
                role: fu.role || "farm_user",
            });
        }
    }

    // Supabase auth does not expose a bulk user endpoint here, so resolve buyers concurrently.
    await Promise.all([...buyerIds].map(async uid => {
        try {
            const { data: userData } = await admin.auth.admin.getUserById(uid);
            if (userData?.user) {
                const meta = userData.user.user_metadata;
                authorMap.set(uid, {
                    id: userData.user.id,
                    full_name: meta?.full_name || meta?.name || userData.user.email?.split("@")[0] || "User",
                    role: "buyer",
                });
            } else {
                authorMap.set(uid, { id: uid, full_name: "User", role: "buyer" });
            }
        } catch {
            authorMap.set(uid, { id: uid, full_name: "User", role: "buyer" });
        }
    }));

    // Attach author to each item
    for (const item of items) {
        const id = item[authorIdField];
        if (id && DEMO_AUTHORS.has(id)) {
            item.author = DEMO_AUTHORS.get(id)!;
        } else if (id && authorMap.has(id)) {
            item.author = authorMap.get(id)!;
        } else if (id) {
            item.author = { id, full_name: "Unknown", role: item[authorTypeField] || "buyer" };
        } else {
            item.author = { id: "", full_name: "Unknown", role: "buyer" };
        }
    }
}

/**
 * Resolve a single author by ID + type.
 */
export async function resolveSingleAuthor(
    admin: SupabaseAdmin,
    authorId: string,
    authorType: string
): Promise<AuthorInfo> {
    const demoAuthor = DEMO_AUTHORS.get(authorId);
    if (demoAuthor) return demoAuthor;

    if (authorType === "farm_user") {
        const { data } = await admin
            .from("farm_users")
            .select("id, full_name, role")
            .eq("id", authorId)
            .single();
        if (data) {
            return { id: data.id, full_name: data.full_name || "Farm User", role: data.role || "farm_user" };
        }
    } else {
        try {
            const { data: userData } = await admin.auth.admin.getUserById(authorId);
            if (userData?.user) {
                const meta = userData.user.user_metadata;
                return {
                    id: userData.user.id,
                    full_name: meta?.full_name || meta?.name || userData.user.email?.split("@")[0] || "User",
                    role: "buyer",
                };
            }
        } catch {}
    }
    return { id: authorId, full_name: "Unknown", role: authorType };
}

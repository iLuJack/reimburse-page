import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { supabase } from "@/utils/supabase/supabase";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env",
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Store in Supabase
  try {
    const { id } = evt.data;

    if (evt.type === "user.created") {
      // Extract only essential user data
      const {
        first_name,
        last_name,
        email_addresses,
        created_at,
        updated_at,
        id: user_id,
      } = evt.data;
      const primaryEmail =
        email_addresses?.length > 0 ? email_addresses[0].email_address : null;

      const { error } = await supabase.from("clerk_webhooks").insert({
        user_id,
        first_name,
        last_name,
        email: primaryEmail,
        created_at: new Date(created_at).toISOString(),
        updated_at: new Date(updated_at).toISOString(),
      });

      if (error) throw error;

      console.log(`Stored new user ${id} in Supabase`);
    } else if (evt.type === "user.updated") {
      // Extract updated user data
      const {
        first_name,
        last_name,
        email_addresses,
        updated_at,
        id: user_id,
      } = evt.data;

      // Get primary email if available
      const primaryEmail =
        email_addresses?.length > 0 ? email_addresses[0].email_address : null;

      const { error } = await supabase
        .from("clerk_webhooks")
        .update({
          first_name,
          last_name,
          email: primaryEmail,
          updated_at: new Date(updated_at).toISOString(),
        })
        .eq("user_id", user_id);

      if (error) throw error;

      console.log(`Updated user ${user_id} in Supabase`);
    } else if (evt.type === "user.deleted") {
      const { id: user_id } = evt.data;
      const { error } = await supabase
        .from("clerk_webhooks")
        .delete()
        .eq("user_id", user_id);

      if (error) throw error;

      console.log(`Deleted user ${user_id} from Supabase`);
    }
  } catch (err) {
    console.error("Error handling webhook in Supabase:", err);
    // Continue processing even if storage fails
  }

  return new Response("Webhook received", { status: 200 });
}

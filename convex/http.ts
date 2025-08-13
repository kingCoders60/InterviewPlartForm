import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";

const http = httpRouter();
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
    }
    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("No svix headers found", {
        status: 400,
      });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occurred", { status: 400 });
    }
    
    const eventType = evt.type;
    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;
      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();
      try {
        await ctx.runMutation(api.users.syncUser, {
          clerkId: id,
           email,
          name,
          image: image_url,
        });
      } catch (error) {
        console.log("Error creating user:", error);
        return new Response("Error creating user", { status: 500 });
      }
    }
    return new Response("Webhook processed successfully", { status: 200 });
  }),
});
export default http;
/*Explanation:

Step	->What It Does
Verify ->webhook	Ensures request is from Clerk
Parse user data	Extracts name, email, image
Call mutation	Inserts user into Convex DB
Respond	Sends success or error to Clerk


Webhook Flow Summary
🔗 Purpose:
Automatically sync new Clerk users into your Convex database when they sign up.

🧩 Key Steps:
Webhook Route Setup

Define /clerk-webhook POST route using httpRouter and httpAction.

Verify Clerk Webhook

Use svix headers (svix-id, svix-signature, svix-timestamp) and your CLERK_WEBHOOK_SECRET to verify authenticity.

Extract User Data

From WebhookEvent, get id, email, first_name, last_name, image_url.

Call Convex Mutation

Use ctx.runMutation(api.users.syncUser, {...}) to insert user into Convex DB.

Respond to Clerk

Return 200 OK if successful, or 500 if mutation fails.

ctx gives access to Convex DB.

api.users.syncUser is your mutation that inserts user if not already present.

Clerk only handles auth — Convex stores your app-specific data.
 */
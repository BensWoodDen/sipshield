import { createClient } from "@supabase/supabase-js";
import { hash } from "@node-rs/argon2";
import * as readline from "readline";
import { config } from "dotenv";
config({
  path: '.env.local'
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const pepper = process.env.AUTH_PEPPER ?? "";

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}

if (!pepper) {
  console.error("Missing AUTH_PEPPER in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  const email = await ask("Email: ");
  const name = await ask("Name: ");
  const password = await ask("Password: ");

  if (!email || !name || !password) {
    console.error("All fields are required");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters");
    process.exit(1);
  }

  const passwordHash = await hash(pepper + password);

  const { error } = await supabase.from("admin_users").insert({
    email,
    name,
    password_hash: passwordHash,
  });

  if (error) {
    console.error("Failed to create admin user:", error.message);
    process.exit(1);
  }

  console.log(`Admin user "${name}" (${email}) created successfully.`);
  rl.close();
}

main();

// scripts/download-photos.mjs

import fs from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "public", "animals");
const FORCE = process.argv.includes("--force");

const animals = [
  { id: "4810", name: "Luna",    dog: "mix" },
  { id: "4122", name: "Biscuit", dog: "terrier/norfolk" },
  { id: "4309", name: "Shadow",  cat: "bomb" },
  { id: "4902", name: "Pepper",  dog: "mix" },
  { id: "4911", name: "Mochi",   cat: "pers" }, 
  { id: "4944", name: "Sunny",   dog: "retriever/golden" },
  { id: "3987", name: "Bruno",   dog: "pitbull" },
  { id: "4056", name: "Oliver",  cat: null },
  { id: "4201", name: "Daisy",   dog: "beagle" },
  { id: "4378", name: "Smokey",  cat: "bsho" },  
  { id: "4455", name: "Rocky",   dog: "german/shepherd" },
  { id: "4620", name: "Cleo",    cat: null },
  { id: "4733", name: "Max",     dog: "labrador" },
  { id: "4788", name: "Nala",    cat: "siam" }, 
  { id: "4851", name: "Coco",    dog: "poodle/miniature" },
  { id: "4927", name: "Pumpkin", cat: null },
  { id: "4950", name: "Milo",    dog: "pembroke" },
  { id: "4961", name: "Willow",  cat: "pers" },  
];

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function dogImageUrl(breed) {
  try {
    const data = await getJson(`https://dog.ceo/api/breed/${breed}/images/random`);
    return data.message;
  } catch {
    const data = await getJson("https://dog.ceo/api/breeds/image/random");
    return data.message;
  }
}

async function catImageUrl(breedId) {
  if (breedId) {
    try {
      const data = await getJson(
        `https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}&mime_types=jpg`
      );
      if (data[0]?.url) return data[0].url;
    } catch {
      // 落到下面的随机猫
    }
  }
  const data = await getJson("https://api.thecatapi.com/v1/images/search?mime_types=jpg");
  return data[0].url;
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  for (const a of animals) {
    const outPath = path.join(OUT_DIR, `${a.id}.jpg`);
    if (!FORCE && (await exists(outPath))) {
      console.log(`Skipped  ${a.name.padEnd(8)} (existed)`);
      continue;
    }
    try {
      const url = "dog" in a ? await dogImageUrl(a.dog) : await catImageUrl(a.cat);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      await fs.writeFile(outPath, Buffer.from(await res.arrayBuffer()));
      console.log(`completed  ${a.name.padEnd(8)} → public/animals/${a.id}.jpg`);
    } catch (err) {
      console.log(`failed  ${a.name.padEnd(8)} ${err.message}`);
    }
  }

  console.log("\nif not satisfied, you can run again.");
}

main();

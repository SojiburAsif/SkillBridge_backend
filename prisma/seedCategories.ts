import { prisma } from "../src/lib/prisma";


const categories = [
  "Accounting", "Biology", "Chemistry", "Data Science",
  "English", "Finance", "Geography", "History",
  "IT & Software", "JavaScript", "Korean Language", "Literature",
  "Math", "Networking", "Physics", "Programming",
  "Robotics", "Spanish Language", "Web Development", "Writing"
];

async function main() {
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log("Categories seeded successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

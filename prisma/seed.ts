import { PrismaClient, EventRole } from "@prisma/client";
import leite from "leite";

const prisma = new PrismaClient();
const { pessoa } = leite();

const locations = [
  {
    name: "Parque Verde, FRG",
    latitude: -25.665348,
    longitude: -49.3182271,
    title: "Park Cleanup Day",
    description: "Community effort to clean up Parque Verde.",
  },
  {
    name: "Praça Izaltino Salvador de Souza",
    latitude: -25.6429912,
    longitude: -49.3237409,
    title: "Tree Planting at Izaltino Souza",
    description: "Planting 50 new native trees in the square.",
  },
  {
    name: "Praça Vitória, FRG",
    latitude: -25.6514092,
    longitude: -49.3029529,
    title: "Community Garden Setup",
    description: "Building new garden beds for public use.",
  },
  {
    name: "Pista de Skate, FRG",
    latitude: -25.6475772,
    longitude: -49.3265113,
    title: "Skate Park Revitalization",
    description: "Painting murals and repairing ramps.",
  },
  {
    name: "Parque Verde (Event 2)",
    latitude: -25.665348,
    longitude: -49.3182271,
    title: "Invasive Species Removal",
    description: "Removing invasive plants from the park borders.",
  },
];

async function main() {
  console.log("Start seeding...");

  console.log("Cleaning database...");
  await prisma.surveyResponse.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.userEventRole.deleteMany();
  await prisma.actionEvent.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating 30 users with "leite"...');
  const userPromises = [];
  for (let i = 1; i <= 30; i++) {
    userPromises.push(
      prisma.user.create({
        data: {
          name: pessoa.nome(), // Using 'leite' library
          email: `user${i}@example.com`,
          password: "password123",
        },
      })
    );
  }
  const users = await Promise.all(userPromises);
  console.log(`Created ${users.length} users.`);

  const organizers = users.slice(0, 5);
  const volunteers = users.slice(5);

  console.log("Creating 5 events...");
  const eventPromises = organizers.map((organizer, index) => {
    const loc = locations[index];
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 7 + index);

    return prisma.actionEvent.create({
      data: {
        title: loc.title,
        description: loc.description,
        date: eventDate,
        location: loc.name,
        latitude: loc.latitude,
        longitude: loc.longitude,
        createdById: organizer.id,
        plantedTrees: index === 1 ? 50 : 0,
        collectedWasteKg: index === 0 ? 150.5 : 0,
      },
    });
  });
  const events = await Promise.all(eventPromises);
  console.log(`Created ${events.length} events.`);

  console.log("Assigning roles...");
  const rolePromises = [];

  // Assign 5 Organizers
  for (let i = 0; i < organizers.length; i++) {
    rolePromises.push(
      prisma.userEventRole.create({
        data: {
          userId: organizers[i].id,
          eventId: events[i].id,
          role: EventRole.ORGANIZER,
        },
      })
    );
  }

  // Assign 25 Volunteers (5 per event)
  let volunteerIndex = 0;
  for (const event of events) {
    for (let i = 0; i < 5; i++) {
      if (volunteerIndex < volunteers.length) {
        rolePromises.push(
          prisma.userEventRole.create({
            data: {
              userId: volunteers[volunteerIndex].id,
              eventId: event.id,
              role: EventRole.VOLUNTEER,
            },
          })
        );
        volunteerIndex++;
      }
    }
  }

  await Promise.all(rolePromises);
  console.log("Roles assigned.");

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

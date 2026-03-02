const prisma = require("../prismaClient");

async function identifyService({ email, phoneNumber }) {
  if (!email && !phoneNumber) {
    throw new Error("Email or phoneNumber required");
  }

  // STEP 1: Find all contacts matching email or phone
  const matchedContacts = await prisma.contact.findMany({
    where: {
      OR: [
        email ? { email } : undefined,
        phoneNumber ? { phoneNumber } : undefined,
      ].filter(Boolean),
    },
    orderBy: { createdAt: "asc" },
  });

  // CASE 1: No match → create primary
  if (matchedContacts.length === 0) {
    const newContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: "primary",
      },
    });

    return formatResponse([newContact]);
  }

  // STEP 2: Collect all related contacts (including linked ones)
  const primaryIds = new Set();

  for (let contact of matchedContacts) {
    if (contact.linkPrecedence === "primary") {
      primaryIds.add(contact.id);
    } else {
      primaryIds.add(contact.linkedId);
    }
  }

  const allRelatedContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: { in: Array.from(primaryIds) } },
        { linkedId: { in: Array.from(primaryIds) } },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  // STEP 3: Determine oldest primary
  const oldestPrimary = allRelatedContacts
    .filter((c) => c.linkPrecedence === "primary")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];

  // STEP 4: Convert other primaries to secondary
  for (let contact of allRelatedContacts) {
    if (
      contact.linkPrecedence === "primary" &&
      contact.id !== oldestPrimary.id
    ) {
      await prisma.contact.update({
        where: { id: contact.id },
        data: {
          linkPrecedence: "secondary",
          linkedId: oldestPrimary.id,
        },
      });
    }
  }

  // STEP 5: Check if new info needs new secondary
  const infoExists = allRelatedContacts.some(
    (c) => c.email === email && c.phoneNumber === phoneNumber
  );

  if (!infoExists) {
    await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkedId: oldestPrimary.id,
        linkPrecedence: "secondary",
      },
    });
  }

  // STEP 6: Fetch updated full identity tree
  const finalContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: oldestPrimary.id },
        { linkedId: oldestPrimary.id },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  return formatResponse(finalContacts);
}

// Helper function to format response
function formatResponse(contacts) {
  const primary = contacts.find((c) => c.linkPrecedence === "primary");

  return {
    contact: {
      primaryContactId: primary.id,
      emails: [...new Set(contacts.map((c) => c.email).filter(Boolean))],
      phoneNumbers: [
        ...new Set(contacts.map((c) => c.phoneNumber).filter(Boolean)),
      ],
      secondaryContactIds: contacts
        .filter((c) => c.linkPrecedence === "secondary")
        .map((c) => c.id),
    },
  };
}

module.exports = identifyService;
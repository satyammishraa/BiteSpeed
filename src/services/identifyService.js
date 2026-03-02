const prisma = require("../prismaClient");

async function identifyService({ email, phoneNumber }) {
  if (!email && !phoneNumber) {
    throw new Error("Email or phoneNumber required");
  }

  const existingContacts = await prisma.contact.findMany({
    where: {
      OR: [
        email ? { email } : undefined,
        phoneNumber ? { phoneNumber } : undefined,
      ].filter(Boolean),
    },
    orderBy: { createdAt: "asc" },
  });

  if (existingContacts.length === 0) {
    const newContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: "primary",
      },
    });

    return {
      contact: {
        primaryContactId: newContact.id,
        emails: [newContact.email],
        phoneNumbers: [newContact.phoneNumber],
        secondaryContactIds: [],
      },
    };
  }

  let primary = existingContacts.find(
    (c) => c.linkPrecedence === "primary"
  ) || existingContacts[0];

  const alreadyExists = existingContacts.some(
    (c) => c.email === email && c.phoneNumber === phoneNumber
  );

  if (!alreadyExists) {
    await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkedId: primary.id,
        linkPrecedence: "secondary",
      },
    });
  }

  const allContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: primary.id },
        { linkedId: primary.id },
      ],
    },
  });

  return {
    contact: {
      primaryContactId: primary.id,
      emails: [...new Set(allContacts.map(c => c.email).filter(Boolean))],
      phoneNumbers: [...new Set(allContacts.map(c => c.phoneNumber).filter(Boolean))],
      secondaryContactIds: allContacts
        .filter(c => c.linkPrecedence === "secondary")
        .map(c => c.id),
    },
  };
}

module.exports = identifyService;
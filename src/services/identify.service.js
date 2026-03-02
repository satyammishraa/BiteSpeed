const prisma = require("../config/prisma");

exports.handleIdentify = async (email, phoneNumber) => {
  // for finding contact that matchs email or phone
  const existingContacts = await prisma.contact.findMany({
    where: {
      OR: [
        email ? { email } : undefined,
        phoneNumber ? { phoneNumber } : undefined,
      ].filter(Boolean),
    },
  });

  //if no existing contact found, create it a primaryt
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
        primaryContatctId: newContact.id,
        emails: email ? [email] : [],
        phoneNumbers: phoneNumber ? [phoneNumber] : [],
        secondaryContactIds: [],
      },
    };
  }  

  // get all linked contact id (include secondary chains)
  const contactIds = new Set();

  existingContacts.forEach((c) => {
    contactIds.add(c.id);
    if (c.linkedId) contactIds.add(c.linkedId);
  });

  const allRelatedContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: { in: Array.from(contactIds) } },
        { linkedId: { in: Array.from(contactIds) } },
      ],
    },
  });  

  //find primary contact (oldest createdAt)
  let primaryContact = allRelatedContacts
    .filter((c) => c.linkPrecedence === "primary")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];

  //convert other primaries to secondary if needed
  
  const otherPrimaries = allRelatedContacts.filter(
    (c) =>
      c.linkPrecedence === "primary" && c.id !== primaryContact.id
  );
  for (const contact of otherPrimaries) {
    await prisma.contact.update({
      where: { id: contact.id },
      data: {
        linkPrecedence: "secondary",
        linkedId: primaryContact.id,
      },
    });
  }  
  //check if new info needs new secondary
  const emails = new Set(allRelatedContacts.map((c) => c.email).filter(Boolean));
  const phones = new Set(allRelatedContacts.map((c) => c.phoneNumber).filter(Boolean));

  let newSecondary = null;

  if (
    (email && !emails.has(email)) ||
    (phoneNumber && !phones.has(phoneNumber))
  ) {
    newSecondary = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: "secondary",
        linkedId: primaryContact.id,
      },
    });

    allRelatedContacts.push(newSecondary);

    if (email) emails.add(email);
    if (phoneNumber) phones.add(phoneNumber);
  }

  const finalContacts = await prisma.contact.findMany({
  where: {
    OR: [
      { id: primaryContact.id },
      { linkedId: primaryContact.id },
    ],
   },
  });
const finalEmails = new Set(finalContacts.map(c => c.email).filter(Boolean));
const finalPhones = new Set(finalContacts.map(c => c.phoneNumber).filter(Boolean));

  //this is final response
  const secondaryContacts = finalContacts.filter(
    (c) => c.linkPrecedence === "secondary"
  );  


  return {
    contact: {
      primaryContatctId: primaryContact.id,
      emails: Array.from(finalEmails),
      phoneNumbers: Array.from(finalPhones),
      secondaryContactIds: secondaryContacts.map((c) => c.id),
    },
  };
};
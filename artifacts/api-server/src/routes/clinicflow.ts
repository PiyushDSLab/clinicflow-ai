import { Router, type IRouter } from "express";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  appointments,
  clinicSettings,
  clinics,
  conversations,
  doctors,
  faqs,
  handoffs,
  messages,
  reminders,
} from "@workspace/db/schema";

const router: IRouter = Router();
const clinicId = "clinic-sharma";

const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
const today = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

async function seedDemo() {
  const existing = await db.select({ id: clinics.id }).from(clinics).where(eq(clinics.id, clinicId));
  if (existing.length) return;

  await db.insert(clinics).values({
    id: clinicId,
    name: "Sharma Family Clinic",
    city: "Pune",
    phone: "+91 20 4123 8800",
    email: "hello@sharmafamilyclinic.com",
    address: "123 MG Road, Pune, Maharashtra",
    fee: 500,
  });

  const doctorOne = "doctor-ananya";
  const doctorTwo = "doctor-rahul";
  await db.insert(doctors).values([
    { id: doctorOne, clinicId, name: "Dr. Ananya Sharma", specialization: "General Physician", availability: "Mon–Sat · 10:00 AM–1:00 PM · 4:00 PM–7:00 PM", status: "Active" },
    { id: doctorTwo, clinicId, name: "Dr. Rahul Mehta", specialization: "Dentist", availability: "Mon–Sat · 11:00 AM–2:00 PM · 5:00 PM–8:00 PM", status: "Active" },
  ]);

  const d = today();
  await db.insert(appointments).values([
    { id: "appt-001", clinicId, doctorId: doctorOne, patientName: "Priya Nair", patientPhone: "+91 90000 12001", date: d, time: "10:00 AM", type: "Consultation", status: "Confirmed", notes: "First visit" },
    { id: "appt-002", clinicId, doctorId: doctorOne, patientName: "Aarav Shah", patientPhone: "+91 90000 12002", date: d, time: "10:30 AM", type: "Follow-up", status: "Confirmed", notes: "" },
    { id: "appt-003", clinicId, doctorId: doctorTwo, patientName: "Meera Iyer", patientPhone: "+91 90000 12003", date: d, time: "11:00 AM", type: "General Visit", status: "Pending", notes: "" },
    { id: "appt-004", clinicId, doctorId: doctorOne, patientName: "Kabir Joshi", patientPhone: "+91 90000 12004", date: d, time: "12:00 PM", type: "Consultation", status: "Confirmed", notes: "" },
    { id: "appt-005", clinicId, doctorId: doctorTwo, patientName: "Rhea Kapoor", patientPhone: "+91 90000 12005", date: d, time: "1:00 PM", type: "Follow-up", status: "Completed", notes: "" },
    { id: "appt-006", clinicId, doctorId: doctorOne, patientName: "Dev Malhotra", patientPhone: "+91 90000 12006", date: d, time: "4:00 PM", type: "Consultation", status: "Confirmed", notes: "" },
    { id: "appt-007", clinicId, doctorId: doctorOne, patientName: "Nisha Rao", patientPhone: "+91 90000 12007", date: d, time: "5:00 PM", type: "General Visit", status: "Pending", notes: "" },
    { id: "appt-008", clinicId, doctorId: doctorTwo, patientName: "Vikram Das", patientPhone: "+91 90000 12008", date: d, time: "6:00 PM", type: "Consultation", status: "Confirmed", notes: "" },
  ]);

  await db.insert(faqs).values([
    { id: "faq-001", clinicId, question: "What is the consultation fee?", answer: "The consultation fee is ₹500.", category: "Fees", status: "Active" },
    { id: "faq-002", clinicId, question: "What are your clinic timings?", answer: "Monday to Saturday, 10:00 AM–1:00 PM and 4:00 PM–7:00 PM.", category: "Timings", status: "Active" },
    { id: "faq-003", clinicId, question: "Where are you located?", answer: "123 MG Road, Pune, Maharashtra.", category: "Location", status: "Active" },
    { id: "faq-004", clinicId, question: "Do I need an appointment?", answer: "Appointments are recommended, but same-day availability may be possible.", category: "Appointments", status: "Active" },
    { id: "faq-005", clinicId, question: "What should I do in an emergency?", answer: "For emergencies, contact your local emergency medical service or visit the nearest emergency facility.", category: "General", status: "Active" },
  ]);

  const conversationSeeds = [
    ["conv-001", "Priya Nair", "How much is the consultation fee?", "AI Resolved", "Resolved", false],
    ["conv-002", "Aarav Shah", "Can I book for tomorrow?", "Booking", "Booking Created", false],
    ["conv-003", "Meera Iyer", "I want to reschedule my appointment.", "AI Resolved", "Rescheduled", false],
    ["conv-004", "Rhea Kapoor", "I have severe chest pain. What medicine should I take?", "Needs Human", "Human Handoff", true],
  ] as const;
  for (const [conversationId, patientName, lastMessage, status, outcome, safetyFlag] of conversationSeeds) {
    await db.insert(conversations).values({ id: conversationId, clinicId, patientName, lastMessage, status, outcome, safetyFlag });
    await db.insert(messages).values([
      { id: `${conversationId}-1`, conversationId, sender: "patient", body: lastMessage },
      { id: `${conversationId}-2`, conversationId, sender: "ai", body: safetyFlag ? "I’m sorry, but ClinicFlow can’t provide medical advice or diagnose symptoms. I’ll flag this conversation for the clinic team so they can assist you." : "Thanks — I can help with clinic information and appointment operations." },
    ]);
  }

  await db.insert(handoffs).values([
    { id: "handoff-001", clinicId, patientName: "Rhea Kapoor", reason: "Medical Query", priority: "Urgent", status: "New" },
    { id: "handoff-002", clinicId, patientName: "Vikram Das", reason: "Patient Requested Staff", priority: "Normal", status: "In Progress" },
    { id: "handoff-003", clinicId, patientName: "Nisha Rao", reason: "Unclear Request", priority: "Normal", status: "New" },
  ]);

  await db.insert(reminders).values([
    { id: "reminder-001", clinicId, patientName: "Priya Nair", appointmentText: "Dr. Sharma · today at 5:00 PM", reminderType: "Same-day reminder", scheduled: "Today, 2:00 PM", status: "Scheduled" },
    { id: "reminder-002", clinicId, patientName: "Aarav Shah", appointmentText: "Dr. Mehta · tomorrow at 11:00 AM", reminderType: "24-hour reminder", scheduled: "Today, 11:00 AM", status: "Sent (demo)" },
    { id: "reminder-003", clinicId, patientName: "Meera Iyer", appointmentText: "Dr. Sharma · tomorrow at 4:00 PM", reminderType: "24-hour reminder", scheduled: "Today, 4:00 PM", status: "Scheduled" },
    { id: "reminder-004", clinicId, patientName: "Kabir Joshi", appointmentText: "Dr. Sharma · Friday at 10:00 AM", reminderType: "24-hour reminder", scheduled: "Thursday, 10:00 AM", status: "Scheduled" },
  ]);
  await db.insert(clinicSettings).values({ id: "settings-sharma", clinicId });
}

async function withSeed<T>(operation: () => Promise<T>) {
  await seedDemo();
  return operation();
}

router.get("/clinicflow/dashboard", async (req, res) => {
  try {
    const data = await withSeed(async () => {
      const [clinic] = await db.select().from(clinics).where(eq(clinics.id, clinicId));
      const todaysAppointments = await db.select().from(appointments).where(and(eq(appointments.clinicId, clinicId), eq(appointments.date, today()))).orderBy(asc(appointments.time));
      const doctorRows = await db.select().from(doctors).where(eq(doctors.clinicId, clinicId));
      const recentConversations = await db.select().from(conversations).where(eq(conversations.clinicId, clinicId)).orderBy(desc(conversations.updatedAt)).limit(5);
      const activeHandoffs = await db.select().from(handoffs).where(and(eq(handoffs.clinicId, clinicId), sql`${handoffs.status} <> 'Resolved'`)).orderBy(desc(handoffs.createdAt));
      return { clinic, doctors: doctorRows, appointments: todaysAppointments, conversations: recentConversations, handoffs: activeHandoffs, metrics: { todaysAppointments: todaysAppointments.length, confirmed: todaysAppointments.filter((a) => a.status === "Confirmed").length, pending: todaysAppointments.filter((a) => a.status === "Pending").length, aiConversations: recentConversations.length + 20, resolutionRate: 78, humanHandoffs: activeHandoffs.length, noShowRisk: 3 } };
    });
    res.json(data);
  } catch (error) {
    req.log.error({ error }, "Failed to load dashboard");
    res.status(500).json({ message: "Unable to load clinic dashboard" });
  }
});

router.get("/clinicflow/appointments", async (req, res) => {
  try {
    const rows = await withSeed(() => db.select({ appointment: appointments, doctor: doctors }).from(appointments).innerJoin(doctors, eq(appointments.doctorId, doctors.id)).where(eq(appointments.clinicId, clinicId)).orderBy(asc(appointments.date), asc(appointments.time)));
    res.json(rows.map(({ appointment, doctor }) => ({ ...appointment, doctorName: doctor.name })));
  } catch (error) {
    req.log.error({ error }, "Failed to load appointments");
    res.status(500).json({ message: "Unable to load appointments" });
  }
});

router.post("/clinicflow/appointments", async (req, res) => {
  try {
    const payload = req.body as Record<string, unknown>;
    const required = ["patientName", "patientPhone", "doctorId", "date", "time", "type"];
    if (required.some((key) => typeof payload[key] !== "string" || !(payload[key] as string).trim())) return res.status(400).json({ message: "Patient, doctor, date, time, and appointment type are required." });
    const conflict = await db.select({ id: appointments.id }).from(appointments).where(and(eq(appointments.doctorId, payload.doctorId as string), eq(appointments.date, payload.date as string), eq(appointments.time, payload.time as string)));
    if (conflict.length) return res.status(409).json({ message: "That doctor already has an appointment at this time." });
    const [created] = await db.insert(appointments).values({ id: id("appt"), clinicId, doctorId: payload.doctorId as string, patientName: payload.patientName as string, patientPhone: payload.patientPhone as string, date: payload.date as string, time: payload.time as string, type: payload.type as string, status: "Pending", notes: typeof payload.notes === "string" ? payload.notes : "" }).returning();
     return res.status(201).json(created);
  } catch (error) {
    req.log.error({ error }, "Failed to create appointment");
    return res.status(500).json({ message: "Unable to create appointment" });
  }
});

router.patch("/clinicflow/appointments/:id", async (req, res) => {
  try {
    const [updated] = await db.update(appointments).set(req.body as Partial<typeof appointments.$inferInsert>).where(and(eq(appointments.id, req.params.id), eq(appointments.clinicId, clinicId))).returning();
    if (!updated) return res.status(404).json({ message: "Appointment not found" });
     return res.json(updated);
  } catch (error) {
    req.log.error({ error }, "Failed to update appointment");
    return res.status(500).json({ message: "Unable to update appointment" });
  }
});

router.get("/clinicflow/doctors", async (req, res) => {
  try { res.json(await withSeed(() => db.select().from(doctors).where(eq(doctors.clinicId, clinicId)).orderBy(asc(doctors.name)))); }
  catch (error) { req.log.error({ error }, "Failed to load doctors"); res.status(500).json({ message: "Unable to load doctors" }); }
});

router.get("/clinicflow/conversations", async (req, res) => {
  try { res.json(await withSeed(() => db.select().from(conversations).where(eq(conversations.clinicId, clinicId)).orderBy(desc(conversations.updatedAt)))); }
  catch (error) { req.log.error({ error }, "Failed to load conversations"); res.status(500).json({ message: "Unable to load conversations" }); }
});

router.get("/clinicflow/conversations/:id", async (req, res) => {
  try {
    const result = await withSeed(async () => {
      const [conversation] = await db.select().from(conversations).where(eq(conversations.id, req.params.id));
      const thread = await db.select().from(messages).where(eq(messages.conversationId, req.params.id)).orderBy(asc(messages.createdAt));
      return { conversation, messages: thread };
    });
    if (!result.conversation) return res.status(404).json({ message: "Conversation not found" });
     return res.json(result);
  } catch (error) { req.log.error({ error }, "Failed to load conversation"); return res.status(500).json({ message: "Unable to load conversation" }); }
});

const medicalTerms = ["fever", "pain", "chest", "headache", "dizziness", "vomiting", "medicine", "tablet", "dosage", "diagnosis", "treatment", "symptom", "blood pressure", "sugar", "infection", "pregnant", "pregnancy", "emergency", "injury", "bleeding", "breathing", "prescription"];
const safetyResponse = "I’m sorry, but ClinicFlow can’t provide medical advice or diagnose symptoms. I’ll flag this conversation for the clinic team so they can assist you.";

router.post("/clinicflow/simulator/message", async (req, res) => {
  try {
    const text = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!text) return res.status(400).json({ message: "Message is required." });
    await seedDemo();
    const lower = text.toLowerCase();
    const safetyFlag = medicalTerms.some((term) => lower.includes(term));
    let response = "I can help with appointments, fees, timings, address, and general clinic information. What would you like to do?";
    if (safetyFlag) response = safetyResponse;
    else if (lower.includes("fee") || lower.includes("cost")) response = "The consultation fee at Sharma Family Clinic is ₹500. Would you like me to help you book an appointment?";
    else if (lower.includes("timing") || lower.includes("available")) response = "Dr. Ananya Sharma is available Monday to Saturday from 10:00 AM–1:00 PM and 4:00 PM–7:00 PM.";
    else if (lower.includes("address") || lower.includes("located")) response = "We’re at 123 MG Road, Pune, Maharashtra.";
    else if (lower.includes("book") || lower.includes("appointment")) response = "Sure. Dr. Ananya Sharma has openings today at 4:00 PM, 5:00 PM, and 6:00 PM. Which time works for you?";
    else if (lower.includes("reschedule")) response = "I can help with that. Please share the appointment date and the new time you prefer.";
    else if (lower.includes("cancel")) response = "I can help cancel an appointment. Please share the patient name or appointment time.";
    const conversationId = id("conv");
    await db.insert(conversations).values({ id: conversationId, clinicId, patientName: "Demo patient", lastMessage: text, status: safetyFlag ? "Needs Human" : "AI Resolved", outcome: safetyFlag ? "Human Handoff" : "Resolved", safetyFlag });
    await db.insert(messages).values([{ id: id("msg"), conversationId, sender: "patient", body: text }, { id: id("msg"), conversationId, sender: "ai", body: response }]);
    if (safetyFlag) await db.insert(handoffs).values({ id: id("handoff"), clinicId, patientName: "Demo patient", reason: "Medical Query", priority: "Urgent", status: "New" });
     return res.json({ response, safetyFlag, conversationId, status: safetyFlag ? "Needs Human" : "AI Resolved" });
  } catch (error) { req.log.error({ error }, "Failed to process simulator message"); return res.status(500).json({ message: "Unable to process simulator message" }); }
});

router.get("/clinicflow/handoffs", async (req, res) => {
  try { res.json(await withSeed(() => db.select().from(handoffs).where(eq(handoffs.clinicId, clinicId)).orderBy(desc(handoffs.createdAt)))); }
  catch (error) { req.log.error({ error }, "Failed to load handoffs"); res.status(500).json({ message: "Unable to load handoffs" }); }
});

router.patch("/clinicflow/handoffs/:id", async (req, res) => {
  try { const [updated] = await db.update(handoffs).set({ status: req.body?.status }).where(and(eq(handoffs.id, req.params.id), eq(handoffs.clinicId, clinicId))).returning(); if (!updated) return res.status(404).json({ message: "Handoff not found" }); return res.json(updated); }
  catch (error) { req.log.error({ error }, "Failed to update handoff"); return res.status(500).json({ message: "Unable to update handoff" }); }
});

router.get("/clinicflow/faqs", async (req, res) => {
  try { res.json(await withSeed(() => db.select().from(faqs).where(eq(faqs.clinicId, clinicId)).orderBy(asc(faqs.question)))); }
  catch (error) { req.log.error({ error }, "Failed to load FAQs"); res.status(500).json({ message: "Unable to load FAQs" }); }
});

router.post("/clinicflow/faqs", async (req, res) => {
  try { const { question, answer, category } = req.body ?? {}; if (![question, answer, category].every((value) => typeof value === "string" && value.trim())) return res.status(400).json({ message: "Question, answer, and category are required." }); const [created] = await db.insert(faqs).values({ id: id("faq"), clinicId, question, answer, category, status: "Active" }).returning(); return res.status(201).json(created); }
  catch (error) { req.log.error({ error }, "Failed to create FAQ"); return res.status(500).json({ message: "Unable to create FAQ" }); }
});

router.delete("/clinicflow/faqs/:id", async (req, res) => {
  try { await db.delete(faqs).where(and(eq(faqs.id, req.params.id), eq(faqs.clinicId, clinicId))); res.status(204).send(); }
  catch (error) { req.log.error({ error }, "Failed to delete FAQ"); res.status(500).json({ message: "Unable to delete FAQ" }); }
});

router.get("/clinicflow/reminders", async (req, res) => {
  try { res.json(await withSeed(() => db.select().from(reminders).where(eq(reminders.clinicId, clinicId)).orderBy(asc(reminders.scheduled)))); }
  catch (error) { req.log.error({ error }, "Failed to load reminders"); res.status(500).json({ message: "Unable to load reminders" }); }
});

router.patch("/clinicflow/reminders/:id", async (req, res) => {
  try { const [updated] = await db.update(reminders).set({ status: req.body?.status }).where(and(eq(reminders.id, req.params.id), eq(reminders.clinicId, clinicId))).returning(); if (!updated) return res.status(404).json({ message: "Reminder not found" }); return res.json(updated); }
  catch (error) { req.log.error({ error }, "Failed to update reminder"); return res.status(500).json({ message: "Unable to update reminder" }); }
});

router.get("/clinicflow/settings", async (req, res) => {
  try { const result = await withSeed(async () => { const [clinic] = await db.select().from(clinics).where(eq(clinics.id, clinicId)); const [settings] = await db.select().from(clinicSettings).where(eq(clinicSettings.clinicId, clinicId)); return { clinic, settings }; }); res.json(result); }
  catch (error) { req.log.error({ error }, "Failed to load settings"); res.status(500).json({ message: "Unable to load settings" }); }
});

router.patch("/clinicflow/settings", async (req, res) => {
  try { const [updated] = await db.update(clinicSettings).set(req.body as Partial<typeof clinicSettings.$inferInsert>).where(eq(clinicSettings.clinicId, clinicId)).returning(); res.json(updated); }
  catch (error) { req.log.error({ error }, "Failed to update settings"); res.status(500).json({ message: "Unable to update settings" }); }
});

router.post("/clinicflow/reset-demo", async (req, res) => {
  try { await db.delete(messages); await db.delete(conversations); await db.delete(appointments); await db.delete(faqs); await db.delete(reminders); await db.delete(handoffs); await db.delete(clinicSettings); await db.delete(doctors); await db.delete(clinics); await seedDemo(); res.json({ ok: true }); }
  catch (error) { req.log.error({ error }, "Failed to reset demo data"); res.status(500).json({ message: "Unable to reset demo data" }); }
});

export default router;
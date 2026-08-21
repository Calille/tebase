import type { Teacher } from "@/services/teacherService";
import type { School } from "@/services/schoolService";
import type { Booking } from "@/services/bookingService";
import { bookingListDuration } from "./bookings";
import type { SeedBooking, SeedSchool, SeedTeacher } from "../types";

export function toTeacherProfile(teacher: SeedTeacher): Teacher {
  return {
    id: teacher.id,
    name: teacher.name,
    email: teacher.email,
    phone: teacher.phone,
    subjects: [...teacher.subjects],
    status: teacher.status,
    lastBooking: teacher.lastBookingDate ?? "",
    rating: teacher.blockedFromBookings ? 0 : 4.2,
    favorite: teacher.id === "tch-john" || teacher.id === "tch-michael",
    availability: teacher.role === "supply_teacher" ? "full-time" : "part-time",
    address: `${teacher.address}, ${teacher.postcode}`,
    region: teacher.region,
    documents: [
      {
        name: "DBS certificate",
        status: teacher.dbsExpired ? "expired" : "valid",
        expiryDate: teacher.dbsExpiry,
      },
      {
        name: "Professional reference 1",
        status: "valid",
        expiryDate: "",
      },
      {
        name: "Professional reference 2",
        status: teacher.missingReference ? "missing" : "valid",
        expiryDate: "",
      },
    ],
    dbsCheckDate: teacher.dbsExpired ? teacher.dbsExpiry : teacher.dbsExpiry,
    dbsCheckNumber: teacher.dbsNumber,
    taxInformation: {
      niNumber: teacher.niNumber,
      payrollType: teacher.payrollType,
      umbrellaProvider: teacher.umbrellaProvider,
    },
    contractType: teacher.payrollType === "umbrella" ? "umbrella" : "paye",
    onboardingStatus: teacher.missingReference ? "blocked" : "completed",
    referenceContacts: teacher.missingReference
      ? []
      : [
          {
            name: "Headteacher referee",
            relationship: "Former head",
            email: `ref@${teacher.id}.example`,
            phone: "0121 555 0199",
            company: "Previous school",
          },
        ],
    salaryExpectations: {
      min: teacher.payRate ?? 0,
      max: teacher.chargeRate ?? 0,
      currency: "GBP",
      rate: "daily",
    },
    notes: teacher.blockedFromBookings
      ? "Compliance hold — do not book."
      : undefined,
  };
}

function contact(
  name: string,
  email: string,
  phone: string,
  position: string,
  lastContact: string,
) {
  return {
    name,
    position,
    phone,
    email,
    preferredContactMethod: "email",
    notes: "",
    verified: true,
    lastContactDate: lastContact,
  };
}

export function toSchoolProfile(school: SeedSchool, lastContact: string): School {
  const address = {
    street: school.address,
    city: school.city,
    state: school.region,
    zip: school.postcode,
    country: "United Kingdom",
  };
  return {
    id: school.id,
    name: school.name,
    type: school.phase,
    address,
    phone: school.phone,
    website: school.website,
    district: school.matName ?? school.city,
    yearEstablished: 1998,
    numberOfStudents: school.phase === "secondary" ? 980 : 320,
    gradeLevels:
      school.phase === "secondary"
        ? ["Year 7", "Year 8", "Year 9", "Year 10", "Year 11"]
        : ["Reception", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"],
    schoolHours: "08:45 AM - 15:15 PM",
    primaryContact: contact(school.contactName, school.contactEmail, school.phone, "Office manager", lastContact),
    secondaryContact: contact("Deputy office", `deputy@${school.id}.example`, school.phone, "Deputy", lastContact),
    financeContact: {
      name: school.contactName,
      position: "Finance",
      phone: school.phone,
      email: school.contactEmail,
      billingAddress: address,
      invoicingPreferences: school.billToId,
      paymentTerms: "30 days",
      purchaseOrderRequired: school.billToId === "bt-keep-trust",
      verified: true,
      lastContactDate: lastContact,
    },
    sendcoContact: {
      name: "SENDCO",
      position: "SENDCO",
      phone: school.phone,
      email: `sendco@${school.id}.example`,
      specializations: ["SEMH"],
      availability: "Term time",
      notes: "",
      verified: true,
      lastContactDate: lastContact,
    },
    headteacherContact: {
      name: school.contactName,
      position: "Headteacher",
      phone: school.phone,
      email: school.contactEmail,
      assistantInfo: "",
      bestTimeToContact: "After 3pm",
      verified: true,
      lastContactDate: lastContact,
    },
    specialPrograms: school.phase === "special" ? ["Specialist provision"] : [],
    keyDates: [],
    substituteRequirements: school.phase === "secondary" ? "Subject specialist preferred" : "KS2 experience",
    historicalPlacementNotes: school.dormant ? "No bookings this half-term" : "",
    administrativeNotes: school.thinMargin ? "Rates historically tight" : "",
    documents: [],
    favorite: school.id === "sch-westfield",
  };
}

export function toListBooking(booking: SeedBooking, teachers: SeedTeacher[], schools: SeedSchool[]): Booking {
  const teacher = teachers.find((t) => t.id === booking.teacherId);
  const school = schools.find((s) => s.id === booking.schoolId);
  return {
    id: booking.id,
    reference: booking.reference,
    school: { id: booking.schoolId, name: school?.name ?? booking.schoolId },
    teacher: { id: booking.teacherId, name: teacher?.name ?? booking.teacherId },
    subject: booking.subject,
    startDate: booking.startDate,
    endDate: booking.endDate,
    status: booking.status,
    duration: bookingListDuration(booking),
    rate: booking.chargeRate,
    notes: booking.notes,
  };
}

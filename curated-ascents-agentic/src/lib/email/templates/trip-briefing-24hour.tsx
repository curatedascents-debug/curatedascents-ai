import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface Service {
  serviceType: string;
  serviceName: string;
  description?: string;
}

interface TripBriefing24HourEmailProps {
  clientName?: string;
  bookingReference: string;
  tripName?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  numberOfPax?: number;
  services?: Service[];
  specialRequests?: string;
}

export default function TripBriefing24HourEmail({
  clientName,
  bookingReference,
  tripName,
  destination,
  startDate,
  endDate,
  numberOfPax,
  services = [],
  specialRequests,
}: TripBriefing24HourEmailProps) {
  const formatDate = (d?: string) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatServiceType = (type: string) => {
    return type
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>CuratedAscents</Text>
          <Text style={tagline}>Luxury Adventure Travel</Text>
          <Hr style={hr} />

          <Section style={urgentBanner}>
            <Text style={urgentText}>YOUR ADVENTURE BEGINS TOMORROW!</Text>
          </Section>

          <Text style={paragraph}>
            Dear {clientName || "Traveler"},
          </Text>
          <Text style={paragraph}>
            The moment is here! Your incredible adventure starts <strong>tomorrow</strong>.
            Here is your final trip confirmation with everything you need to know.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailLabel}>Booking Reference</Text>
            <Text style={referenceText}>{bookingReference}</Text>

            {(tripName || destination) && (
              <>
                <Text style={detailLabel}>Trip</Text>
                <Text style={detailValue}>{tripName || destination}</Text>
              </>
            )}

            <Text style={detailLabel}>Departure Date</Text>
            <Text style={highlightDate}>{formatDate(startDate)}</Text>

            {endDate && (
              <>
                <Text style={detailLabel}>Return Date</Text>
                <Text style={detailValue}>{formatDate(endDate)}</Text>
              </>
            )}

            {numberOfPax && (
              <>
                <Text style={detailLabel}>Number of Travelers</Text>
                <Text style={detailValue}>{numberOfPax} {numberOfPax === 1 ? "person" : "people"}</Text>
              </>
            )}
          </Section>

          {services.length > 0 && (
            <>
              <Text style={sectionHeading}>Your Confirmed Services</Text>
              <Section style={servicesBox}>
                {services.map((service, index) => (
                  <div key={index} style={serviceItem}>
                    <Text style={serviceName}>
                      {service.serviceName}
                    </Text>
                    <Text style={serviceType}>
                      {formatServiceType(service.serviceType)}
                    </Text>
                    {service.description && (
                      <Text style={serviceDescription}>{service.description}</Text>
                    )}
                  </div>
                ))}
              </Section>
            </>
          )}

          {specialRequests && (
            <>
              <Text style={sectionHeading}>Special Requests Noted</Text>
              <Section style={notesBox}>
                <Text style={notesText}>{specialRequests}</Text>
              </Section>
            </>
          )}

          <Text style={sectionHeading}>Final Reminders</Text>
          <Section style={reminderBox}>
            <Text style={reminderItem}>📱 Save our emergency contact number in your phone</Text>
            <Text style={reminderItem}>📄 Keep printed copies of your booking confirmation</Text>
            <Text style={reminderItem}>💳 Ensure you have local currency or working cards</Text>
            <Text style={reminderItem}>🧳 Double-check your luggage against your packing list</Text>
            <Text style={reminderItem}>✈️ Arrive at the airport with plenty of time to spare</Text>
          </Section>

          <Section style={contactBox}>
            <Text style={contactHeading}>Need to Reach Us?</Text>
            <Text style={contactText}>
              Our team is available 24/7 during your trip. Save our emergency contact
              and don&apos;t hesitate to reach out if you need anything.
            </Text>
          </Section>

          <Text style={paragraph}>
            <strong>Have a safe and wonderful journey!</strong> We have taken care of all the details
            so you can focus on enjoying every moment of your adventure.
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            CuratedAscents | Luxury Adventure Travel | Nepal | Tibet | Bhutan | India
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 30px",
  maxWidth: "600px",
};

const brand: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#0d5e3f",
  margin: "0",
};

const tagline: React.CSSProperties = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0 0 16px",
};

const hr: React.CSSProperties = { borderColor: "#e5e7eb", margin: "20px 0" };

const urgentBanner: React.CSSProperties = {
  backgroundColor: "#0d5e3f",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
  textAlign: "center" as const,
};

const urgentText: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#ffffff",
  margin: "0",
  letterSpacing: "1px",
};

const sectionHeading: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#374151",
  margin: "24px 0 12px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#374151",
  margin: "0 0 16px",
};

const detailsBox: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
  border: "1px solid #bbf7d0",
};

const servicesBox: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "16px",
  margin: "8px 0",
  border: "1px solid #e2e8f0",
};

const reminderBox: React.CSSProperties = {
  backgroundColor: "#fffbeb",
  borderRadius: "8px",
  padding: "16px",
  margin: "8px 0",
  border: "1px solid #fde68a",
};

const notesBox: React.CSSProperties = {
  backgroundColor: "#f5f3ff",
  borderRadius: "8px",
  padding: "16px",
  margin: "8px 0",
  border: "1px solid #ddd6fe",
};

const contactBox: React.CSSProperties = {
  backgroundColor: "#ecfdf5",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
  border: "2px solid #0d5e3f",
};

const contactHeading: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#0d5e3f",
  margin: "0 0 8px",
};

const contactText: React.CSSProperties = {
  fontSize: "14px",
  color: "#374151",
  margin: "0",
};

const detailLabel: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#6b7280",
  textTransform: "uppercase" as const,
  margin: "0",
};

const detailValue: React.CSSProperties = {
  fontSize: "16px",
  color: "#111827",
  margin: "0 0 12px",
};

const referenceText: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#0d5e3f",
  margin: "0 0 12px",
  letterSpacing: "1px",
};

const highlightDate: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#0d5e3f",
  margin: "0 0 12px",
};

const serviceItem: React.CSSProperties = {
  borderBottom: "1px solid #e2e8f0",
  paddingBottom: "12px",
  marginBottom: "12px",
};

const serviceName: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: "600",
  color: "#111827",
  margin: "0",
};

const serviceType: React.CSSProperties = {
  fontSize: "12px",
  color: "#6b7280",
  margin: "2px 0 0",
};

const serviceDescription: React.CSSProperties = {
  fontSize: "13px",
  color: "#4b5563",
  margin: "4px 0 0",
};

const reminderItem: React.CSSProperties = {
  fontSize: "14px",
  color: "#374151",
  margin: "0 0 8px",
};

const notesText: React.CSSProperties = {
  fontSize: "14px",
  color: "#4b5563",
  margin: "0",
  fontStyle: "italic",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "0",
};

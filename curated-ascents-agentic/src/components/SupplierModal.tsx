"use client";

import { useState } from "react";

interface Contact {
  name: string;
  designation: string;
  department: string;
  email: string;
  phoneBusiness: string;
  phoneMobile: string;
  phoneWhatsapp: string;
  isPrimary: boolean;
}

interface SupplierModalProps {
  supplier: any | null;
  isNew: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

const emptyContact: Contact = {
  name: "",
  designation: "",
  department: "",
  email: "",
  phoneBusiness: "",
  phoneMobile: "",
  phoneWhatsapp: "",
  isPrimary: false,
};

export default function SupplierModal({
  supplier,
  isNew,
  onClose,
  onSave,
  onDelete,
}: SupplierModalProps) {
  const [formData, setFormData] = useState(() => {
    const initial = supplier || {
      name: "",
      type: "",
      country: "",
      city: "",
      contacts: [],
      salesEmail: "",
      reservationEmail: "",
      accountsEmail: "",
      operationsEmail: "",
      phoneMain: "",
      phoneSales: "",
      phoneReservation: "",
      phoneEmergency: "",
      phoneWhatsapp: "",
      website: "",
      bookingPortal: "",
      address: "",
      postalCode: "",
      bankName: "",
      bankBranch: "",
      bankAccountName: "",
      bankAccountNumber: "",
      bankSwiftCode: "",
      bankIban: "",
      paymentTerms: "",
      creditLimit: "",
      currency: "USD",
      contractStartDate: "",
      contractEndDate: "",
      commissionPercent: "",
      notes: "",
      internalRemarks: "",
      reliabilityRating: "",
      qualityRating: "",
      valueRating: "",
      isActive: true,
      isPreferred: false,
    };
    
    // Ensure contacts is an array
    if (!initial.contacts || !Array.isArray(initial.contacts)) {
      initial.contacts = [];
    }
    
    return initial;
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("basic");

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // Contact management
  const addContact = () => {
    const newContact = { ...emptyContact };
    // If this is the first contact, make it primary
    if (formData.contacts.length === 0) {
      newContact.isPrimary = true;
    }
    handleChange("contacts", [...formData.contacts, newContact]);
  };

  const updateContact = (index: number, field: string, value: any) => {
    const updatedContacts = [...formData.contacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    
    // If setting as primary, remove primary from others
    if (field === "isPrimary" && value === true) {
      updatedContacts.forEach((contact, i) => {
        if (i !== index) contact.isPrimary = false;
      });
    }
    
    handleChange("contacts", updatedContacts);
  };

  const removeContact = (index: number) => {
    const updatedContacts = formData.contacts.filter((_: any, i: number) => i !== index);
    // If we removed the primary contact and there are still contacts, make the first one primary
    if (formData.contacts[index]?.isPrimary && updatedContacts.length > 0) {
      updatedContacts[0].isPrimary = true;
    }
    handleChange("contacts", updatedContacts);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      setError("Supplier name is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const url = isNew
        ? "/api/admin/suppliers"
        : `/api/admin/suppliers/${supplier.id}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to save supplier");
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: "basic", label: "Basic Info" },
    { id: "contacts", label: "Contact Persons" },
    { id: "emails", label: "Dept. Emails" },
    { id: "phones", label: "Phone Numbers" },
    { id: "banking", label: "Banking" },
    { id: "contract", label: "Contract" },
    { id: "notes", label: "Notes & Ratings" },
  ];

  const designations = [
    "Owner",
    "Managing Director",
    "General Manager",
    "Operations Manager",
    "Sales Manager",
    "Reservation Manager",
    "Front Office Manager",
    "Accounts Manager",
    "Marketing Manager",
    "Sales Executive",
    "Reservation Executive",
    "Operations Executive",
    "Other",
  ];

  const departments = [
    "Management",
    "Sales",
    "Reservations",
    "Operations",
    "Accounts",
    "Marketing",
    "Front Office",
    "Other",
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white">
              {isNew ? "Add New Supplier" : `Edit: ${supplier?.name}`}
            </h2>
            <p className="text-slate-400 text-sm">
              {isNew ? "Create a new supplier record" : `ID: ${supplier?.id}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1 p-2 bg-slate-900 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-3 py-2 rounded text-sm whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-300">
            {error}
          </div>
        )}

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* BASIC INFO */}
          {activeSection === "basic" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">
                Basic Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Supplier Name *">
                  <Input
                    value={formData.name}
                    onChange={(v: string) => handleChange("name", v)}
                    placeholder="e.g., Dwarika's Group"
                  />
                </FormField>

                <FormField label="Supplier Type">
                  <Select
                    value={formData.type}
                    onChange={(v: string) => handleChange("type", v)}
                    options={[
                      { value: "", label: "Select type..." },
                      { value: "hotel", label: "Hotel / Lodge" },
                      { value: "transport", label: "Transportation" },
                      { value: "airline", label: "Airline" },
                      { value: "helicopter", label: "Helicopter Operator" },
                      { value: "adventure_company", label: "Adventure Company" },
                      { value: "guide_company", label: "Guide/Porter Agency" },
                      { value: "dmc", label: "DMC / Tour Operator" },
                      { value: "restaurant", label: "Restaurant" },
                      { value: "activity", label: "Activity Provider" },
                      { value: "other", label: "Other" },
                    ]}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Country">
                  <Select
                    value={formData.country}
                    onChange={(v: string) => handleChange("country", v)}
                    options={[
                      { value: "", label: "Select country..." },
                      { value: "Nepal", label: "Nepal" },
                      { value: "Tibet", label: "Tibet" },
                      { value: "Bhutan", label: "Bhutan" },
                      { value: "India", label: "India" },
                    ]}
                  />
                </FormField>

                <FormField label="City">
                  <Input
                    value={formData.city}
                    onChange={(v: string) => handleChange("city", v)}
                    placeholder="e.g., Kathmandu"
                  />
                </FormField>
              </div>

              <FormField label="Address">
                <TextArea
                  value={formData.address}
                  onChange={(v: string) => handleChange("address", v)}
                  placeholder="Full address..."
                  rows={2}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Postal Code">
                  <Input
                    value={formData.postalCode}
                    onChange={(v: string) => handleChange("postalCode", v)}
                  />
                </FormField>

                <FormField label="Website">
                  <Input
                    value={formData.website}
                    onChange={(v: string) => handleChange("website", v)}
                    placeholder="https://..."
                  />
                </FormField>
              </div>

              <FormField label="Online Booking Portal">
                <Input
                  value={formData.bookingPortal}
                  onChange={(v: string) => handleChange("bookingPortal", v)}
                  placeholder="URL to their booking system (if any)"
                />
              </FormField>

              <div className="flex gap-4 mt-4">
                <Checkbox
                  checked={formData.isActive}
                  onChange={(v: boolean) => handleChange("isActive", v)}
                  label="Active Supplier"
                />
                <Checkbox
                  checked={formData.isPreferred}
                  onChange={(v: boolean) => handleChange("isPreferred", v)}
                  label="⭐ Preferred Supplier"
                />
              </div>
            </div>
          )}

          {/* CONTACT PERSONS */}
          {activeSection === "contacts" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-emerald-400">
                  Contact Persons
                </h3>
                <button
                  type="button"
                  onClick={addContact}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded transition-colors text-sm"
                >
                  + Add Contact
                </button>
              </div>

              {formData.contacts.length === 0 ? (
                <div className="text-center py-8 bg-slate-900 rounded-lg">
                  <p className="text-slate-400 mb-4">No contact persons added yet</p>
                  <button
                    type="button"
                    onClick={addContact}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded transition-colors"
                  >
                    Add First Contact
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.contacts.map((contact: Contact, index: number) => (
                    <div
                      key={index}
                      className={`bg-slate-900 p-4 rounded-lg border-2 ${
                        contact.isPrimary ? "border-emerald-500" : "border-slate-700"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 font-medium">
                            Contact #{index + 1}
                          </span>
                          {contact.isPrimary && (
                            <span className="px-2 py-1 bg-emerald-600 text-white text-xs rounded">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!contact.isPrimary && (
                            <button
                              type="button"
                              onClick={() => updateContact(index, "isPrimary", true)}
                              className="text-sm text-emerald-400 hover:text-emerald-300"
                            >
                              Set as Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeContact(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <FormField label="Name">
                          <Input
                            value={contact.name}
                            onChange={(v: string) => updateContact(index, "name", v)}
                            placeholder="Full name"
                          />
                        </FormField>
                        <FormField label="Designation">
                          <Select
                            value={contact.designation}
                            onChange={(v: string) => updateContact(index, "designation", v)}
                            options={[
                              { value: "", label: "Select..." },
                              ...designations.map((d) => ({ value: d, label: d })),
                            ]}
                          />
                        </FormField>
                        <FormField label="Department">
                          <Select
                            value={contact.department}
                            onChange={(v: string) => updateContact(index, "department", v)}
                            options={[
                              { value: "", label: "Select..." },
                              ...departments.map((d) => ({ value: d, label: d })),
                            ]}
                          />
                        </FormField>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <FormField label="Email">
                          <Input
                            type="email"
                            value={contact.email}
                            onChange={(v: string) => updateContact(index, "email", v)}
                            placeholder="email@example.com"
                          />
                        </FormField>
                        <FormField label="WhatsApp">
                          <Input
                            value={contact.phoneWhatsapp}
                            onChange={(v: string) => updateContact(index, "phoneWhatsapp", v)}
                            placeholder="+977..."
                          />
                        </FormField>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField label="Business Phone">
                          <Input
                            value={contact.phoneBusiness}
                            onChange={(v: string) => updateContact(index, "phoneBusiness", v)}
                            placeholder="Office/Landline"
                          />
                        </FormField>
                        <FormField label="Mobile Phone">
                          <Input
                            value={contact.phoneMobile}
                            onChange={(v: string) => updateContact(index, "phoneMobile", v)}
                            placeholder="Mobile number"
                          />
                        </FormField>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DEPARTMENT EMAILS */}
          {activeSection === "emails" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">
                Department Emails
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Generic department email addresses (not tied to specific persons)
              </p>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Sales Email">
                  <Input
                    value={formData.salesEmail}
                    onChange={(v: string) => handleChange("salesEmail", v)}
                    placeholder="sales@..."
                    type="email"
                  />
                </FormField>
                <FormField label="Reservation Email">
                  <Input
                    value={formData.reservationEmail}
                    onChange={(v: string) => handleChange("reservationEmail", v)}
                    placeholder="reservations@..."
                    type="email"
                  />
                </FormField>
                <FormField label="Accounts Email">
                  <Input
                    value={formData.accountsEmail}
                    onChange={(v: string) => handleChange("accountsEmail", v)}
                    placeholder="accounts@..."
                    type="email"
                  />
                </FormField>
                <FormField label="Operations Email">
                  <Input
                    value={formData.operationsEmail}
                    onChange={(v: string) => handleChange("operationsEmail", v)}
                    placeholder="operations@..."
                    type="email"
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* PHONE NUMBERS */}
          {activeSection === "phones" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">
                Company Phone Numbers
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Main company phone lines (not personal numbers)
              </p>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Main Office">
                  <Input
                    value={formData.phoneMain}
                    onChange={(v: string) => handleChange("phoneMain", v)}
                    placeholder="+977-1-..."
                  />
                </FormField>
                <FormField label="Sales Direct">
                  <Input
                    value={formData.phoneSales}
                    onChange={(v: string) => handleChange("phoneSales", v)}
                    placeholder="+977..."
                  />
                </FormField>
                <FormField label="Reservation Direct">
                  <Input
                    value={formData.phoneReservation}
                    onChange={(v: string) => handleChange("phoneReservation", v)}
                    placeholder="+977..."
                  />
                </FormField>
                <FormField label="Emergency (24/7)">
                  <Input
                    value={formData.phoneEmergency}
                    onChange={(v: string) => handleChange("phoneEmergency", v)}
                    placeholder="+977..."
                  />
                </FormField>
                <FormField label="Company WhatsApp">
                  <Input
                    value={formData.phoneWhatsapp}
                    onChange={(v: string) => handleChange("phoneWhatsapp", v)}
                    placeholder="+977..."
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* BANKING */}
          {activeSection === "banking" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">
                Banking Details
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                🔒 This information is confidential and only visible to admin users.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Bank Name">
                  <Input
                    value={formData.bankName}
                    onChange={(v: string) => handleChange("bankName", v)}
                    placeholder="e.g., Nepal Investment Bank"
                  />
                </FormField>
                <FormField label="Branch">
                  <Input
                    value={formData.bankBranch}
                    onChange={(v: string) => handleChange("bankBranch", v)}
                    placeholder="e.g., Durbar Marg"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Account Name">
                  <Input
                    value={formData.bankAccountName}
                    onChange={(v: string) => handleChange("bankAccountName", v)}
                    placeholder="Account holder name"
                  />
                </FormField>
                <FormField label="Account Number">
                  <Input
                    value={formData.bankAccountNumber}
                    onChange={(v: string) => handleChange("bankAccountNumber", v)}
                    placeholder="Account number"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="SWIFT Code">
                  <Input
                    value={formData.bankSwiftCode}
                    onChange={(v: string) => handleChange("bankSwiftCode", v)}
                    placeholder="e.g., NIABORKA"
                  />
                </FormField>
                <FormField label="IBAN (if applicable)">
                  <Input
                    value={formData.bankIban}
                    onChange={(v: string) => handleChange("bankIban", v)}
                    placeholder="IBAN number"
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* CONTRACT */}
          {activeSection === "contract" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">
                Contract & Payment Terms
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Contract Start Date">
                  <Input
                    type="date"
                    value={formData.contractStartDate?.split("T")[0] || ""}
                    onChange={(v: string) => handleChange("contractStartDate", v)}
                  />
                </FormField>
                <FormField label="Contract End Date">
                  <Input
                    type="date"
                    value={formData.contractEndDate?.split("T")[0] || ""}
                    onChange={(v: string) => handleChange("contractEndDate", v)}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField label="Payment Terms">
                  <Select
                    value={formData.paymentTerms}
                    onChange={(v: string) => handleChange("paymentTerms", v)}
                    options={[
                      { value: "", label: "Select..." },
                      { value: "prepaid", label: "100% Prepaid" },
                      { value: "50_advance", label: "50% Advance" },
                      { value: "net_7", label: "Net 7 Days" },
                      { value: "net_15", label: "Net 15 Days" },
                      { value: "net_30", label: "Net 30 Days" },
                      { value: "net_45", label: "Net 45 Days" },
                      { value: "on_checkout", label: "On Checkout" },
                    ]}
                  />
                </FormField>
                <FormField label="Credit Limit">
                  <Input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(v: string) => handleChange("creditLimit", v)}
                    placeholder="0.00"
                  />
                </FormField>
                <FormField label="Currency">
                  <Select
                    value={formData.currency}
                    onChange={(v: string) => handleChange("currency", v)}
                    options={[
                      { value: "USD", label: "USD" },
                      { value: "NPR", label: "NPR" },
                      { value: "EUR", label: "EUR" },
                      { value: "GBP", label: "GBP" },
                    ]}
                  />
                </FormField>
              </div>

              <FormField label="Commission %">
                <Input
                  type="number"
                  value={formData.commissionPercent}
                  onChange={(v: string) => handleChange("commissionPercent", v)}
                  placeholder="e.g., 10"
                />
              </FormField>
            </div>
          )}

          {/* NOTES & RATINGS */}
          {activeSection === "notes" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">
                Notes & Internal Ratings
              </h3>

              <FormField label="General Notes">
                <TextArea
                  value={formData.notes}
                  onChange={(v: string) => handleChange("notes", v)}
                  placeholder="General notes about this supplier..."
                  rows={3}
                />
              </FormField>

              <FormField label="Internal Remarks (Confidential)">
                <TextArea
                  value={formData.internalRemarks}
                  onChange={(v: string) => handleChange("internalRemarks", v)}
                  placeholder="Confidential remarks - quality issues, negotiations, etc."
                  rows={3}
                />
              </FormField>

              <div className="bg-slate-900 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-slate-300 mb-4">
                  Internal Ratings (1-5)
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <FormField label="Reliability">
                    <Select
                      value={formData.reliabilityRating?.toString() || ""}
                      onChange={(v: string) =>
                        handleChange("reliabilityRating", v ? parseInt(v) : null)
                      }
                      options={[
                        { value: "", label: "Not rated" },
                        { value: "1", label: "1 - Poor" },
                        { value: "2", label: "2 - Fair" },
                        { value: "3", label: "3 - Good" },
                        { value: "4", label: "4 - Very Good" },
                        { value: "5", label: "5 - Excellent" },
                      ]}
                    />
                  </FormField>
                  <FormField label="Quality">
                    <Select
                      value={formData.qualityRating?.toString() || ""}
                      onChange={(v: string) =>
                        handleChange("qualityRating", v ? parseInt(v) : null)
                      }
                      options={[
                        { value: "", label: "Not rated" },
                        { value: "1", label: "1 - Poor" },
                        { value: "2", label: "2 - Fair" },
                        { value: "3", label: "3 - Good" },
                        { value: "4", label: "4 - Very Good" },
                        { value: "5", label: "5 - Excellent" },
                      ]}
                    />
                  </FormField>
                  <FormField label="Value for Money">
                    <Select
                      value={formData.valueRating?.toString() || ""}
                      onChange={(v: string) =>
                        handleChange("valueRating", v ? parseInt(v) : null)
                      }
                      options={[
                        { value: "", label: "Not rated" },
                        { value: "1", label: "1 - Poor" },
                        { value: "2", label: "2 - Fair" },
                        { value: "3", label: "3 - Good" },
                        { value: "4", label: "4 - Very Good" },
                        { value: "5", label: "5 - Excellent" },
                      ]}
                    />
                  </FormField>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 flex justify-between bg-slate-800">
          {!isNew && onDelete ? (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded transition-colors"
            >
              Delete Supplier
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded transition-colors"
              disabled={saving}
            >
              {saving ? "Saving..." : isNew ? "Create Supplier" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder, ...props }: any) {
  return (
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
      {...props}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: any) {
  return (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
    />
  );
}

function Select({ value, onChange, options }: any) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function Checkbox({ checked, onChange, label }: any) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked || false}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded bg-slate-700 border-slate-600"
      />
      <span className="text-slate-300">{label}</span>
    </label>
  );
}

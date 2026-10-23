import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';

import {
    FaTimes,
    FaUser,
    FaUsers,
    FaMapMarkerAlt,
    FaChevronDown,
    FaCheckCircle,
    FaSave,
    FaPhone,
    FaCalendarAlt,
    FaIdCard,
    FaBuilding,
    FaVenusMars,
    FaBriefcase,
    FaSpinner,
} from 'react-icons/fa';

// =============================================================
// CONSTANTS
// =============================================================

const MEMBER_ROLES = [
    'President',
    'Vice President',
    'Secretary',
    'Assistant Secretary',
    'Treasurer',
    'Assistant Treasurer',
    'Auditor',
    'Public Relations Officer (PRO)',
    'Board Member',
    'Committee Member',
    'Member',
    'Other',
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

const STATUS_OPTIONS = ['Active', 'Inactive'];

const initialForm = {
    member_name: '',
    gender: '',
    birthdate: '',
    role: '',
    contact_number: '',
    city_municipality: '',
    barangay: '',
    purok: '',
    status: 'Active',
};

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';

const labelClass =
    'mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500';

// =============================================================
// HELPERS
// =============================================================

const getLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const getBeneficiaryId = (beneficiary) =>
    beneficiary?.beneficiaries_id ??
    beneficiary?.beneficiary_id ??
    beneficiary?.id ??
    '';

const getParticipantName = (beneficiary) =>
    beneficiary?.name_of_slpa_slp_participant ??
    beneficiary?.name_of_slp_participant ??
    beneficiary?.participant_name ??
    beneficiary?.name ??
    '';

// =============================================================
// REUSABLE FORM FIELD
// =============================================================

function Field({ label, icon: Icon, error, children, id }) {
    return (
        <div className="min-w-0">
            <label htmlFor={id} className={labelClass}>
                {Icon && (
                    <Icon className="mr-2 inline-block text-emerald-600" />
                )}
                {label}
            </label>

            {children}

            {error && (
                <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

// =============================================================
// REUSABLE SECTION HEADING
// =============================================================

function SectionTitle({ number, title, description }) {
    return (
        <div className="mb-5 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-extrabold text-emerald-700">
                {number}
            </div>

            <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-slate-800">
                    {title}
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

// =============================================================
// REUSABLE SELECT
// =============================================================

function SelectField({
    id,
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
}) {
    return (
        <div className="relative">
            <select
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`${inputClass} appearance-none pr-10`}
                required
            >
                <option value="">{placeholder}</option>

                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>

            <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
        </div>
    );
}

// =============================================================
// MODAL MEMBER
// =============================================================

export default function ModalMember({
    isOpen = false,
    onClose = () => {},
    beneficiary = null,
}) {
    const [form, setForm] = useState({ ...initialForm });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const today = useMemo(() => getLocalDate(), []);

    const beneficiaryId = useMemo(
        () => getBeneficiaryId(beneficiary),
        [beneficiary],
    );

    const participantName = useMemo(
        () => getParticipantName(beneficiary),
        [beneficiary],
    );

    // =========================================================
    // INITIALIZE FORM
    // =========================================================

    useEffect(() => {
        if (!isOpen) return;

        setForm({
            ...initialForm,
            city_municipality:
                beneficiary?.city_municipality ??
                beneficiary?.municipality ??
                '',
            barangay: beneficiary?.barangay ?? '',
        });

        setErrors({});
        setProcessing(false);
    }, [isOpen, beneficiary]);

    // =========================================================
    // CLOSE MODAL USING ESCAPE
    // =========================================================

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event) => {
            if (event.key === 'Escape' && !processing) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, processing, onClose]);

    // =========================================================
    // UPDATE FORM FIELD
    // =========================================================

    const updateField = (field, value) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        setErrors((current) => ({
            ...current,
            [field]: '',
        }));
    };

    // =========================================================
    // VALIDATE FORM
    // =========================================================

    const validateForm = () => {
        const nextErrors = {};

        if (!form.member_name.trim()) {
            nextErrors.member_name = 'Please enter the member name.';
        }

        if (!form.role) {
            nextErrors.role = 'Please select a member role.';
        }

        if (form.role === 'Other') {
            nextErrors.role =
                'Please select a specific association role instead of Other.';
        }

        if (!form.gender) {
            nextErrors.gender = 'Please select a gender.';
        }

        if (!form.birthdate) {
            nextErrors.birthdate = 'Please enter the birthdate.';
        } else if (form.birthdate > today) {
            nextErrors.birthdate = 'Birthdate cannot be in the future.';
        }

        if (!form.contact_number.trim()) {
            nextErrors.contact_number = 'Please enter a contact number.';
        }

        if (!form.city_municipality.trim()) {
            nextErrors.city_municipality =
                'Please enter the city or municipality.';
        }

        if (!form.barangay.trim()) {
            nextErrors.barangay = 'Please enter the barangay.';
        }

        if (!form.purok.trim()) {
            nextErrors.purok = 'Please enter the purok or sitio.';
        }

        if (!form.status) {
            nextErrors.status = 'Please select a member status.';
        }

        if (!beneficiaryId) {
            nextErrors.beneficiaries_id =
                'No beneficiary record is linked to this member.';
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    // =========================================================
    // SUBMIT FORM
    // =========================================================

    const submit = (event) => {
        event.preventDefault();

        if (processing || !validateForm()) return;

        setProcessing(true);

        router.post(
            '/slp-members',
            {
                ...form,
                beneficiaries_id: beneficiaryId,
                name_of_slpa_slp_participant: participantName,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setForm({ ...initialForm });
                    setErrors({});
                    onClose();
                },

                onError: (serverErrors) => {
                    setErrors(serverErrors);
                },

                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    // Do not render the modal when closed.
    if (!isOpen) return null;

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !processing
                ) {
                    onClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="member-modal-title"
                className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/20"
            >
                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 px-5 py-6 sm:px-8">
                    <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full border-[28px] border-white/5" />

                    <div className="pointer-events-none absolute -bottom-20 right-40 h-40 w-40 rounded-full bg-emerald-400/10 blur-2xl" />

                    <div className="relative flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-xl text-emerald-200">
                                <FaUsers />
                            </div>

                            <div className="min-w-0">
                                <div className="mb-2 flex flex-wrap gap-2">
                                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">
                                        SLP Management
                                    </span>

                                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/80">
                                        Member Registration
                                    </span>
                                </div>

                                <h2
                                    id="member-modal-title"
                                    className="text-xl font-extrabold tracking-tight text-white sm:text-2xl"
                                >
                                    Add Association Member
                                </h2>

                                <p className="mt-1.5 text-xs leading-relaxed text-emerald-100/80 sm:text-sm">
                                    Register the member's personal
                                    information, association role, and
                                    residential address.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            aria-label="Close member registration"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Beneficiary Reference */}

                    <div className="relative mt-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-200">
                                <FaBuilding />
                            </div>

                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">
                                    SLP Participant
                                </p>

                                <p className="mt-1 break-words text-sm font-bold text-white">
                                    {participantName ||
                                        'No participant selected'}
                                </p>
                            </div>
                        </div>

                        <div className="sm:text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">
                                Beneficiary ID
                            </p>

                            <p className="mt-1 font-mono text-sm font-bold text-white">
                                {beneficiaryId || 'Not available'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    FORM
                ================================================= */}

                <form
                    onSubmit={submit}
                    noValidate
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="flex-1 space-y-7 overflow-y-auto px-5 py-6 sm:px-8">
                        {/* GENERAL ERRORS */}

                        {errors.beneficiaries_id && (
                            <div
                                role="alert"
                                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                            >
                                {errors.beneficiaries_id}
                            </div>
                        )}

                        {errors.member && (
                            <div
                                role="alert"
                                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                            >
                                {errors.member}
                            </div>
                        )}

                        {/* =========================================
                            SECTION 01: PERSONAL INFORMATION
                        ========================================= */}

                        <section>
                            <SectionTitle
                                number="01"
                                title="Personal Information"
                                description="Enter the member's identification details and association position."
                            />

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                {/* Member Name */}

                                <Field
                                    id="member_name"
                                    label="Full Member Name"
                                    icon={FaUser}
                                    error={errors.member_name}
                                >
                                    <input
                                        id="member_name"
                                        name="member_name"
                                        type="text"
                                        value={form.member_name}
                                        onChange={(event) =>
                                            updateField(
                                                'member_name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Enter complete name"
                                        className={inputClass}
                                        autoComplete="name"
                                        disabled={processing}
                                        required
                                    />
                                </Field>

                                {/* Member Role Dropdown */}

                                <Field
                                    id="role"
                                    label="Association Role"
                                    icon={FaBriefcase}
                                    error={errors.role}
                                >
                                    <SelectField
                                        id="role"
                                        value={form.role}
                                        onChange={(event) =>
                                            updateField(
                                                'role',
                                                event.target.value,
                                            )
                                        }
                                        options={MEMBER_ROLES}
                                        placeholder="Select association role"
                                        disabled={processing}
                                    />
                                </Field>

                                {/* Gender */}

                                <Field
                                    id="gender"
                                    label="Gender"
                                    icon={FaVenusMars}
                                    error={errors.gender}
                                >
                                    <SelectField
                                        id="gender"
                                        value={form.gender}
                                        onChange={(event) =>
                                            updateField(
                                                'gender',
                                                event.target.value,
                                            )
                                        }
                                        options={GENDER_OPTIONS}
                                        placeholder="Select gender"
                                        disabled={processing}
                                    />
                                </Field>

                                {/* Birthdate */}

                                <Field
                                    id="birthdate"
                                    label="Birthdate"
                                    icon={FaCalendarAlt}
                                    error={errors.birthdate}
                                >
                                    <input
                                        id="birthdate"
                                        name="birthdate"
                                        type="date"
                                        value={form.birthdate}
                                        max={today}
                                        onChange={(event) =>
                                            updateField(
                                                'birthdate',
                                                event.target.value,
                                            )
                                        }
                                        className={inputClass}
                                        disabled={processing}
                                        required
                                    />
                                </Field>

                                {/* Contact Number */}

                                <Field
                                    id="contact_number"
                                    label="Contact Number"
                                    icon={FaPhone}
                                    error={errors.contact_number}
                                >
                                    <input
                                        id="contact_number"
                                        name="contact_number"
                                        type="tel"
                                        value={form.contact_number}
                                        onChange={(event) =>
                                            updateField(
                                                'contact_number',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Enter contact number"
                                        className={inputClass}
                                        autoComplete="tel"
                                        disabled={processing}
                                        required
                                    />
                                </Field>

                                {/* Member Status */}

                                <Field
                                    id="status"
                                    label="Member Status"
                                    icon={FaCheckCircle}
                                    error={errors.status}
                                >
                                    <SelectField
                                        id="status"
                                        value={form.status}
                                        onChange={(event) =>
                                            updateField(
                                                'status',
                                                event.target.value,
                                            )
                                        }
                                        options={STATUS_OPTIONS}
                                        disabled={processing}
                                    />
                                </Field>
                            </div>
                        </section>

                        <div className="border-t border-slate-100" />

                        {/* =========================================
                            SECTION 02: RESIDENTIAL ADDRESS
                        ========================================= */}

                        <section>
                            <SectionTitle
                                number="02"
                                title="Residential Address"
                                description="Provide the member's current city or municipality, barangay, and purok or sitio."
                            />

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                {/* Municipality */}

                                <Field
                                    id="city_municipality"
                                    label="City / Municipality"
                                    icon={FaBuilding}
                                    error={errors.city_municipality}
                                >
                                    <input
                                        id="city_municipality"
                                        name="city_municipality"
                                        type="text"
                                        value={form.city_municipality}
                                        onChange={(event) =>
                                            updateField(
                                                'city_municipality',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Enter city or municipality"
                                        className={inputClass}
                                        disabled={processing}
                                        required
                                    />
                                </Field>

                                {/* Barangay */}

                                <Field
                                    id="barangay"
                                    label="Barangay"
                                    icon={FaMapMarkerAlt}
                                    error={errors.barangay}
                                >
                                    <input
                                        id="barangay"
                                        name="barangay"
                                        type="text"
                                        value={form.barangay}
                                        onChange={(event) =>
                                            updateField(
                                                'barangay',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Enter barangay"
                                        className={inputClass}
                                        disabled={processing}
                                        required
                                    />
                                </Field>

                                {/* Purok / Sitio */}

                                <Field
                                    id="purok"
                                    label="Purok / Sitio"
                                    icon={FaMapMarkerAlt}
                                    error={errors.purok}
                                >
                                    <input
                                        id="purok"
                                        name="purok"
                                        type="text"
                                        value={form.purok}
                                        onChange={(event) =>
                                            updateField(
                                                'purok',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Enter purok or sitio"
                                        className={inputClass}
                                        disabled={processing}
                                        required
                                    />
                                </Field>
                            </div>
                        </section>

                        {/* =========================================
                            REGISTRATION INFORMATION
                        ========================================= */}

                        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                            <div className="mt-0.5 text-emerald-600">
                                <FaIdCard />
                            </div>

                            <div>
                                <p className="text-xs font-extrabold text-emerald-900">
                                    Beneficiary record linked
                                </p>

                                <p className="mt-1 text-xs leading-relaxed text-emerald-800/80">
                                    This member will be linked to the
                                    beneficiary shown above. The member ID
                                    and timestamps should be generated by
                                    your Laravel backend.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        FOOTER ACTIONS
                    ================================================= */}

                    <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                        <p className="text-[11px] leading-relaxed text-slate-500">
                            <span className="font-bold text-red-500">*</span>{' '}
                            Required fields must be completed.
                        </p>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={processing}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={processing || !beneficiaryId}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Saving Member...
                                    </>
                                ) : (
                                    <>
                                        <FaSave />
                                        Save Member
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
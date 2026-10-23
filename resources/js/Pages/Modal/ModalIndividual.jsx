import { useState, useEffect, useMemo } from 'react';
import { 
    FaTimes, 
    FaBuilding, 
    FaStore, 
    FaUserTie, 
    FaUsers, 
    FaPlus, 
    FaTrash, 
    FaChevronRight, 
    FaChevronLeft, 
    FaCheckCircle,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaUser,
    FaBriefcase
} from 'react-icons/fa';

export default function ModalIndividual({ 
    isOpen, 
    onClose, 
    individualData, 
    onAddParticipant,
    municipalities = [],
    barangays = []
}) {
    const [activeWizardStep, setActiveWizardStep] = useState(1);
    const [participantList, setParticipantList] = useState([]);
    const [viewingParticipant, setViewingParticipant] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

const [wizardData, setWizardData] = useState({
    track: 'MD',
    fullName: '',
    sex: 'Female',
    address: '',
    contactNumber: '',
    municipality_id: '',
    barangay_id: '',
    validated: true,
    assessmentNotes: '',
    enterpriseName: '',
    enterpriseType: 'Consumer Retail & Trading',
    businessLocation: '',
    targetJob: '',
    skillsTraining: '',
    preferredEmployer: ''
});

    // Reset wizard state whenever the modal is opened
    useEffect(() => {
        if (isOpen) {
            setActiveWizardStep(1);
            setWizardData({
                track: 'MD',
                fullName: individualData?.fullName || '',
                sex: individualData?.sex || 'Female',
                address: individualData?.address || '',
                contactNumber: individualData?.contactNumber || '',
                municipality: individualData?.municipality || 'Kapatagan',
                barangay: individualData?.barangay || '',
                validated: true,
                assessmentNotes: '',
                enterpriseName: '',
                enterpriseType: 'Consumer Retail & Trading',
                businessLocation: '',
                targetJob: '',
                skillsTraining: '',
                preferredEmployer: ''
            });
        }
    }, [isOpen, individualData]);

    const filteredBarangays = useMemo(() => {
    if (!wizardData.municipality_id) {
        return [];
    }

    return barangays.filter(
        barangay =>
            String(barangay.municipality_id) ===
            String(wizardData.municipality_id)
    );
}, [barangays, wizardData.municipality_id]);

    const handleWizardSubmit = (e) => {
        e.preventDefault();
        const isMD = wizardData.track === 'MD';

        const newParticipant = {
            id: Date.now(),
            fullName: wizardData.fullName,
            sex: wizardData.sex,
            track: wizardData.track,
            address: wizardData.address,
            contactNumber: wizardData.contactNumber,
            municipality: wizardData.municipality,
            barangay: wizardData.barangay,
            lifecycleStep: 3,
            statusAssessment: 'Pending',
            fundReleased: false,
            fundAmount: isMD ? 15000 : 10000,
            ...(isMD ? {
                enterprise: {
                    name: wizardData.enterpriseName,
                    type: wizardData.enterpriseType,
                    businessLocation: wizardData.businessLocation || `${wizardData.barangay}, ${wizardData.municipality}`
                }
            } : {
                employment: {
                    targetJob: wizardData.targetJob,
                    skillsTraining: wizardData.skillsTraining,
                    preferredEmployer: wizardData.preferredEmployer
                }
            }),
            created_at: new Date().toISOString().split('T')[0]
        };

        if (onAddParticipant) {
            onAddParticipant(newParticipant);
        } else {
            setParticipantList(prev => [newParticipant, ...prev]);
        }

        onClose();
    };

    const handleAdvanceLifecycle = (participantId, currentStep) => {
        setParticipantList(prev => prev.map(item => {
            if (item.id === participantId) {
                const nextStep = Math.min(currentStep + 1, 9);
                let fundReleased = item.fundReleased;
                if (nextStep >= 5) fundReleased = true; 
                return { ...item, lifecycleStep: nextStep, fundReleased };
            }
            return item;
        }));
    };

    const handleOpenDetailModal = (participant) => {
        setViewingParticipant(participant);
        setIsDetailModalOpen(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" 
                onClick={onClose} 
            />

            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10">
                    
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
                        <div>
                            <h2 className="text-base font-bold flex items-center gap-2">
                                <FaUser className="text-emerald-400" /> Register Participant
                            </h2>
                            <p className="text-xs text-slate-300">Step {activeWizardStep} of 3: Track & Profiling</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                            <FaTimes className="text-sm" />
                        </button>
                    </div>

                    {/* Wizard Steps Header */}
                    <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 text-center text-xs font-semibold">
                        <div className={`py-2.5 border-b-2 ${activeWizardStep === 1 ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-slate-400'}`}>
                            1. Track & Profile
                        </div>
                        <div className={`py-2.5 border-b-2 ${activeWizardStep === 2 ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-slate-400'}`}>
                            2. Assessment
                        </div>
                        <div className={`py-2.5 border-b-2 ${activeWizardStep === 3 ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-slate-400'}`}>
                            3. {wizardData.track === 'MD' ? 'Enterprise Plan' : 'Employment Plan'}
                        </div>
                    </div>

                    {/* Wizard Form */}
                    <form onSubmit={handleWizardSubmit} className="p-6 space-y-4">
                        {/* STEP 1 */}
                        {activeWizardStep === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Select SLP Track *</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label 
                                            onClick={() => setWizardData(prev => ({ ...prev, track: 'MD' }))}
                                            className={`p-3 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                                                wizardData.track === 'MD' 
                                                    ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-bold' 
                                                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                            }`}
                                        >
                                            <FaStore className={`text-lg ${wizardData.track === 'MD' ? 'text-emerald-600' : 'text-slate-400'}`} />
                                            <div>
                                                <p className="text-xs font-bold">Micro-Enterprise (MD)</p>
                                                <p className="text-[10px] text-slate-500 font-normal">Seed Capital Fund (SCF)</p>
                                            </div>
                                        </label>

                                        <label 
                                            onClick={() => setWizardData(prev => ({ ...prev, track: 'EF' }))}
                                            className={`p-3 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                                                wizardData.track === 'EF' 
                                                    ? 'border-indigo-500 bg-indigo-50/40 text-indigo-950 font-bold' 
                                                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                            }`}
                                        >
                                            <FaBriefcase className={`text-lg ${wizardData.track === 'EF' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                            <div>
                                                <p className="text-xs font-bold">Employment Facilitation (EF)</p>
                                                <p className="text-[10px] text-slate-500 font-normal">Skills Training / Placement</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={wizardData.fullName}
                                        onChange={e => setWizardData({...wizardData, fullName: e.target.value})}
                                        placeholder="e.g. Maria Santos"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Sex</label>
                                        <select 
                                            value={wizardData.sex}
                                            onChange={e => setWizardData({...wizardData, sex: e.target.value})}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                                        >
                                            <option value="Female">Female</option>
                                            <option value="Male">Male</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Contact Number</label>
                                        <input 
                                            type="text" 
                                            value={wizardData.contactNumber}
                                            onChange={e => setWizardData({...wizardData, contactNumber: e.target.value})}
                                            placeholder="0917xxxxxxx"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Municipality</label>
<select
    value={wizardData.municipality_id}
    onChange={(e) => {
        setWizardData(prev => ({
            ...prev,
            municipality_id: e.target.value,
            barangay_id: ''
        }));
    }}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
    required
>
    <option value="">Select Municipality</option>

    {municipalities.map((municipality) => (
        <option
            key={municipality.id}
            value={municipality.id}
        >
            {municipality.municipality}
        </option>
    ))}
</select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Barangay *</label>
<select
    value={wizardData.barangay_id}
    onChange={(e) => {
        setWizardData(prev => ({
            ...prev,
            barangay_id: e.target.value
        }));
    }}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
    required
    disabled={!wizardData.municipality_id}
>
    <option value="">
        {wizardData.municipality_id
            ? 'Select Barangay'
            : 'Select Municipality First'}
    </option>

    {filteredBarangays.map((barangay) => (
        <option
            key={barangay.barangay_id}
            value={barangay.barangay_id}
        >
            {barangay.barangay_name}
        </option>
    ))}
</select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2 */}
                        {activeWizardStep === 2 && (
                            <div className="space-y-4">
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                                    Assessment ensures participant eligibility under the {wizardData.track === 'MD' ? 'Micro-Enterprise' : 'Employment Facilitation'} track.
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Assessment Notes & Recommendation</label>
                                    <textarea 
                                        rows={4}
                                        value={wizardData.assessmentNotes}
                                        onChange={e => setWizardData({...wizardData, assessmentNotes: e.target.value})}
                                        placeholder="Write field validation details, household status, and capacity notes..."
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 3 */}
                        {activeWizardStep === 3 && (
                            <div className="space-y-4">
                                {wizardData.track === 'MD' ? (
                                    <>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Proposed Individual Enterprise Name *</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={wizardData.enterpriseName}
                                                onChange={e => setWizardData({...wizardData, enterpriseName: e.target.value})}
                                                placeholder="e.g. Maria Variety & Agricultural Supply"
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Enterprise Sector / Category</label>
                                            <select 
                                                value={wizardData.enterpriseType}
                                                onChange={e => setWizardData({...wizardData, enterpriseType: e.target.value})}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                                            >
                                                <option value="Consumer Retail & Trading">Consumer Retail & Trading</option>
                                                <option value="Livestock & Agriculture">Livestock & Agriculture</option>
                                                <option value="Food Processing & Services">Food Processing & Services</option>
                                                <option value="Handicrafts & Manufacturing">Handicrafts & Manufacturing</option>
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Target Occupation / Job Role *</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={wizardData.targetJob}
                                                onChange={e => setWizardData({...wizardData, targetJob: e.target.value})}
                                                placeholder="e.g. TESDA Certified Electrician, Welder, Sales Rep"
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Required Skills Training Program</label>
                                            <input 
                                                type="text" 
                                                value={wizardData.skillsTraining}
                                                onChange={e => setWizardData({...wizardData, skillsTraining: e.target.value})}
                                                placeholder="e.g. SMAW NC II Training, Driving NC II"
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Modal Footer Navigation */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            {activeWizardStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveWizardStep(prev => prev - 1)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                                >
                                    Back
                                </button>
                            ) : <div />}

                            {activeWizardStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveWizardStep(prev => prev + 1)}
                                    className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                                >
                                    Next Step
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                                >
                                    Complete Registration
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
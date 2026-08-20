import { useState, useEffect } from 'react';
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
    FaMapMarkerAlt
} from 'react-icons/fa';

export default function ModalAssociation({ isOpen, onClose, onSubmit }) {
    const [activeWizardStep, setActiveWizardStep] = useState(1);

    // Form State
    const [wizardData, setWizardData] = useState({
        name: '',
        lgu: '',
        barangay: '',
        dateOrganized: '',
        yearImplemented: new Date().getFullYear().toString(),
        officers: {
            president: '',
            vicePresident: '',
            secretary: '',
            treasurer: ''
        },
        members: [],
        enterprise: {
            name: '',
            type: 'Agri-Fishery Processing',
            startDate: ''
        }
    });

    // Temporary state for adding members dynamically in Step 3
    const [tempMember, setTempMember] = useState({
        name: '',
        gender: 'Female',
        contact: '',
        status: 'Active'
    });

    // Reset wizard when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveWizardStep(1);
            setWizardData({
                name: '',
                lgu: '',
                barangay: '',
                dateOrganized: '',
                yearImplemented: new Date().getFullYear().toString(),
                officers: { president: '', vicePresident: '', secretary: '', treasurer: '' },
                members: [],
                enterprise: { name: '', type: 'Agri-Fishery Processing', startDate: '' }
            });
            setTempMember({ name: '', gender: 'Female', contact: '', status: 'Active' });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // --- Handlers ---
    const handleAddMember = () => {
        if (!tempMember.name.trim()) return;
        setWizardData(prev => ({
            ...prev,
            members: [...prev.members, { ...tempMember, id: Date.now() }]
        }));
        setTempMember({ name: '', gender: 'Female', contact: '', status: 'Active' });
    };

    const handleRemoveMember = (id) => {
        setWizardData(prev => ({
            ...prev,
            members: prev.members.filter(m => m.id !== id)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(wizardData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" 
                onClick={onClose} 
            />

            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10">
                    
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
                        <div>
                            <h2 className="text-base font-bold flex items-center gap-2">
                                <FaStore className="text-emerald-400" /> Register Association & Enterprise (MD Modality)
                            </h2>
                            <p className="text-xs text-slate-300">Step {activeWizardStep} of 4: Onboarding Workflow</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Step Progress Indicator */}
                    <div className="bg-slate-50 border-b border-slate-100 px-6 py-3">
                        <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold">
                            <div className={`py-1.5 rounded-lg border ${activeWizardStep === 1 ? 'bg-emerald-500 text-white border-emerald-500' : activeWizardStep > 1 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-white text-slate-400 border-slate-200'}`}>
                                1. Details
                            </div>
                            <div className={`py-1.5 rounded-lg border ${activeWizardStep === 2 ? 'bg-emerald-500 text-white border-emerald-500' : activeWizardStep > 2 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-white text-slate-400 border-slate-200'}`}>
                                2. Officers
                            </div>
                            <div className={`py-1.5 rounded-lg border ${activeWizardStep === 3 ? 'bg-emerald-500 text-white border-emerald-500' : activeWizardStep > 3 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-white text-slate-400 border-slate-200'}`}>
                                3. Members
                            </div>
                            <div className={`py-1.5 rounded-lg border ${activeWizardStep === 4 ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-400 border-slate-200'}`}>
                                4. Enterprise
                            </div>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        
                        {/* STEP 1: Association Profile */}
                        {activeWizardStep === 1 && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <FaBuilding className="text-emerald-600" /> Basic Information
                                </h3>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Association Name *</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="e.g. Kapatagan Farmers Association"
                                        value={wizardData.name}
                                        onChange={(e) => setWizardData({ ...wizardData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">LGU / Municipality *</label>
                                        <select
                                            required
                                            value={wizardData.lgu}
                                            onChange={(e) => setWizardData({ ...wizardData, lgu: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        >
                                            <option value="">Select Municipality</option>
                                            <option value="Kapatagan">Kapatagan</option>
                                            <option value="Baroy">Baroy</option>
                                            <option value="Tubod">Tubod</option>
                                            <option value="Lala">Lala</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Barangay *</label>
                                        <input 
                                            type="text"
                                            required
                                            placeholder="Barangay Poblacion"
                                            value={wizardData.barangay}
                                            onChange={(e) => setWizardData({ ...wizardData, barangay: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Date Organized</label>
                                        <input 
                                            type="date" 
                                            value={wizardData.dateOrganized}
                                            onChange={(e) => setWizardData({ ...wizardData, dateOrganized: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Implementation Year</label>
                                        <input 
                                            type="text" 
                                            value={wizardData.yearImplemented}
                                            onChange={(e) => setWizardData({ ...wizardData, yearImplemented: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Officers Registration */}
                        {activeWizardStep === 2 && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <FaUserTie className="text-emerald-600" /> Association Leadership
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">President</label>
                                        <input 
                                            type="text" 
                                            placeholder="Full Name"
                                            value={wizardData.officers.president}
                                            onChange={(e) => setWizardData({ ...wizardData, officers: { ...wizardData.officers, president: e.target.value } })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Vice President</label>
                                        <input 
                                            type="text" 
                                            placeholder="Full Name"
                                            value={wizardData.officers.vicePresident}
                                            onChange={(e) => setWizardData({ ...wizardData, officers: { ...wizardData.officers, vicePresident: e.target.value } })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Secretary</label>
                                        <input 
                                            type="text" 
                                            placeholder="Full Name"
                                            value={wizardData.officers.secretary}
                                            onChange={(e) => setWizardData({ ...wizardData, officers: { ...wizardData.officers, secretary: e.target.value } })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Treasurer</label>
                                        <input 
                                            type="text" 
                                            placeholder="Full Name"
                                            value={wizardData.officers.treasurer}
                                            onChange={(e) => setWizardData({ ...wizardData, officers: { ...wizardData.officers, treasurer: e.target.value } })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Member Onboarding */}
                        {activeWizardStep === 3 && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <FaUsers className="text-emerald-600" /> Onboard Members ({wizardData.members.length})
                                </h3>
                                
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                    <div className="grid grid-cols-3 gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Member Name"
                                            value={tempMember.name}
                                            onChange={(e) => setTempMember({ ...tempMember, name: e.target.value })}
                                            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                                        />
                                        <select
                                            value={tempMember.gender}
                                            onChange={(e) => setTempMember({ ...tempMember, gender: e.target.value })}
                                            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                                        >
                                            <option value="Female">Female</option>
                                            <option value="Male">Male</option>
                                        </select>
                                        <input 
                                            type="text" 
                                            placeholder="Contact #"
                                            value={tempMember.contact}
                                            onChange={(e) => setTempMember({ ...tempMember, contact: e.target.value })}
                                            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddMember}
                                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                                    >
                                        <FaPlus className="text-[10px]" /> Add Member
                                    </button>
                                </div>

                                <div className="max-h-40 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                                    {wizardData.members.length === 0 ? (
                                        <p className="text-xs text-slate-400 text-center py-4">No members added yet.</p>
                                    ) : (
                                        wizardData.members.map((m) => (
                                            <div key={m.id} className="pt-1.5 flex items-center justify-between text-xs">
                                                <div>
                                                    <span className="font-semibold text-slate-800">{m.name}</span>
                                                    <span className="text-[10px] text-slate-400 ml-2">({m.gender} • {m.contact || 'N/A'})</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMember(m.id)}
                                                    className="text-slate-400 hover:text-rose-600 p-1"
                                                >
                                                    <FaTrash className="text-[10px]" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Enterprise Setup */}
                        {activeWizardStep === 4 && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <FaStore className="text-emerald-600" /> Community Enterprise Profile
                                </h3>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Enterprise Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Organic Crop Processing Enterprise"
                                        value={wizardData.enterprise.name}
                                        onChange={(e) => setWizardData({ ...wizardData, enterprise: { ...wizardData.enterprise, name: e.target.value } })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Enterprise Type</label>
                                        <select
                                            value={wizardData.enterprise.type}
                                            onChange={(e) => setWizardData({ ...wizardData, enterprise: { ...wizardData.enterprise, type: e.target.value } })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        >
                                            <option value="Agri-Fishery Processing">Agri-Fishery Processing</option>
                                            <option value="Agriculture Processing & Trading">Agriculture Processing & Trading</option>
                                            <option value="Service Enterprise">Service Enterprise</option>
                                            <option value="Retail Trading">Retail Trading</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Target Start Date</label>
                                        <input 
                                            type="date" 
                                            value={wizardData.enterprise.startDate}
                                            onChange={(e) => setWizardData({ ...wizardData, enterprise: { ...wizardData.enterprise, startDate: e.target.value } })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer Controls */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            {activeWizardStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveWizardStep(prev => prev - 1)}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                                >
                                    <FaChevronLeft className="text-[10px]" /> Back
                                </button>
                            ) : (
                                <div />
                            )}

                            {activeWizardStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveWizardStep(prev => prev + 1)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer ml-auto"
                                >
                                    Next Step <FaChevronRight className="text-[10px]" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer ml-auto"
                                >
                                    <FaCheckCircle /> Complete Registration
                                </button>
                            )}
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}